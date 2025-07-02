// ===================================================================
// SERVICIO API MATERIALES - COMENTADO PARA FUTURO USO
// ===================================================================

import api from "@/lib/api"
import type { 
  Material, 
  CreateMaterialDto, 
  AsociarProveedorDto, 
  ApiResponse,
  PaginatedResponse,
  MaterialProveedor
} from "@/types/api"

export const materialesApi = {
  // Obtener todos los materiales
  getAll: async () => {
    const response = await api.get<Material[]>("/materiales")
    return response.data
  },

  // Obtener material por ID
  getById: async (id: number) => {
    const response = await api.get<Material>(`/materiales/${id}`)
    return response.data
  },

  // Crear nuevo material
  create: async (data: CreateMaterialDto) => {
    const response = await api.post<Material>("/materiales", data)
    return response.data
  },

  // Actualizar material
  update: async (id: number, data: Partial<CreateMaterialDto>) => {
    const response = await api.patch<Material>(`/materiales/${id}`, data)
    return response.data
  },

  // Eliminar material
  delete: async (id: number) => {
    const response = await api.delete(`/materiales/${id}`)
    return response.data
  },

  // Gestión de proveedores
  getProveedores: async (materialId: number) => {
    const response = await api.get<Material>(`/materiales/${materialId}/proveedores`)
    return response.data
  },

  // Verificar si existe relación material-proveedor
  verificarRelacionProveedor: async (materialId: number, proveedorId: number) => {
    try {
      // Intentar el endpoint específico primero
      const response = await api.get<MaterialProveedor | null>(`/materiales/${materialId}/verificar-proveedor/${proveedorId}`)
      return response.data
    } catch (error: any) {
      // Si falla, intentar obtener todos los proveedores y filtrar
      console.warn("Endpoint específico de verificación falló, usando método alternativo")
      try {
        const materialConProveedores = await api.get<Material>(`/materiales/${materialId}/proveedores`)
        const proveedores = materialConProveedores.data.mat_materiales_prov || []
        
        // Buscar la relación específica con este proveedor
        const relacionExistente = proveedores.find(
          (mp: MaterialProveedor) => mp.proveedor_id === proveedorId && mp.estado
        )
        
        return relacionExistente || null
      } catch (fallbackError) {
        console.error("También falló el método alternativo:", fallbackError)
        // Si ambos fallan, retornar null para indicar que no existe relación
        return null
      }
    }
  },

  asociarProveedor: async (materialId: number, data: AsociarProveedorDto) => {
    const response = await api.post(`/materiales/${materialId}/proveedores`, data)
    return response.data
  },

  actualizarProveedor: async (provId: number, data: AsociarProveedorDto) => {
    const response = await api.patch(`/materiales/proveedores/${provId}`, data)
    return response.data
  },

  // Obtener materiales con stock bajo
  getLowStock: async () => {
    const response = await api.get<ApiResponse<Material[]>>("/materiales/low-stock")
    return response.data.data
  },

  // Buscar materiales por categoría
  searchByCategory: async (categoriaId: number, search?: string) => {
    const response = await api.get<ApiResponse<Material[]>>(`/materiales/search`, {
      params: { categoriaId, search },
    })
    return response.data.data
  },

  // Obtener materiales por categoría (usando endpoint específico)
  getByCategoria: async (categoriaId: number) => {
    const response = await api.get<Material[]>(`/materiales/categoria/${categoriaId}`)
    return response.data
  },
}


