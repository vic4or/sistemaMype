import api from "@/lib/api"
import type { Cliente } from "@/types/api"

export const clientesApi = {
  getAll: async () => {
    const res = await api.get<Cliente[]>("/clientes")
    return res.data
  },
  getById: async (id: number) => {
    const res = await api.get<Cliente>(`/clientes/${id}`)
    return res.data
  },
  create: async (data: Omit<Cliente, 'cliente_id' | 'fecha_creacion' | 'fecha_modificacion'>) => {
    const res = await api.post<Cliente>("/clientes", data)
    return res.data
  },
  update: async (id: number, data: Partial<Cliente>) => {
    const res = await api.patch<Cliente>(`/clientes/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/clientes/${id}`)
    return res.data
  },
  toggleStatus: async (id: number) => {
    const res = await api.patch<Cliente>(`/clientes/${id}/toggle-status`)
    return res.data
  },
} 