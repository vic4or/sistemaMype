import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenCompraDto, CreateOrdenCompraDetalleDto } from './dto/create-orden-compra.dto';
import { UpdateOrdenCompraDto } from './dto/update-orden-compra.dto';
import { UpdateEstadoOrdenCompraDto } from './dto/update-estado-orden-compra.dto';

@Injectable()
export class OrdenCompraService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrdenCompraDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verificar que el proveedor existe
      const proveedor = await tx.pro_proveedores.findUnique({
        where: { proveedor_id: dto.proveedor_id },
      });
      if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
      
      const ultimo = await this.prisma.cmp_ordenes_compra.findFirst({
        orderBy: { orden_compra_id: 'desc' },
      });

      const nuevoNumero = `OC-${(ultimo?.orden_compra_id ?? 0) + 1}`;
      // Crear la orden de compra
      const ordenCompra = await tx.cmp_ordenes_compra.create({
        data: {
          proveedor_id: dto.proveedor_id,
          numero_oc: nuevoNumero,
          fecha_emision_oc: new Date(dto.fecha_emision_oc),
          fecha_esperada: new Date(dto.fecha_esperada),
          nota: dto.nota,
          estado_oc: 'PENDIENTE',
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
          estado: true,
        },
      });

      // Crear los detalles
      const detalles = await Promise.all(
        dto.items.map(async (item) => {
          // Verificar que el material existe
          const material = await tx.mat_materiales.findUnique({
            where: { material_id: item.material_id },
          });
          if (!material) throw new NotFoundException(`Material con ID ${item.material_id} no encontrado`);

          const subtotal = Number(item.cantidad) * Number(item.precio_unitario);

          return tx.cmp_ordenes_compra_det.create({
            data: {
              orden_compra_id: ordenCompra.orden_compra_id,
              material_id: item.material_id,
              cantidad_pedida: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal,
              cantidad_recibida: 0,
              estado_linea_oc: 'PENDIENTE',
              fecha_creacion: new Date(),
              fecha_modificacion: new Date(),
              estado: true,
            },
          });
        })
      );

      // Calcular y actualizar el monto total
      const montoTotal = detalles.reduce((sum, d) => sum + (d.subtotal?.toNumber() ?? 0), 0);

      await tx.cmp_ordenes_compra.update({
        where: { orden_compra_id: ordenCompra.orden_compra_id },
        data: { monto_total_oc: montoTotal },
      });

      return { ...ordenCompra, detalles };
    });
  }

  async findAll() {
    return await this.prisma.cmp_ordenes_compra.findMany({
      where: { estado: true },
      include: {
        pro_proveedores: {
          select: {
            proveedor_id: true,
            razon_social: true,
            ruc: true,
          },
        },
        cmp_ordenes_compra_det: {
          where: { estado: true },
          include: {
            mat_materiales: {
              select: {
                codigo_material: true,
                descripcion_material: true,
              },
            },
          },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const orden = await this.prisma.cmp_ordenes_compra.findUnique({
      where: { orden_compra_id: id },
      include: {
        pro_proveedores: true,
        cmp_ordenes_compra_det: {
          where: { estado: true },
          include: {
            mat_materiales: true,
          },
        },
      },
    });

    if (!orden) throw new NotFoundException('Orden de compra no encontrada');
    return orden;
  }

  async findDetalle(id: number) {
    return this.prisma.cmp_ordenes_compra_det.findMany({
      where: { orden_compra_id: id, estado: true },
      include: {
        mat_materiales: true,
      },
    });
  }

  async addDetalle(id: number, dto: CreateOrdenCompraDetalleDto) {
    const orden = await this.findOne(id);
    if (orden.estado_oc && ['ENTREGADA', 'CANCELADA'].includes(orden.estado_oc)) {
      throw new BadRequestException('No se puede modificar una orden entregada o cancelada');
    }

    // Verificar que el material existe
    const material = await this.prisma.mat_materiales.findUnique({
      where: { material_id: dto.material_id },
    });
    if (!material) throw new NotFoundException('Material no encontrado');

    // Verificar si ya existe el material en la orden
    const existente = await this.prisma.cmp_ordenes_compra_det.findFirst({
      where: { 
        orden_compra_id: id, 
        material_id: dto.material_id,
        estado: true 
      },
    });
    if (existente) throw new ConflictException('Material ya agregado a la orden');

    const subtotal = Number(dto.cantidad) * Number(dto.precio_unitario);
    await this.prisma.cmp_ordenes_compra_det.create({
      data: {
        orden_compra_id: id,
        material_id: dto.material_id,
        cantidad_pedida: dto.cantidad,
        precio_unitario: dto.precio_unitario,
        subtotal,
        cantidad_recibida: 0,
        estado_linea_oc: 'PENDIENTE',
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        estado: true,
      },
    });

    return this.recalcularTotales(id);
  }

  async updateDetalle(id: number, detalleId: number, dto: CreateOrdenCompraDetalleDto) {
    const orden = await this.findOne(id);
    if (orden.estado_oc && ['ENTREGADA', 'CANCELADA'].includes(orden.estado_oc)) {
      throw new BadRequestException('No se puede modificar una orden entregada o cancelada');
    }

    const detalle = await this.prisma.cmp_ordenes_compra_det.findUnique({
      where: { oc_detalle_id: detalleId },
    });
    if (!detalle) throw new NotFoundException('Detalle no encontrado');

    // Verificar que el material existe
    const material = await this.prisma.mat_materiales.findUnique({
      where: { material_id: dto.material_id },
    });
    if (!material) throw new NotFoundException('Material no encontrado');

    const subtotal = Number(dto.cantidad) * Number(dto.precio_unitario);
    await this.prisma.cmp_ordenes_compra_det.update({
      where: { oc_detalle_id: detalleId },
      data: {
        material_id: dto.material_id,
        cantidad_pedida: dto.cantidad,
        precio_unitario: dto.precio_unitario,
        subtotal,
        fecha_modificacion: new Date(),
      },
    });

    return this.recalcularTotales(id);
  }

  async update(id: number, dto: UpdateOrdenCompraDto) {
    await this.findOne(id);
    return this.prisma.cmp_ordenes_compra.update({
      where: { orden_compra_id: id },
      data: {
        ...dto,
        ...(dto.fecha_emision_oc && { fecha_emision_oc: new Date(dto.fecha_emision_oc) }),
        ...(dto.fecha_esperada && { fecha_esperada: new Date(dto.fecha_esperada) }),
        fecha_modificacion: new Date(),
      },
    });
  }

  async updateEstado(id: number, dto: UpdateEstadoOrdenCompraDto) {
    await this.findOne(id);
    return this.prisma.cmp_ordenes_compra.update({
      where: { orden_compra_id: id },
      data: {
        estado_oc: dto.estado_oc,
        fecha_modificacion: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cmp_ordenes_compra.update({
      where: { orden_compra_id: id },
      data: { estado: false, fecha_modificacion: new Date() },
    });
  }

  async removeDetalle(id: number, detalleId: number) {
    const orden = await this.findOne(id);
    if (orden.estado_oc && ['ENTREGADA', 'CANCELADA'].includes(orden.estado_oc)) {
      throw new BadRequestException('No se puede modificar una orden entregada o cancelada');
    }

    await this.prisma.cmp_ordenes_compra_det.update({
      where: { oc_detalle_id: detalleId },
      data: { estado: false, fecha_modificacion: new Date() },
    });
    return this.recalcularTotales(id);
  }

  private async recalcularTotales(ordenId: number) {
    const detalles = await this.prisma.cmp_ordenes_compra_det.findMany({
      where: { orden_compra_id: ordenId, estado: true },
    });
    
    const montoTotal = detalles.reduce((sum, d) => sum + (d.subtotal?.toNumber() ?? 0), 0);

    return this.prisma.cmp_ordenes_compra.update({
      where: { orden_compra_id: ordenId },
      data: { monto_total_oc: montoTotal, fecha_modificacion: new Date() },
    });
  }
}