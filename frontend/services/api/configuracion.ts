import api from "@/lib/api"
import type { CategoriaMaterial, Color, Talla, UnidadMedida } from "@/types/api"

/* CATEGORIAS DE MATERIALES */
export const categoriasMaterialApi = {
  getAll: async () => {
    const res = await api.get<CategoriaMaterial[]>("/categorias-material")
    return res.data
  },
  getById: async (id: number) => {
    const res = await api.get<CategoriaMaterial>(`/categorias-material/${id}`)
    return res.data
  },
  create: async (data: Omit<CategoriaMaterial, 'categoria_material_id' | 'fecha_creacion' | 'fecha_modificacion'>) => {
    const res = await api.post<CategoriaMaterial>("/categorias-material", data)
    return res.data
  },
  update: async (id: number, data: Partial<CategoriaMaterial>) => {
    const res = await api.patch<CategoriaMaterial>(`/categorias-material/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/categorias-material/${id}`)
    return res.data
  },
  toggleStatus: async (id: number) => {
    const res = await api.patch<CategoriaMaterial>(`/categorias-material/${id}/toggle-status`)
    return res.data
  },
}

/* COLORES */
export const coloresApi = {
  getAll: async () => {
    const res = await api.get<Color[]>("/colores")
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get<Color>(`/colores/${id}`)
    return res.data
  },
  create: async (data: Omit<Color, 'id' | 'fecha_creacion' | 'fecha_modificacion'>) => {
    const res = await api.post<Color>("/colores", data)
    return res.data
  },
  update: async (id: string, data: Partial<Color>) => {
    const res = await api.patch<Color>(`/colores/${id}`, data)
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/colores/${id}`)
    return res.data
  },
}

/* TALLAS */
export const tallasApi = {
  getAll: async () => {
    const res = await api.get<Talla[]>("/tallas")
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get<Talla>(`/tallas/${id}`)
    return res.data
  },
  create: async (data: Omit<Talla, 'id' | 'fecha_creacion' | 'fecha_modificacion'>) => {
    const res = await api.post<Talla>("/tallas", data)
    return res.data
  },
  update: async (id: string, data: Partial<Talla>) => {
    const res = await api.patch<Talla>(`/tallas/${id}`, data)
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/tallas/${id}`)
    return res.data
  },
}

/* UNIDADES DE MEDIDA */
export const unidadesMedidaApi = {
  getAll: async () => {
    const res = await api.get<UnidadMedida[]>("/unidades-medida")
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get<UnidadMedida>(`/unidades-medida/${id}`)
    return res.data
  },
  create: async (data: Omit<UnidadMedida, 'id' | 'fecha_creacion' | 'fecha_modificacion'>) => {
    const res = await api.post<UnidadMedida>("/unidades-medida", data)
    return res.data
  },
  update: async (id: string, data: Partial<UnidadMedida>) => {
    const res = await api.patch<UnidadMedida>(`/unidades-medida/${id}`, data)
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/unidades-medida/${id}`)
    return res.data
  },
}

export const configuracionApi = {
  async getTallas() {
    try {
      console.log("Llamando a la API de tallas...")
      const response = await api.get<Talla[]>("/tallas")
      console.log("Respuesta de la API:", response)
      return response.data
    } catch (error) {
      console.error("Error en la llamada a la API de tallas:", error)
      throw error
    }
  }
}