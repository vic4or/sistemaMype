import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EjecutarPlanDto } from './dto/ejecutar-plan.dto';
import { AprobarSugerenciasDto } from './dto/aprobar-sugerencias.dto';

@Injectable()
export class PlanificadorService {
  constructor(private prisma: PrismaService) {}

  private registrarNecesidad(
    mapa: Map<number, { total: number; fechas_entrega: Date[] }>,
    material_id: number,
    cantidad: number,
    fechaEntrega?: Date
  ) {
    if (!material_id || cantidad <= 0) return;

    const anterior = mapa.get(material_id);
    const fechas = anterior?.fechas_entrega || [];

    const nuevaFecha = fechaEntrega ? new Date(fechaEntrega) : null;

    mapa.set(material_id, {
      total: (anterior?.total || 0) + cantidad,
      fechas_entrega: nuevaFecha ? [...fechas, nuevaFecha] : fechas,
    });
  }

  private agruparFechas(fechas: Date[], toleranciaDias = 1): Date[][] {
    const fechasOrdenadas = [...fechas].sort((a, b) => a.getTime() - b.getTime());
    const grupos: Date[][] = [];

    for (const fecha of fechasOrdenadas) {
      let agregado = false;
      for (const grupo of grupos) {
        const ultima = grupo[grupo.length - 1];
        const diffDias = Math.abs((fecha.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias <= toleranciaDias) {
          grupo.push(fecha);
          agregado = true;
          break;
        }
      }
      if (!agregado) grupos.push([fecha]);
    }

    return grupos;
  }

  async ejecutarPlanificacion(dto: EjecutarPlanDto) {
    const { fecha_inicio, fecha_fin } = dto;
    const pedidos = await this.prisma.ped_pedidos_cliente.findMany({
      where: {
        fecha_entrega: { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) },
        estado_pedido: 'PENDIENTE',
      },
      include: {
        ped_pedidos_cliente_det: true,
      },
    });

    const corrida = await this.prisma.cmp_corridas_planificacion.create({
      data: { fecha_ejecucion_plan: new Date() },
    });

    // Estructura: { material_id: { total: number, fechas_entrega: Date[] } }
    const necesidadesBrutas = new Map<number, { total: number; fechas_entrega: Date[] }>();
    const tiempoProduccionDias = 3;

    for (const pedido of pedidos) {
      
      const materialesRegistradosEnEstePedido = new Set<number>();
      await this.prisma.cmp_corridas_planificacion_pedido.create({
        data: {
          corrida_plan_id: corrida.corrida_plan_id,
          pedido_cliente_id: pedido.pedido_cliente_id,
        },
      });

      const bomBase = await this.prisma.prd_bom_items_base.findMany({
        where: { producto_id: pedido.producto_id },
      });

      for (const item of bomBase) {
        if (!item.material_id) continue;

        let cantidadBase = Number(item.cantidad_consumo_base) * Number(pedido.cantidad); // 👈 USAR CANTIDAD DEL PEDIDO

        const material = await this.prisma.mat_materiales.findUnique({
          where: { material_id: item.material_id },
          include: { cfg_categorias_material: true },
        });

        const merma = Number(material?.cfg_categorias_material?.porcentaje_merma || 0);
        cantidadBase *= 1 + merma / 100;

        if (material?.cfg_categorias_material?.nombre_categoria?.toLowerCase() === 'tela') {
          const rendimiento = Number(material?.rendimiento_tela || 1);
          cantidadBase /= rendimiento;
        }

        const existente = necesidadesBrutas.get(item.material_id) || { total: 0, fechas_entrega: [] };
        necesidadesBrutas.set(item.material_id, {
          total: existente.total + cantidadBase,
          fechas_entrega: [...existente.fechas_entrega, pedido.fecha_entrega ? new Date(pedido.fecha_entrega) : new Date()],
        });
      }

      for (const linea of pedido.ped_pedidos_cliente_det) {
        if (!linea.producto_tal_col_id || !linea.cantidad_solicitada) continue;

        // BOM base por producto
        const productoTallaColor = await this.prisma.prd_producto_talla_color.findUnique({
          where: { producto_tal_col_id: linea.producto_tal_col_id },
        });
        
        if (!productoTallaColor) continue;

        // BOM variaciones por SKU
        const bomVariaciones = await this.prisma.prd_bom_variaciones.findMany({
          where: {
            prd_producto_talla_color: {
              producto_tal_col_id: linea.producto_tal_col_id,
            },
          },
        });

        for (const item of bomVariaciones) {
          if (!item.material_id) continue;
          let cantidad = linea.cantidad_solicitada * Number(item.cantidad_consumo_especifica);

          const material = await this.prisma.mat_materiales.findUnique({
            where: { material_id: item.material_id },
            include: { cfg_categorias_material: true },
          });

          const merma = Number(material?.cfg_categorias_material?.porcentaje_merma || 0);
          cantidad *= 1 + merma / 100;

          if (material?.cfg_categorias_material?.nombre_categoria?.toLowerCase() === 'tela') {
            const rendimiento = Number(material?.rendimiento_tela || 1);
            cantidad /= rendimiento;
          }

          const yaRegistrado = materialesRegistradosEnEstePedido.has(item.material_id);

          this.registrarNecesidad(
            necesidadesBrutas,
            item.material_id,
            cantidad,
            yaRegistrado ? undefined : pedido.fecha_entrega || undefined
          );

          if (!yaRegistrado) {
            materialesRegistradosEnEstePedido.add(item.material_id);
          }
        }

        // Etiqueta por talla (si aplica)
        if (productoTallaColor?.talla_id) {
          const etiqueta = await this.prisma.mat_materiales.findFirst({
            where: {
              categoria_material_id: 4, // ← Asumimos categoría 4 es 'etiqueta'
              talla_id: productoTallaColor.talla_id,
            },
            include: { cfg_categorias_material: true },
          });

          if (etiqueta) {
            const merma = Number(etiqueta?.cfg_categorias_material?.porcentaje_merma || 0);
            const cantidadConMerma = linea.cantidad_solicitada * (1 + merma / 100);

            const yaRegistrado = materialesRegistradosEnEstePedido.has(etiqueta.material_id);
            const fechaEntrega = yaRegistrado ? undefined : pedido.fecha_entrega;

            this.registrarNecesidad(
              necesidadesBrutas,
              etiqueta.material_id,
              cantidadConMerma,
              fechaEntrega || undefined
            );

            if (!yaRegistrado) {
              materialesRegistradosEnEstePedido.add(etiqueta.material_id);
            }
          }
        }
      }
    }
    interface ResumenMaterial {
      materialId: number;
      necesidad_bruta: number;
      stock: number;
      necesidad_neta: number;
    }
    const resumen: ResumenMaterial[] = [];

    // Ajustar necesidades netas por telas y redondeos de cantidades de materiales
    for (const [materialId, data] of necesidadesBrutas.entries()) {
      const material = await this.prisma.mat_materiales.findUnique({
        where: { material_id: materialId },
        include: { cfg_categorias_material: true },
      });

      const categoria = material?.cfg_categorias_material?.nombre_categoria?.toLowerCase();
      let total = data.total;

      if (categoria === 'telas') {
        const rendimiento = Number(material?.rendimiento_tela || 1);
        total = Math.ceil(total / rendimiento);
      } else {
        total = Math.ceil(total);
      }

      necesidadesBrutas.set(materialId, {
        total,
        fechas_entrega: data.fechas_entrega,
      });
    }

    // Calcular stock actual y necesidades netas
    for (const [materialId, data] of necesidadesBrutas.entries()) {
      const stock = await this.prisma.mat_materiales.findUnique({
        where: { material_id: materialId },
        select: { stock_actual: true },
      });

      const nb = data.total;
      const nn = Math.max(nb - Number(stock?.stock_actual || 0), 0);

      resumen.push({
        materialId: Number(materialId),
        necesidad_bruta: Number(nb),
        stock: Number(stock?.stock_actual ?? 0),
        necesidad_neta: Number(nn),
      });

      await this.prisma.cmp_plan_necesidades_brutas.create({
        data: {
          corrida_plan_id: corrida.corrida_plan_id,
          fk_material_id: materialId,
          necesidad_bruta: nb,
          estado: true,
          fecha_creacion: new Date(),
          usuario_creacion: 'sistema',
          fecha_modificacion: new Date(),
          usuario_modificacion: 'sistema',
        },
      });

      if (nn > 0) {
        const proveedores = await this.prisma.mat_materiales_prov.findMany({
          where: { material_id: materialId },
          include: {
            pro_proveedores: true,
            mat_materiales: {
              include: { cfg_categorias_material: true },
            },
          },
        });

        const proveedorReciente = await this.prisma.cmp_ordenes_compra_det.findFirst({
          where: { material_id: materialId },
          orderBy: { cmp_ordenes_compra: { fecha_emision_oc: 'desc' } },
          include: { cmp_ordenes_compra: true },
        });

        let proveedorFinal = proveedorReciente?.cmp_ordenes_compra?.proveedor_id
          ? proveedores.find(p => p.proveedor_id === proveedorReciente.cmp_ordenes_compra?.proveedor_id)
          : proveedores.reduce((prev, curr) => (prev.pro_proveedores?.lead_time_dias || 99) < (curr.pro_proveedores?.lead_time_dias || 99) ? prev : curr);

        const material = proveedorFinal?.mat_materiales;
        let cantidadFinal = nn;

        if (material?.cfg_categorias_material?.nombre_categoria?.toLowerCase() !== 'telas') {
          const presentacion = await this.prisma.cfg_presentaciones_categoria.findFirst({
            where: { categoria_material_id: material?.categoria_material_id || 0 },
          });

          const factor = Number(presentacion?.factor_conversion) || 1;
          const moq = proveedorFinal?.moq_proveedor || 0;
          const paquetes = Math.ceil(nn / factor);
          cantidadFinal = Math.max(paquetes, Number(moq));
        } else {
          const moqKg = proveedorFinal?.moq_proveedor || 0;
          cantidadFinal = Math.max(Math.ceil(nn), Number(moqKg));
        }

        const gruposFechas = this.agruparFechas(data.fechas_entrega);

        const grupoPrioritario = gruposFechas.reduce((grupoMin, grupo) => {
          const minFechaGrupo = grupo.reduce((min, actual) =>
            actual.getTime() < min.getTime() ? actual : min
          );
          const minFechaActual = grupoMin.reduce((min, actual) =>
            actual.getTime() < min.getTime() ? actual : min
          );
          return minFechaGrupo.getTime() < minFechaActual.getTime() ? grupo : grupoMin;
        });

        const fechaEntregaGrupo = grupoPrioritario.sort((a, b) => a.getTime() - b.getTime())[0];
        const cantidadPedidosGrupo = grupoPrioritario.length;
        const diasProduccionGrupo = tiempoProduccionDias * cantidadPedidosGrupo;

        const fechaEstimadaLlegada = new Date(fechaEntregaGrupo);
        fechaEstimadaLlegada.setDate(fechaEntregaGrupo.getDate() - diasProduccionGrupo);

        const fechaOrden = new Date(fechaEstimadaLlegada);
        fechaOrden.setDate(
          fechaOrden.getDate() - (proveedorFinal?.pro_proveedores?.lead_time_dias || 0)
        );

        await this.prisma.cmp_sugerencias_compra_det.create({
          data: {
            corrida_plan_id: corrida.corrida_plan_id,
            material_id: materialId,
            proveedor_id: proveedorFinal?.proveedor_id,
            unidad_medida_id: material?.unidad_medida_id,
            cantidad_neta_sugerida: cantidadFinal,
            precio_unitario_sugerido: proveedorFinal?.precio_compra || 0,
            fecha_sugerida_ordenar: fechaOrden,
            fecha_estimada_llegada: fechaEstimadaLlegada,
            estado_det_sugerencia: 'PENDIENTE',
          },
        });
      }
    }

    console.table(resumen);

    return {
      message: 'Planificación ejecutada',
      corrida_id: corrida.corrida_plan_id,
    };
  }

