import api from "@/lib/api"

export interface EjecutarPlanDto {
  fecha_inicio: string
  fecha_fin: string
}

export interface AprobarSugerenciasDto {
  sugerencia_ids: number[]
}

// Tipo para la respuesta individual del backend
export interface SugerenciaBackend {
  sugerencia_det_id: number
  corrida_plan_id: number
  material_id: number
  unidad_medida_id: number
  proveedor_id: number
  cantidad_neta_sugerida: string
  fecha_sugerida_ordenar: string
  fecha_estimada_llegada: string
  oc_detalle_id_generada: number | null
  estado_det_sugerencia: string
  precio_unitario_sugerido: string
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  mat_materiales: {
    material_id: number
    categoria_material_id: number
    unidad_medida_id: number
    talla_id: number | null
    color_id: number | null
    codigo_material: string
    stock_actual: string
    descripcion_material: string
    ancho_tela_metros: number | null
    rendimiento_tela: number | null
    tipo_tejido_tela: string | null
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string
    fecha_modificacion: string
    usuario_modificacion: string | null
    unidad_consumo_id: number
    factor_conversion_compra: string
  }
  pro_proveedores: {
    proveedor_id: number
    razon_social: string
    ruc: string
    direccion: string
    telefono: string
    email: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
    lead_time_dias: number
  }
  cfg_unidades_medida: {
    unidad_medida_id: number
    nombre_unidad: string
    abreviatura: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
  }
}

// Tipos para la UI (agrupados por proveedor)
export interface MaterialSugerencia {
  id: number
  material_id: number
  material_nombre: string
  cantidad: number
  unidad: string
  precio_unitario: number
  subtotal: number
  fecha_necesaria: string
  estado: string
  seleccionado: boolean
  modificado?: boolean
}

export interface SugerenciaCompra {
  id: number
  proveedor_id: number
  proveedor_nombre: string
  contacto: string
  total: number
  materiales: MaterialSugerencia[]
}

export interface PlanificacionHistorial {
  corrida_id: number
  fecha_ejecucion: string
  pedidos_incluidos: number
  sugerencias_generadas: number
  sugerencias_pendientes: number
  estado: string
}

// Nuevo tipo para la respuesta de la API /corridas
export interface CorridaConSugerencias {
  corrida_plan_id: number
  fecha_ejecucion_plan: string
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  cmp_sugerencias_compra_det: SugerenciaBackend[]
  cmp_corridas_planificacion_pedido: CorridaPedido[]
}

export interface CorridaPedido {
  corrida_plan__pedido_id: number
  corrida_plan_id: number
  pedido_cliente_id: number
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  ped_pedidos_cliente: {
    pedido_cliente_id: number
    cliente_id: number
    producto_id: number
    codigo_pedido: string | null
    fecha_pedido: string
    fecha_entrega: string
    estado_pedido: string
    direccion_envio: string
    cantidad: number
    total: string
    observaciones: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
  }
}


// Función para agrupar sugerencias por proveedor
const agruparSugerenciasPorProveedor = (sugerenciasBackend: SugerenciaBackend[]): SugerenciaCompra[] => {
  console.log('=== DEBUG: Datos crudos del backend ===')
  console.log('Total de sugerencias recibidas:', sugerenciasBackend.length)
  sugerenciasBackend.forEach((sug, index) => {
    console.log(`Sugerencia ${index}:`, {
      id: sug.sugerencia_det_id,
      material: sug.mat_materiales.descripcion_material,
      proveedor: sug.pro_proveedores.razon_social,
      estado: sug.estado_det_sugerencia,
      cantidad: sug.cantidad_neta_sugerida,
      precio: sug.precio_unitario_sugerido
    })
  })

  const proveedoresMap = new Map<number, SugerenciaCompra>()

  sugerenciasBackend.forEach((sugerencia) => {
    const proveedorId = sugerencia.proveedor_id
    
    // Usar el precio unitario sugerido del backend
    const precioUnitario = parseFloat(sugerencia.precio_unitario_sugerido)
    const cantidad = parseFloat(sugerencia.cantidad_neta_sugerida)
    const subtotal = cantidad * precioUnitario

    const material: MaterialSugerencia = {
      id: sugerencia.sugerencia_det_id,
      material_id: sugerencia.material_id,
      material_nombre: sugerencia.mat_materiales.descripcion_material,
      cantidad: cantidad,
      unidad: sugerencia.cfg_unidades_medida.abreviatura,
      precio_unitario: precioUnitario,
      subtotal: subtotal,
      fecha_necesaria: sugerencia.fecha_sugerida_ordenar,
      estado: sugerencia.estado_det_sugerencia,
      seleccionado: sugerencia.estado_det_sugerencia === 'PENDIENTE',
      modificado: false
    }

    if (!proveedoresMap.has(proveedorId)) {
      proveedoresMap.set(proveedorId, {
        id: proveedorId,
        proveedor_id: proveedorId,
        proveedor_nombre: sugerencia.pro_proveedores.razon_social,
        contacto: `${sugerencia.pro_proveedores.email} | Tel: ${sugerencia.pro_proveedores.telefono}`,
        total: 0,
        materiales: []
      })
    }

    const proveedor = proveedoresMap.get(proveedorId)!
    proveedor.materiales.push(material)
    proveedor.total += subtotal
  })

  const resultado = Array.from(proveedoresMap.values())
  
  console.log('=== DEBUG: Resultado después de agrupar ===')
  console.log('Total de proveedores agrupados:', resultado.length)
  resultado.forEach((prov, index) => {
    console.log(`Proveedor ${index}: ${prov.proveedor_nombre}`)
    prov.materiales.forEach((mat, matIndex) => {
      console.log(`  Material ${matIndex}:`, {
        id: mat.id,
        nombre: mat.material_nombre,
        estado: mat.estado,
        seleccionado: mat.seleccionado
      })
    })
  })

  return resultado
}

