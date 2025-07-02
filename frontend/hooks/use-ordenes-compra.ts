import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { 
  OrdenCompra, 
  CreateOrdenCompraDto, 
  UpdateOrdenCompraDto, 
  MaterialPorProveedor 
} from '@/types/ordenes-compra'
import type { Proveedor } from '@/types/material-proveedor'
import { ordenesCompraApi } from '@/services/api/ordenes-compra'

interface Filters {
  search: string
  estado: string
  proveedor_id?: number
}

export function useOrdenesCompra() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    estado: "todos",
    proveedor_id: undefined
  })
  const { toast } = useToast()

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener órdenes y proveedores
      const [ordenesData, proveedoresData] = await Promise.all([
        ordenesCompraApi.getAll(),
        ordenesCompraApi.getProveedores()
      ])

      // Filtrar órdenes según los filtros
      let ordenesFiltradas = ordenesData

      // Filtrar por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
          orden.numero_oc.toLowerCase().includes(searchLower) ||
          orden.pro_proveedores.razon_social.toLowerCase().includes(searchLower)
        )
      }

      // Filtrar por estado
      if (filters.estado !== "todos") {
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
          orden.estado_oc === filters.estado
        )
      }

      // Filtrar por proveedor
      if (filters.proveedor_id) {
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
          orden.proveedor_id === filters.proveedor_id
        )
      }

      setOrdenes(ordenesFiltradas)
      setProveedores(proveedoresData)
    } catch (err: any) {
      const errorMessage = err.message || "Error al cargar los datos"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [loadData])

  // Actualizar filtros
  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Eliminar orden
  const deleteOrden = async (id: number) => {
    try {
      setDeleting(id)
      await ordenesCompraApi.delete(id)
      await loadData()
      toast({
        title: "Éxito",
        description: "Orden eliminada correctamente"
      })
    } catch (err: any) {
      const errorMessage = err.message || "Error al eliminar la orden"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  // Descargar PDF
  const downloadPDF = async (ordenId: number, numeroOC: string) => {
    try {
      const result = await ordenesCompraApi.downloadPDF(ordenId, numeroOC)
      if (result) {
        toast({
          title: "Éxito",
          description: "PDF generado correctamente"
        })
      }
    } catch (error: any) {
      console.error('Error al descargar PDF:', error)
      toast({
        title: "Error al generar PDF",
        description: error.message || "Error al generar el PDF",
        variant: "destructive"
      })
    }
  }

  return {
    ordenes,
    proveedores,
    loading,
    error,
    submitting,
    deleting,
    filters,
    updateFilters,
    deleteOrden,
    downloadPDF,
    refresh: loadData,
    clearError: () => setError(null)
  }
}