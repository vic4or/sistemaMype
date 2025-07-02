// ===================================================================
// HOOKS PERSONALIZADOS PRODUCTOS - COMENTADO PARA FUTURO USO
// ===================================================================

/*
"use client"

import { useState, useEffect } from "react"
import { productosApi } from "@/services/api/productos"
import type { Producto, PaginatedResponse } from "@/types/api"

export function useProductos(params?: {
  page?: number
  limit?: number
  search?: string
  categoria?: string
  activo?: boolean
}) {
  const [data, setData] = useState<PaginatedResponse<Producto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productosApi.getAll(params)
      setData(response)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [params?.page, params?.limit, params?.search, params?.categoria, params?.activo])

  const createProducto = async (producto: Omit<Producto, "id" | "fechaCreacion" | "fechaModificacion">) => {
    try {
      const newProducto = await productosApi.create(producto)
      await fetchProductos() // Refresh data
      return newProducto
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al crear producto")
    }
  }

  const updateProducto = async (id: number, producto: Partial<Producto>) => {
    try {
      const updatedProducto = await productosApi.update(id, producto)
      await fetchProductos() // Refresh data
      return updatedProducto
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al actualizar producto")
    }
  }

  const deleteProducto = async (id: number) => {
    try {
      await productosApi.delete(id)
      await fetchProductos() // Refresh data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al eliminar producto")
    }
  }

  const toggleStatus = async (id: number) => {
    try {
      await productosApi.toggleStatus(id)
      await fetchProductos() // Refresh data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error al cambiar estado")
    }
  }

  return {
    productos: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    refresh: fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleStatus,
  }
}

export function useProducto(id: number) {
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productosApi.getById(id)
        setProducto(data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar producto")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProducto()
    }
  }, [id])

  return { producto, loading, error }
}
*/

// Placeholder para evitar errores de importación
export function useProductos() {
  return {
    productos: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    refresh: () => {},
    createProducto: async () => {},
    updateProducto: async () => {},
    deleteProducto: async () => {},
    toggleStatus: async () => {},
  }
}

export function useProducto() {
  return { producto: null, loading: false, error: null }
}
