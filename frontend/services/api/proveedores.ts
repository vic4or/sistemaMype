import api from "@/lib/api"
import type { Proveedor } from "@/types/material-proveedor"

export const proveedoresApi = {
  getAll: async () => {
    const res = await api.get<Proveedor[]>("/proveedores")
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<Proveedor>(`/proveedores/${id}`)
    return res.data
  },

  create: async (data: Omit<Proveedor, 'proveedor_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => {
    const res = await api.post<Proveedor>("/proveedores", data)
    return res.data
  },

  update: async (id: number, data: Partial<Proveedor>) => {
    const res = await api.patch<Proveedor>(`/proveedores/${id}`, data)
    return res.data
  },

  delete: async (id: number) => {
    const res = await api.delete(`/proveedores/${id}`)
    return res.data
  },

  toggleStatus: async (id: number) => {
    const res = await api.patch<Proveedor>(`/proveedores/${id}/toggle-status`)
    return res.data
  },
}
