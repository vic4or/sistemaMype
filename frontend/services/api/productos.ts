// ===================================================================
// SERVICIO API PRODUCTOS - COMENTADO PARA FUTURO USO
// ===================================================================

import api from "@/lib/api"
import type { Product, ProductoTallaColor } from "@/types/product"

export const productosApi = {
  // Obtener todos los productos
  getAll: async () => {
    const res = await api.get<Product[]>("/productos")
    return res.data
  },

  // Obtener producto por ID
  getById: async (id: number) => {
    const res = await api.get<Product>(`/productos/${id}`)
    return res.data
  },

  // Crear nuevo producto
  create: async (data: Omit<Product, 'producto_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => {
    const res = await api.post<Product>("/productos", data)
    return res.data
  },

  // Actualizar producto
  update: async (id: number, data: Partial<Product>) => {
    const res = await api.patch<Product>(`/productos/${id}`, data)
    return res.data
  },

  // Eliminar producto
  delete: async (id: number) => {
    const res = await api.delete(`/productos/${id}`)
    return res.data
  },

  // Cambiar estado del producto
  toggleStatus: async (id: number) => {
    const res = await api.patch<Product>(`/productos/${id}/toggle-status`)
    return res.data
  },

  // Obtener combinaciones de un producto
  getCombinaciones: async (productoId: number) => {
    const res = await api.get<ProductoTallaColor[]>(`/productos/${productoId}/combinaciones`)
    return res.data
  },

  // Crear combinación talla-color
  createCombinacion: async (data: Omit<ProductoTallaColor, 'producto_tal_col_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => {
    const res = await api.post<ProductoTallaColor>("/productos/combinaciones", data)
    return res.data
  },

  // Actualizar combinación talla-color
  updateCombinacion: async (id: number, data: Partial<ProductoTallaColor>) => {
    const res = await api.patch<ProductoTallaColor>(`/productos/combinaciones/${id}`, data)
    return res.data
  },

  // Eliminar combinación talla-color
  deleteCombinacion: async (id: number) => {
    const res = await api.delete(`/productos/combinaciones/${id}`)
    return res.data
  },

  // Cambiar estado de combinación
  toggleCombinacionStatus: async (id: number) => {
    const res = await api.patch<ProductoTallaColor>(`/productos/combinaciones/${id}/toggle-status`)
    return res.data
  }
}
