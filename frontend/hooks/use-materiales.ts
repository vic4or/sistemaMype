// ===================================================================
// HOOKS PERSONALIZADOS MATERIALES - COMENTADO PARA FUTURO USO
// ===================================================================

/*
"use client"

import { useState, useEffect } from "react"
import { materialesApi } from "@/services/api/materiales"
import type { Material, PaginatedResponse } from "@/types/api"

export function useMateriales(params?: {
  page?: number
  limit?: number
  search?: string
  categoria?: string
  activo?: boolean
  stockBajo?: boolean
}) {
  const [data, setData] = useState<PaginatedResponse<Material> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMateriales = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await materialesApi.getAll(params)
      setData(response)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar materiales")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMateriales()
  }, [params?.page, params?.limit, params?.search, params?.categoria, params?.activo, params?.stockBajo])

  const createMaterial = async (material: Omit<Material, "id" | "fechaCreacion" | "fechaModificacion">) => {
    try {
      const newMaterial = await materialesApi.create(material)
      await fetchMateriales()
      return newMaterial
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al crear material")
    }
  }

  const updateMaterial = async (id: number, material: Partial<Material>) => {
    try {
      const updatedMaterial = await materialesApi.update(id, material)
      await fetchMateriales()
      return updatedMaterial
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al actualizar material")
    }
  }

  const deleteMaterial = async (id: number) => {
    try {
      await materialesApi.delete(id)
      await fetchMateriales()
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al eliminar material")
    }
  }

  const toggleStatus = async (id: number) => {
    try {
      await materialesApi.toggleStatus(id)
      await fetchMateriales()
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al cambiar estado")
    }
  }

  return {
    materiales: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    refresh: fetchMateriales,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleStatus,
  }
}

export function useMaterialesLowStock() {
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await materialesApi.getLowStock()
        setMateriales(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar materiales con stock bajo")
      } finally {
        setLoading(false)
      }
    }

    fetchLowStock()
  }, [])

  return { materiales, loading, error }
}

export function useMaterialSearch(categoriaId?: number) {
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)

  const searchMateriales = async (search: string) => {
    if (!search.trim() || !categoriaId) {
      setMateriales([])
      return
    }

    try {
      setLoading(true)
      const data = await materialesApi.searchByCategory(categoriaId, search)
      setMateriales(data)
    } catch (err) {
      setMateriales([])
    } finally {
      setLoading(false)
    }
  }

  return { materiales, loading, searchMateriales }
}
*/

// Placeholder para evitar errores de importación
export function useMateriales() {
  return {
    materiales: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    refresh: () => {},
    createMaterial: async () => {},
    updateMaterial: async () => {},
    deleteMaterial: async () => {},
    toggleStatus: async () => {},
  }
}

export function useMaterialesLowStock() {
  return { materiales: [], loading: false, error: null }
}

export function useMaterialSearch() {
  return { materiales: [], loading: false, searchMateriales: async () => {} }
}
