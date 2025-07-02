import api from '@/lib/api'
import type { BOMComun, BOMVariacion, CrearBOMComunDto, CrearBOMVariacionDto } from '@/types/bom'

export const bomApi = {
  // Materiales comunes
  obtenerMaterialesComunes: async (productoId: number): Promise<BOMComun[]> => {
    console.log(`📡 [API] GET /bom/comunes/${productoId}`)
    const { data } = await api.get(`/bom/comunes/${productoId}`)
    console.log(`✅ [API] GET /bom/comunes/${productoId} - Respuesta:`, data)
    return data
  },

  guardarMaterialesComunes: async (dto: CrearBOMComunDto): Promise<BOMComun[]> => {
    console.log('📡 [API] POST /bom/comunes')
    console.log('📤 [API] Request Body:', JSON.stringify(dto, null, 2))
    
    const response = await api.post('/bom/comunes', dto)
    
    console.log('✅ [API] POST /bom/comunes - Status:', response.status)
    console.log('📥 [API] Response Data:', response.data)
    console.log('📋 [API] Response Headers:', response.headers)
    
    return response.data
  },

  // Materiales por variación
  obtenerMaterialesVariacion: async (productoId: number): Promise<BOMVariacion[]> => {
    console.log(`📡 [API] GET /bom/variaciones/${productoId}`)
    const { data } = await api.get(`/bom/variaciones/${productoId}`)
    console.log(`✅ [API] GET /bom/variaciones/${productoId} - Respuesta:`, data)
    return data
  },

  guardarMaterialesVariacion: async (dto: CrearBOMVariacionDto): Promise<BOMVariacion[]> => {
    console.log('📡 [API] POST /bom/variaciones')
    console.log('📤 [API] Request Body:', JSON.stringify(dto, null, 2))
    
    const response = await api.post('/bom/variaciones', dto)
    
    console.log('✅ [API] POST /bom/variaciones - Status:', response.status)
    console.log('📥 [API] Response Data:', response.data)
    console.log('📋 [API] Response Headers:', response.headers)
    
    return response.data
  }
} 