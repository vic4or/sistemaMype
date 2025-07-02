import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AsociarProveedorDto } from './dto/asociar-proveedor.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
  const categoria = await this.prisma.cfg_categorias_material.findUnique({
    where: { categoria_material_id: dto.categoria_material_id },
  });
  if (!categoria) throw new NotFoundException('Categoría no encontrada');

  if (categoria.tiene_color && !dto.color_id)
    throw new BadRequestException('Se requiere color para esta categoría');
  if (categoria.tiene_talla && !dto.talla_id)
    throw new BadRequestException('Se requiere talla para esta categoría');

  // Buscar si existe una configuración de presentación para esta categoría
  const presentacion = await this.prisma.cfg_presentaciones_categoria.findFirst({
    where: { categoria_material_id: dto.categoria_material_id },
  });

  // Construir el objeto base
  let data: any = {
    ...dto,
    stock_actual: 0,
    estado: true,
    fecha_creacion: new Date(),
    usuario_creacion: 'admin',
  };

  // Si hay presentación definida, completar campos automáticamente
  if (presentacion) {
    data.unidad_medida_id = presentacion.unidad_compra_id;
    data.unidad_consumo_id = presentacion.unidad_consumo_id;
    data.factor_conversion_compra = presentacion.factor_conversion;
  }

    return this.prisma.mat_materiales.create({ data });
  }

  findAll() {
    return this.prisma.mat_materiales.findMany({
      include: { cfg_categorias_material: true, cfg_tallas: true, cfg_colores: true, mat_materiales_prov: true },
    });
  }

  findOne(id: number) {
    return this.prisma.mat_materiales.findUnique({
      where: { material_id: id },
      include: { cfg_categorias_material: true, cfg_tallas: true, cfg_colores: true, mat_materiales_prov: true },
    });
  }

  update(id: number, dto: CreateMaterialDto) {
    return this.prisma.mat_materiales.update({
      where: { material_id: id },
      data: { ...dto, fecha_modificacion: new Date(), usuario_modificacion: 'admin' },
    });
  }

  remove(id: number) {
    return this.prisma.mat_materiales.update({
      where: { material_id: id },
      data: { estado: false, fecha_modificacion: new Date(), usuario_modificacion: 'admin' },
    });
  }

  asociarProveedor(material_id: number, dto: AsociarProveedorDto) {
    return this.prisma.mat_materiales_prov.create({
      data: {
        ...dto,
        material_id,
        estado: true,
        fecha_creacion: new Date(),
        usuario_creacion: 'admin',
      },
    });
  }

  listarProveedores(material_id: number) {
  return this.prisma.mat_materiales.findUnique({
    where: { material_id },
    include: {
      cfg_categorias_material: true,
      cfg_tallas: true,
      cfg_colores: true,
      cfg_unidades_medida: true,
      cfg_unidades_medida_mat_materiales_unidad_consumo_idTocfg_unidades_medida: true,
      mat_materiales_prov: {
        where: { estado: true },
        include: {
          pro_proveedores: true,
        },
      },
    },
  });
}

  actualizarProveedor(mat_prov_id: number, dto: AsociarProveedorDto) {
    return this.prisma.mat_materiales_prov.update({
      where: { mat_prov_id },
      data: { ...dto, fecha_modificacion: new Date(), usuario_modificacion: 'admin' },
    });
  }

  async verificarRelacionProveedor(material_id: number, proveedor_id: number) {
  return this.prisma.mat_materiales_prov.findFirst({
    where: {
      material_id,
      proveedor_id,
      estado: true,
    },
    });
  }

  async findByCategoria(categoria_material_id: number) {
  return this.prisma.mat_materiales.findMany({
    where: {
      categoria_material_id,
      estado: true,
    },
    include: {
      cfg_categorias_material: true,
      cfg_tallas: true,
      cfg_colores: true,
      mat_materiales_prov: true,
    },
  });
}
}