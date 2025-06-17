import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateCombinacionDto } from './dto/create-combinacion.dto';
import { UpdateCombinacionDto } from './dto/update-combinacion.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductoDto) {
    return this.prisma.prd_productos.create({
      data: {
        ...dto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.prd_productos.findMany();
  }

  async findOne(id: number) {
    const producto = await this.prisma.prd_productos.findUnique({ where: { producto_id: id } });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return producto;
  }

  async findCombinaciones(productoId: number) {
    await this.findOne(productoId);
    return this.prisma.prd_producto_talla_color.findMany({
      where: { producto_id: productoId, estado: true },
      include: { cfg_colores: true, cfg_tallas: true },
    });
  }

  async createCombinacion(dto: CreateCombinacionDto) {
    return this.prisma.prd_producto_talla_color.create({
      data: {
        ...dto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      },
    });
  }

  async createVariantes(productoId: number, variantes: CreateCombinacionDto[]) {
    const data = variantes.map(v => ({
      ...v,
      producto_id: productoId,
      estado: true,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date(),
    }));
    return this.prisma.prd_producto_talla_color.createMany({ data });
  }

  async updateCombinacion(id: number, dto: UpdateCombinacionDto) {
    return this.prisma.prd_producto_talla_color.update({
      where: { producto_tal_col_id: id },
      data: { ...dto, fecha_modificacion: new Date() },
    });
  }

  async removeCombinacion(id: number) {
    return this.prisma.prd_producto_talla_color.update({
      where: { producto_tal_col_id: id },
      data: { estado: false, fecha_modificacion: new Date() },
    });
  }

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.prd_productos.update({
      where: { producto_id: id },
      data: { ...dto, fecha_modificacion: new Date() },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.prd_productos.update({
      where: { producto_id: id },
      data: { estado: false, fecha_modificacion: new Date() },
    });
  }
}