import api from "@/lib/api"
import { CreateTizadoDto, Tizado, UpdateTizadoDto, TizadoTalla, CreateTizadoTallaDto, UpdateTizadoTallaDto } from "@/types/tizado"

export const tizadosApi = {
  // --- Operaciones para la cabecera del Tizado ---

  /**
   * Obtiene todos los tizados.
   */
  getAll: async () => {
    const res = await api.get<Tizado[]>("/tizados")
    return res.data
  },

  /**
   * Obtiene un tizado específico por su ID.
   * @param id - El ID del tizado.
   */
  getById: async (id: number) => {
    const res = await api.get<Tizado>(`/tizados/${id}`)
    return res.data
  },

  /**
   * Crea un nuevo tizado.
   * @param data - Los datos para crear el tizado.
   */
  create: async (data: CreateTizadoDto) => {
    const res = await api.post<Tizado>("/tizados", data)
    return res.data
  },

  /**
   * Actualiza un tizado existente.
   * @param id - El ID del tizado a actualizar.
   * @param data - Los datos para actualizar.
   */
  update: async (id: number, data: UpdateTizadoDto) => {
    const res = await api.patch<Tizado>(`/tizados/${id}`, data)
    return res.data
  },

  /**
   * Elimina/inactiva un tizado.
   * @param id - El ID del tizado a eliminar.
   */
  remove: async (id: number) => {
    const res = await api.delete<Tizado>(`/tizados/${id}`)
    return res.data
  },

  // --- Operaciones para el detalle de Tallas del Tizado ---

  /**
   * Obtiene todas las tallas asociadas a un tizado.
   * @param tizadoId - El ID del tizado.
   */
  getTallas: async (tizadoId: number) => {
    const res = await api.get<TizadoTalla[]>(`/tizados/${tizadoId}/tallas`)
    return res.data
  },

  /**
   * Agrega una nueva talla a un tizado.
   * @param tizadoId - El ID del tizado.
   * @param data - Los datos de la nueva talla.
   */
  addTalla: async (tizadoId: number, data: CreateTizadoTallaDto) => {
    const res = await api.post<TizadoTalla>(`/tizados/${tizadoId}/tallas`, data)
    return res.data
  },

  /**
   * Actualiza una talla existente en un tizado.
   * @param tizadoId - El ID del tizado.
   * @param tallaTizadoId - El ID del registro de la talla en el tizado.
   * @param data - Los datos para actualizar.
   */
  updateTalla: async (tizadoId: number, tallaTizadoId: number, data: UpdateTizadoTallaDto) => {
    const res = await api.patch<TizadoTalla>(`/tizados/${tizadoId}/tallas/${tallaTizadoId}`, data)
    return res.data
  },

  /**
   * Elimina una talla de un tizado.
   * @param tizadoId - El ID del tizado.
   * @param tallaTizadoId - El ID del registro de la talla a eliminar.
   */
  removeTalla: async (tizadoId: number, tallaTizadoId: number) => {
    const res = await api.delete<void>(`/tizados/${tizadoId}/tallas/${tallaTizadoId}`)
    return res.data
  },
} 