  async obtenerSugerencias(corridaId: number) {
    return this.prisma.cmp_sugerencias_compra_det.findMany({
      where: { corrida_plan_id: corridaId },
      include: {
        mat_materiales: true,
        pro_proveedores: true,
        cfg_unidades_medida: true,
      },
    });
  }

  async aprobarYGenerarOrdenes(corridaId: number, dto: AprobarSugerenciasDto) {
    try {
      console.log('DTO recibido:', dto);
      console.log('IDs de sugerencias a aprobar:', dto.sugerencia_ids);
      const sugerencias = await this.prisma.cmp_sugerencias_compra_det.findMany({
        where: {
          sugerencia_det_id: { in: dto.sugerencia_ids },
          corrida_plan_id: corridaId,
          estado_det_sugerencia: 'PENDIENTE',
        },
        include: {
          pro_proveedores: true,
          mat_materiales: true,
        },
      });

      console.log('Sugerencias filtradas:', sugerencias.map(s => ({
        id: s.sugerencia_det_id,
        material: s.material_id,
        proveedor: s.proveedor_id,
        estado: s.estado_det_sugerencia,
      })));
      const agrupadasPorProveedor = new Map<number, typeof sugerencias>();

      for (const s of sugerencias) {
        if (s.proveedor_id === null) continue;
        if (!agrupadasPorProveedor.has(s.proveedor_id)) {
          agrupadasPorProveedor.set(s.proveedor_id, []);
        }
        agrupadasPorProveedor.get(s.proveedor_id)!.push(s);
      }

      console.log('Sugerencias agrupadas por proveedor:');
      for (const [provId, items] of agrupadasPorProveedor.entries()) {
        console.log(`Proveedor ${provId} → Sugerencias:`, items.map(i => i.sugerencia_det_id));
      }

      let totalOrden = 0;
      for (const [proveedorId, grupo] of agrupadasPorProveedor.entries()) {

        const ultimo = await this.prisma.cmp_ordenes_compra.findFirst({
          orderBy: { orden_compra_id: 'desc' },
        });

        const nuevoNumero = `OC-${(ultimo?.orden_compra_id ?? 0) + 1}`;

        const fechaEsperada = grupo.reduce((min, s) =>
          (s.fecha_estimada_llegada && s.fecha_estimada_llegada < min) ? s.fecha_estimada_llegada : min,
          grupo[0].fecha_estimada_llegada || new Date()
        );
        
        const orden = await this.prisma.cmp_ordenes_compra.create({
          data: {
            proveedor_id: proveedorId,
            numero_oc: nuevoNumero,
            fecha_emision_oc: new Date(),
            fecha_esperada: fechaEsperada,
            estado_oc: 'PENDIENTE',
            fecha_creacion: new Date(), 
            fecha_modificacion: new Date(),
            estado: true,
          },
        });

        for (const s of grupo) {
          const precio = Number(s.precio_unitario_sugerido ?? 0);
          const subtotal = precio * Number(s.cantidad_neta_sugerida);
          totalOrden += subtotal;

          const detalle = await this.prisma.cmp_ordenes_compra_det.create({
            data: {
              orden_compra_id: orden.orden_compra_id,
              material_id: s.material_id,
              cantidad_pedida: s.cantidad_neta_sugerida,
              precio_unitario: precio,
              subtotal: subtotal,
              estado_linea_oc: 'PENDIENTE',
            },
          });

          await this.prisma.cmp_sugerencias_compra_det.update({
            where: { sugerencia_det_id: s.sugerencia_det_id },
            data: {
              estado_det_sugerencia: 'OC_GENERADA',
              oc_detalle_id_generada: detalle.oc_detalle_id,
            },
          });
        }
        await this.prisma.cmp_ordenes_compra.update({
          where: { orden_compra_id: orden.orden_compra_id },
          data: { monto_total_oc: totalOrden },
        });
      }
      

      return { message: 'Sugerencias aprobadas y órdenes de compra generadas' };
    } catch (error) {
      console.error('Error al aprobar sugerencias:', error);
      throw new Error('Error al aprobar sugerencias y generar órdenes de compra');
    }
  }

  async listarCorridasConSugerencias() {
    
    return await this.prisma.cmp_corridas_planificacion.findMany({
      orderBy: { fecha_ejecucion_plan: 'desc' },
      include: {
        cmp_sugerencias_compra_det: {
          include: {
            mat_materiales: true,
            pro_proveedores: true,
            cfg_unidades_medida: true,
          },
        },
        cmp_corridas_planificacion_pedido:{
          include: {
            ped_pedidos_cliente:true,
          }
      },
    }});
  }
}
