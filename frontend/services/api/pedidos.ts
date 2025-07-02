import api from "@/lib/api"
import type { Pedido, PedidoDetalle } from "@/types/order"
import { Pedido as PedidoType } from "@/types/tizado"

export const pedidosApi = {
  // Obtener todos los pedidos
  getAll: async () => {
    const res = await api.get<Pedido[]>("/pedidos")
    return res.data
  },

  // Obtener pedido por ID
  getById: async (id: number) => {
    const res = await api.get<Pedido>(`/pedidos/${id}`)
    return res.data
  },

  // Obtener detalles de un pedido
  getDetalles: async (id: number) => {
    const res = await api.get<PedidoDetalle[]>(`/pedidos/${id}/detalle`)
    return res.data
  },

  // Crear nuevo pedido
  create: async (data: {
    cliente_id: number
    producto_id: number
    fecha_pedido: string
    fecha_entrega: string
    direccion_envio: string
    observaciones?: string
    detalles: {
      producto_tal_col_id: number
      cantidad_solicitada: number
    }[]
  }) => {
    const res = await api.post<Pedido>("/pedidos", data)
    return res.data
  },

  // Actualizar pedido
  update: async (id: number, data: {
    fecha_entrega?: string
    direccion_envio?: string
    observaciones?: string
  }) => {
    const res = await api.patch<Pedido>(`/pedidos/${id}`, data)
    return res.data
  },

  // Actualizar estado del pedido
  updateEstado: async (id: number, estado_pedido: string) => {
    const res = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado_pedido })
    return res.data
  },

  // Agregar detalle a pedido
  addDetalle: async (id: number, data: {
    producto_tal_col_id: number
    cantidad_solicitada: number
  }) => {
    const res = await api.post<Pedido>(`/pedidos/${id}/detalle`, data)
    return res.data
  },

  // Actualizar detalle de pedido
  updateDetalle: async (id: number, detalleId: number, data: {
    producto_tal_col_id: number
    cantidad_solicitada: number
  }) => {
    const res = await api.patch<Pedido>(`/pedidos/${id}/detalle/${detalleId}`, data)
    return res.data
  },

  // Eliminar pedido (soft delete)
  delete: async (id: number) => {
    const res = await api.delete(`/pedidos/${id}`)
    return res.data
  },

  // Eliminar detalle de pedido (soft delete)
  deleteDetalle: async (id: number, detalleId: number) => {
    const res = await api.delete(`/pedidos/${id}/detalle/${detalleId}`)
    return res.data
  },

  async getPedidosPorCliente(clienteId: number) {
    const response = await api.get<PedidoType[]>(`/pedidos/cliente/${clienteId}`)
    return response.data
  }
}
