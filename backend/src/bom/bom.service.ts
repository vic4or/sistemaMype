import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearBOMComunDto, CrearBOMVariacionDto } from './dto/create-bom.dto';

@Injectable()
export class BomService {
  constructor(private readonly prisma: PrismaService) {}

  async guardarMaterialesBase(dto: CrearBOMComunDto) {
  return this.prisma.prd_bom_items_base.createMany({
    data: dto.items.map(item => ({
      ...item,
      fecha_creacion: new Date(),
      usuario_creacion: dto.usuario,
    })),
    skipDuplicates: true,
  });
  }

  async guardarVariaciones(dto: CrearBOMVariacionDto) {
    return this.prisma.prd_bom_variaciones.createMany({
      data: dto.items.map(item => ({
        ...item,
        fecha_creacion: new Date(),
        usuario_creacion: dto.usuario,
      })),
      skipDuplicates: true,
    });
  }

  async obtenerBasePorProducto(producto_id: number) {
    return this.prisma.prd_bom_items_base.findMany({
      where: { producto_id, estado: true },
      include: { mat_materiales: true, cfg_unidades_medida: true },
    });
  }

  async obtenerVariacionesPorProducto(producto_id: number) {
    return this.prisma.prd_bom_variaciones.findMany({
      where: {
        prd_producto_talla_color: {
          producto_id,
        },
        estado: true,
      },
      include: { mat_materiales: true, cfg_unidades_medida: true },
    });
  }
}