import api from '@/lib/api'

// DTOs que coinciden con el backend
export interface RegistrarMovimientoManualDto {
  fecha_movimiento: string
  tipo_movimiento: 'Entrada' | 'Salida' | 'Ajuste'
  material_id: number
  cantidad: number
  usuario: string
  referencia?: string
  observaciones?: string
}

export interface MovimientoOCItemDto {
  oc_detalle_id: number
  cantidad_recibida: number
  estado_discrepancia: 'OK' | 'DISCREPANCIA'
  nota_discrepancia?: string
}

export interface RegistrarEntradaOCDto {
  fecha_movimiento: string
  usuario: string
  items: MovimientoOCItemDto[]
}

// Tipos de respuesta del backend
export interface Movimiento {
  movimiento_id: number
  material_id: number
  fecha_movimiento: string
  tipo_movimiento: 'Entrada' | 'Salida' | 'Ajuste'
  cantidad_movimiento: number
  stock_anterior: number
  stock_nuevo: number
  oc_detalle_id?: number
  usuario_creacion: string
  mat_materiales: {
    descripcion_material: string
    codigo_material: string
    unidad_medida_id: number
  }
  cmp_ordenes_compra_det?: {
    orden_compra_id: number
    cantidad_pedida: number
    cmp_ordenes_compra: {
      numero_oc: string
    }
  }
}

// Servicio API para movimientos
export const movimientosApi = {
  // Obtener todos los movimientos activos
  getAll: async (): Promise<Movimiento[]> => {
    try {
      const response = await api.get<Movimiento[]>('/movimientos')
      return response.data
    } catch (error: any) {
      console.error('Error al obtener movimientos:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener los movimientos')
    }
  },

  // Registrar movimiento manual
  registrarManual: async (data: RegistrarMovimientoManualDto): Promise<any> => {
    try {
      const response = await api.post('/movimientos/manual', data)
      return response.data
    } catch (error: any) {
      console.error('Error al registrar movimiento manual:', error)
      throw new Error(error.response?.data?.message || 'Error al registrar el movimiento manual')
    }
  },

  // Registrar entrada por orden de compra
  registrarDesdeOC: async (data: RegistrarEntradaOCDto): Promise<any> => {
    try {
      const response = await api.post('/movimientos/orden-compra', data)
      return response.data
    } catch (error: any) {
      console.error('Error al registrar entrada por OC:', error)
      throw new Error(error.response?.data?.message || 'Error al registrar la entrada por orden de compra')
    }
  }
} 