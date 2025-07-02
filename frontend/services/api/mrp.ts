import api from "@/lib/api"
import type { PlanificacionMRP, SugerenciaCompra, ApiResponse, OrdenCompra } from "@/types/api"

export const mrpApi = {
  // Ejecutar planificación MRP
  ejecutarPlanificacion: async (data: {
    fechaInicio: string
    fechaFin: string
    pedidosIncluidos: number[]
  }) => {
    const response = await api.post<ApiResponse<PlanificacionMRP>>("/mrp/ejecutar", data)
    return response.data.data
  },

  // Obtener sugerencias de una planificación
  getSugerencias: async (planificacionId: number) => {
    const response = await api.get<ApiResponse<SugerenciaCompra[]>>(`/mrp/${planificacionId}/sugerencias`)
    return response.data.data
  },

  // Actualizar sugerencia
  updateSugerencia: async (
    id: number,
    data: {
      cantidadModificada?: number
      precioModificado?: number
      observaciones?: string
    },
  ) => {
    const response = await api.put<ApiResponse<SugerenciaCompra>>(`/mrp/sugerencias/${id}`, data)
    return response.data.data
  },

  // Aprobar/rechazar sugerencias
  aprobarSugerencias: async (sugerenciasIds: number[]) => {
    const response = await api.post<ApiResponse<OrdenCompra[]>>("/mrp/aprobar-sugerencias", {
      sugerenciasIds,
    })
    return response.data.data
  },

  // Obtener historial de planificaciones
  getHistorial: async (params?: {
    page?: number
    limit?: number
    fechaInicio?: string
    fechaFin?: string
  }) => {
    const response = await api.get<ApiResponse<PlanificacionMRP[]>>("/mrp/historial", { params })
    return response.data.data
  },

  // Obtener detalle de planificación
  getDetallePlanificacion: async (id: number) => {
    const response = await api.get<ApiResponse<PlanificacionMRP>>(`/mrp/${id}`)
    return response.data.data
  },
}
