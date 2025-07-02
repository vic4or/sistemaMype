import api from "@/lib/api"

export interface EjecutarPlanDto {
  fecha_inicio: string
  fecha_fin: string
}

export interface AprobarSugerenciasDto {
  sugerencias_aprobadas: number[]
}

export interface MaterialSugerencia {
  id: number
  material_id: number
  material_nombre: string
  cantidad: number
  unidad: string
  precio_unitario: number
  subtotal: number
  fecha_necesaria: string
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
  usuario: string
  pedidos_incluidos: number
  sugerencias_generadas: number
  estado: string
}

export const planificadorApi = {
  // Ejecutar planificación MRP
  ejecutarPlanificacion: async (dto: EjecutarPlanDto) => {
    const res = await api.post<{ corrida_id: number }>("/planificador/ejecutar", dto)
    return res.data
  },

  // Obtener sugerencias de una corrida
  obtenerSugerencias: async (corridaId: number) => {
    const res = await api.get<SugerenciaCompra[]>(`/planificador/sugerencias/${corridaId}`)
    return res.data
  },

  // Aprobar sugerencias y generar órdenes
  aprobarSugerencias: async (corridaId: number, dto: AprobarSugerenciasDto) => {
    const res = await api.patch<{ ordenes_generadas: number }>(`/planificador/aprobar/${corridaId}`, dto)
    return res.data
  },

  // Obtener historial de planificaciones
  obtenerHistorial: async () => {
    const res = await api.get<PlanificacionHistorial[]>("/planificador/historial")
    return res.data
  }
} 