export const planificadorApi = {
  // Ejecutar planificación MRP
  ejecutarPlanificacion: async (dto: EjecutarPlanDto) => {
    const res = await api.post<{ message: string; corrida_id: number }>("/planificador/ejecutar", dto)
    return res.data
  },

  // Obtener sugerencias de una corrida (ahora maneja la respuesta real del backend)
  obtenerSugerencias: async (corridaId: number) => {
    const res = await api.get<SugerenciaBackend[]>(`/planificador/sugerencias/${corridaId}`)
    
    // Validar que existan sugerencias
    if (!res.data || res.data.length === 0) {
      console.warn(`No se encontraron sugerencias para la corrida ${corridaId}`)
      return []
    }
    
    return agruparSugerenciasPorProveedor(res.data)
  },

  // Aprobar sugerencias y generar órdenes
  aprobarSugerencias: async (corridaId: number, dto: AprobarSugerenciasDto) => {
    const res = await api.patch<{ message: string }>(`/planificador/aprobar/${corridaId}`, dto)
    return res.data
  },

  // Obtener historial de planificaciones
  obtenerHistorial: async () => {
    const res = await api.get<CorridaConSugerencias[]>("/planificador/corridas")
    
    console.log('=== DEBUG: Datos completos del historial ===')
    console.log('Total de corridas recibidas:', res.data.length)
    
    // Convertir el formato de corridas a historial
    const historial: PlanificacionHistorial[] = res.data.map(corrida => {
      console.log(`=== Corrida ${corrida.corrida_plan_id} ===`)
      console.log('Pedidos:', corrida.cmp_corridas_planificacion_pedido?.length || 0)
      console.log('Sugerencias totales:', corrida.cmp_sugerencias_compra_det?.length || 0)
      
      // Debug de los estados de las sugerencias
      if (corrida.cmp_sugerencias_compra_det) {
        const estadosSugerencias = corrida.cmp_sugerencias_compra_det.map(s => s.estado_det_sugerencia)
        console.log('Estados de sugerencias:', estadosSugerencias)
        
        const pendientesCount = corrida.cmp_sugerencias_compra_det.filter(s => s.estado_det_sugerencia === 'PENDIENTE').length
        const generadasCount = corrida.cmp_sugerencias_compra_det.filter(s => s.estado_det_sugerencia === 'OC_GENERADA').length
        
        console.log('Pendientes:', pendientesCount)
        console.log('OC Generadas:', generadasCount)
      }
      
      const sugerenciasPendientes = corrida.cmp_sugerencias_compra_det?.filter(s => s.estado_det_sugerencia === 'PENDIENTE').length || 0
      const totalSugerencias = corrida.cmp_sugerencias_compra_det?.length || 0
      const todasGeneradas = totalSugerencias > 0 && sugerenciasPendientes === 0
      
      console.log('¿Todas generadas?:', todasGeneradas)
      console.log('Estado final:', todasGeneradas ? 'Completado' : 'Pendiente')
      console.log('---')
      
      return {
        corrida_id: corrida.corrida_plan_id,
        fecha_ejecucion: corrida.fecha_ejecucion_plan,
        pedidos_incluidos: corrida.cmp_corridas_planificacion_pedido?.length || 0,
        sugerencias_generadas: totalSugerencias,
        sugerencias_pendientes: sugerenciasPendientes,
        estado: todasGeneradas ? 'Completado' : 'Pendiente'
      }
    })
    
    console.log('=== DEBUG: Historial procesado ===')
    console.log(historial)
    
    return historial
  },

  // Obtener sugerencias sin agrupar (para uso raw del backend)
  obtenerSugerenciasRaw: async (corridaId: number) => {
    const res = await api.get<SugerenciaBackend[]>(`/planificador/sugerencias/${corridaId}`)
    return res.data
  },

  // Generar historial desde sugerencias existentes (si no hay endpoint específico)
  generarHistorialDesdeSugerencias: async () => {
    // Esta función podría usarse si necesitamos generar el historial desde las sugerencias
    // Por ahora mantenemos el endpoint del historial como principal
    const res = await api.get<SugerenciaBackend[]>(`/planificador/sugerencias/todas`)
    const sugerenciasPorCorrida = new Map<number, SugerenciaBackend[]>()
    
    res.data.forEach(sug => {
      if (!sugerenciasPorCorrida.has(sug.corrida_plan_id)) {
        sugerenciasPorCorrida.set(sug.corrida_plan_id, [])
      }
      sugerenciasPorCorrida.get(sug.corrida_plan_id)!.push(sug)
    })
    
    return Array.from(sugerenciasPorCorrida.entries()).map(([corridaId, sugerencias]) => ({
      corrida_id: corridaId,
      fecha_ejecucion: sugerencias[0].fecha_creacion,
      usuario: sugerencias[0].usuario_creacion || 'Sistema',
      pedidos_incluidos: 0, // No disponible desde sugerencias
      sugerencias_generadas: sugerencias.length,
      sugerencias_pendientes: sugerencias.filter(s => s.estado_det_sugerencia === 'PENDIENTE').length,
      estado: 'COMPLETADO'
    }))
  }
} 