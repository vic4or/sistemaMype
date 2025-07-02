import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarEntradaOCDto } from './dto/registrar-oc.dto';
import { RegistrarMovimientoManualDto } from './dto/registrar-manual.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) {}

  async listarTodos() {
  return this.prisma.inv_movimientos_stock.findMany({
    where: { estado: true },
    orderBy: { fecha_movimiento: 'desc' },
    include: {
      mat_materiales: {
        select: {
          descripcion_material: true,
          codigo_material: true,
          unidad_medida_id: true,
        },
      },
      cmp_ordenes_compra_det: {
        select: {
          orden_compra_id: true,
          cantidad_pedida: true,
          cmp_ordenes_compra: {
            select: {
                numero_oc: true,
            },
            },
        },
      },
    },
  });
}

  async registrarEntradaPorOC(dto: RegistrarEntradaOCDto) {
    const operaciones: Prisma.PrismaPromise<any>[] = [];
    let ordenCompraId: number | null = null;

    for (const item of dto.items) {
      const detalleOC = await this.prisma.cmp_ordenes_compra_det.findUnique({
        where: { oc_detalle_id: item.oc_detalle_id },
      });
      if (!detalleOC) throw new NotFoundException('Detalle de OC no encontrado');
      ordenCompraId = detalleOC.orden_compra_id;
      if (!ordenCompraId) throw new BadRequestException('Detalle sin orden de compra asociada');

      if (!detalleOC.material_id) {
        throw new BadRequestException('El detalle de OC no tiene material asignado');
        }

        const material = await this.prisma.mat_materiales.findUnique({
        where: { material_id: detalleOC.material_id },
        });
      if (!material) throw new NotFoundException('Material no encontrado');

      const categoriaId = material.categoria_material_id;
      if (!categoriaId) throw new BadRequestException('El material no tiene categoría asignada');

      const presentacion = await this.prisma.cfg_presentaciones_categoria.findFirst({
        where: {
          categoria_material_id: categoriaId,
        },
      });
      if (!presentacion) throw new BadRequestException('No se encontró presentación activa para la categoría');

      const factor = Number(presentacion.factor_conversion ?? 1);
      const cantidadReal = Number(item.cantidad_recibida) * factor;

      const stockAnterior = material.stock_actual?.toNumber() ?? 0;
      const stockNuevo = stockAnterior + cantidadReal;
      
      // Nueva cantidad acumulada
        const cantidadRecibidaActual = detalleOC.cantidad_recibida?.toNumber() ?? 0;
        const nuevaCantidadRecibida = cantidadRecibidaActual + Number(item.cantidad_recibida);
        if (!detalleOC.cantidad_pedida) {
        throw new BadRequestException('El detalle no tiene cantidad pedida registrada');
        }

        const cantidadPedida = detalleOC.cantidad_pedida.toNumber();

        const detalleCompletado = nuevaCantidadRecibida >= cantidadPedida;

      operaciones.push(
    this.prisma.mat_materiales.update({
      where: { material_id: material.material_id },
      data: { stock_actual: stockNuevo },
    }),
    this.prisma.inv_movimientos_stock.create({
      data: {
        material_id: material.material_id,
        fecha_movimiento: new Date(dto.fecha_movimiento),
        tipo_movimiento: 'Entrada',
        cantidad_movimiento: cantidadReal,
        oc_detalle_id: item.oc_detalle_id,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        usuario_creacion: dto.usuario,
      },
    }),
    this.prisma.cmp_ordenes_compra_det.update({
      where: { oc_detalle_id: item.oc_detalle_id },
      data: {
        cantidad_recibida: nuevaCantidadRecibida,
        nota_discrepancia: item.nota_discrepancia ?? null,
        estado_linea_oc: detalleCompletado ? 'COMPLETADO' : 'PARCIAL',
      },
        })
    );    
    }

    await this.prisma.$transaction(operaciones);
    if (ordenCompraId !== null) {
        await this.verificarEstadoOC(ordenCompraId);}

  }

  private async verificarEstadoOC(ordenCompraId: number) {
    const detalles = await this.prisma.cmp_ordenes_compra_det.findMany({
        where: { orden_compra_id: ordenCompraId, estado: true },
        select: {
        cantidad_pedida: true,
        cantidad_recibida: true,
        },
    });

    const todosCompletados = detalles.every(d => {
        if (!d.cantidad_pedida) return false;
        const recibida = d.cantidad_recibida?.toNumber() ?? 0;
        const pedida = d.cantidad_pedida.toNumber();
        return recibida >= pedida;
    });

    if (todosCompletados) {
        await this.prisma.cmp_ordenes_compra.update({
        where: { orden_compra_id: ordenCompraId },
        data: { estado_oc: 'COMPLETADO' },
        });
    }
    }

  async registrarMovimientoManual(dto: RegistrarMovimientoManualDto) {
    const material = await this.prisma.mat_materiales.findUnique({
      where: { material_id: dto.material_id },
    });
    if (!material) throw new NotFoundException('Material no encontrado');

    const categoriaId = material.categoria_material_id;
    if (!categoriaId) throw new BadRequestException('El material no tiene categoría asignada');

    const presentacion = await this.prisma.cfg_presentaciones_categoria.findFirst({
      where: {
        categoria_material_id: categoriaId,
      },
    });
    if (!presentacion) throw new BadRequestException('No se encontró presentación activa para la categoría');

    const factor = Number(presentacion.factor_conversion ?? 1);

    let cantidadReal: number;

    if (dto.tipo_movimiento === 'Entrada') {
    cantidadReal = Number(dto.cantidad) * factor;
    } else {
    cantidadReal = Number(dto.cantidad);
    }

    const stockAnterior = material.stock_actual?.toNumber() ?? 0;
    let stockNuevo = stockAnterior;

    switch (dto.tipo_movimiento) {
      case 'Entrada':
        stockNuevo += cantidadReal;
        break;
      case 'Salida':
        stockNuevo -= cantidadReal;
        if (stockNuevo < 0) throw new BadRequestException('Stock insuficiente');
        break;
      case 'Ajuste':
        stockNuevo = cantidadReal;
        break;
      default:
        throw new BadRequestException('Tipo de movimiento inválido');
    }

    return this.prisma.$transaction([
      this.prisma.mat_materiales.update({
        where: { material_id: dto.material_id },
        data: { stock_actual: stockNuevo },
      }),
      this.prisma.inv_movimientos_stock.create({
        data: {
          material_id: dto.material_id,
          fecha_movimiento: new Date(dto.fecha_movimiento),
          tipo_movimiento: dto.tipo_movimiento,
          cantidad_movimiento: cantidadReal,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          usuario_creacion: dto.usuario,
        },
      }),
    ]);
  }
}