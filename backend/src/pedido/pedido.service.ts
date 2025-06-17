import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto, CreatePedidoDetalleDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePedidoDto) {
    return this.prisma.$transaction(async (tx) => {
      const cabecera = await tx.ped_pedidos_cliente.create({
        data: {
          cliente_id: dto.cliente_id,
          producto_id: dto.producto_id,
          fecha_pedido: new Date(dto.fecha_pedido),
          fecha_entrega: new Date(dto.fecha_entrega),
          direccion_envio: dto.direccion_envio,
          observaciones: dto.observaciones,
          estado_pedido: 'PENDIENTE',
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
          estado: true,
        },
      });

      const detalles = await Promise.all(
        dto.detalles.map(async (item) => {
          const combinacion = await tx.prd_producto_talla_color.findUnique({
            where: { producto_tal_col_id: item.producto_tal_col_id },
          });
          if (!combinacion) throw new NotFoundException('Combinación no encontrada');
          if (combinacion.precio_venta === null) throw new BadRequestException('La combinación no tiene un precio asignado');

          const subtotal = combinacion.precio_venta.toNumber() * item.cantidad_solicitada;

          return tx.ped_pedidos_cliente_det.create({
            data: {
              pedido_cliente_id: cabecera.pedido_cliente_id,
              producto_tal_col_id: item.producto_tal_col_id,
              cantidad_solicitada: item.cantidad_solicitada,
              precio: combinacion.precio_venta,
              subtotal,
              fecha_creacion: new Date(),
              fecha_modificacion: new Date(),
              estado: true,
            },
          });
        })
      );

      const cantidad = detalles.reduce((sum, d) => sum + (d.cantidad_solicitada ?? 0), 0);
      const total = detalles.reduce((sum, d) => sum + (d.subtotal?.toNumber() ?? 0), 0);

      await tx.ped_pedidos_cliente.update({
        where: { pedido_cliente_id: cabecera.pedido_cliente_id },
        data: { cantidad, total },
      });

      return { ...cabecera, detalles };
    });
  }

  async findAll() {
    return await this.prisma.ped_pedidos_cliente.findMany({})
  }

  async findOne(id: number) {
  const pedido = await this.prisma.ped_pedidos_cliente.findUnique({
    where: { pedido_cliente_id: id },
    include: {
      cli_clientes: true,
      prd_productos: true,
      ped_pedidos_cliente_det: {
        include: {
          prd_producto_talla_color: {
            include: {
              cfg_colores: true,
              cfg_tallas: true,
            },
          },
        },
      },
    },
  });

  if (!pedido) throw new NotFoundException('Pedido no encontrado');
  return pedido;
  }

  async findDetalle(id: number) {
    return this.prisma.ped_pedidos_cliente_det.findMany({
      where: { pedido_cliente_id: id, estado: true },
    });
  }

  async addDetalle(id: number, dto: CreatePedidoDetalleDto) {
    const pedido = await this.findOne(id);
    if (pedido.estado_pedido && ['COMPLETADO', 'ANULADO'].includes(pedido.estado_pedido)) {
        throw new BadRequestException('No se puede modificar un pedido completado o anulado');
      }

    const combinacion = await this.prisma.prd_producto_talla_color.findUnique({
      where: { producto_tal_col_id: dto.producto_tal_col_id },
    });
    if (!combinacion) throw new NotFoundException('Combinación no encontrada');
    if (combinacion.precio_venta === null) throw new BadRequestException('La combinación no tiene un precio asignado');

    const existente = await this.prisma.ped_pedidos_cliente_det.findFirst({
      where: { pedido_cliente_id: id, producto_tal_col_id: dto.producto_tal_col_id },
    });
    if (existente) throw new ConflictException('Combinación ya agregada');

    const subtotal = combinacion.precio_venta.toNumber() * dto.cantidad_solicitada;
    await this.prisma.ped_pedidos_cliente_det.create({
      data: {
        pedido_cliente_id: id,
        producto_tal_col_id: dto.producto_tal_col_id,
        cantidad_solicitada: dto.cantidad_solicitada,
        precio: combinacion.precio_venta,
        subtotal,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
        estado: true,
      },
    });

    return this.recalcularTotales(id);
  }

  async updateDetalle(id: number, detalleId: number, dto: CreatePedidoDetalleDto) {
    const pedido = await this.findOne(id);

    if (pedido.estado_pedido && ['COMPLETADO', 'ANULADO'].includes(pedido.estado_pedido)) {
        throw new BadRequestException('No se puede modificar un pedido completado o anulado');
    }

    const detalle = await this.prisma.ped_pedidos_cliente_det.findUnique({
      where: { ped_cliente_det_id: detalleId },
    });
    if (!detalle) throw new NotFoundException('Detalle no encontrado');

    const combinacion = await this.prisma.prd_producto_talla_color.findUnique({
      where: { producto_tal_col_id: dto.producto_tal_col_id },
    });
    if (!combinacion) throw new NotFoundException('Combinación no encontrada');
    if (combinacion.precio_venta === null) throw new BadRequestException('La combinación no tiene un precio asignado');

    const subtotal = combinacion.precio_venta.toNumber() * dto.cantidad_solicitada;
    await this.prisma.ped_pedidos_cliente_det.update({
      where: { ped_cliente_det_id: detalleId },
      data: {
        producto_tal_col_id: dto.producto_tal_col_id,
        cantidad_solicitada: dto.cantidad_solicitada,
        precio: combinacion.precio_venta,
        subtotal,
        fecha_modificacion: new Date(),
      },
    });

    return this.recalcularTotales(id);
  }

  async update(id: number, dto: UpdatePedidoDto) {
    await this.findOne(id);
    return this.prisma.ped_pedidos_cliente.update({
      where: { pedido_cliente_id: id },
      data: {
        ...dto,
        fecha_modificacion: new Date(),
      },
    });
  }

  async updateEstado(id: number, dto: UpdateEstadoPedidoDto) {
    await this.findOne(id);
    return this.prisma.ped_pedidos_cliente.update({
      where: { pedido_cliente_id: id },
      data: {
        estado_pedido: dto.estado_pedido,
        fecha_modificacion: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ped_pedidos_cliente.update({
      where: { pedido_cliente_id: id },
      data: { estado: false, fecha_modificacion: new Date() },
    });
  }

  async removeDetalle(id: number, detalleId: number) {
    const pedido = await this.findOne(id);
    if (pedido.estado_pedido && ['COMPLETADO', 'ANULADO'].includes(pedido.estado_pedido)) {
        throw new BadRequestException('No se puede modificar un pedido completado o anulado');
    }

    await this.prisma.ped_pedidos_cliente_det.update({
      where: { ped_cliente_det_id: detalleId },
      data: { estado: false, fecha_modificacion: new Date() },
    });
    return this.recalcularTotales(id);
  }

  private async recalcularTotales(pedidoId: number) {
    const lineas = await this.prisma.ped_pedidos_cliente_det.findMany({
      where: { pedido_cliente_id: pedidoId, estado: true },
    });
    const cantidad = lineas.reduce((sum, l) => sum + (l.cantidad_solicitada ?? 0), 0);
    const total = lineas.reduce((sum, l) => sum + (l.subtotal?.toNumber() ?? 0), 0);

    return this.prisma.ped_pedidos_cliente.update({
      where: { pedido_cliente_id: pedidoId },
      data: { cantidad, total, fecha_modificacion: new Date() },
    });
  }
}