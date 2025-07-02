"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { productosApi } from "@/services/api/productos"
import { bomApi } from "@/services/api/bom"
import type { Product } from "@/types/product"

interface ProductoSinBOM {
  producto_id: number
  nombre: string
  codigo: string
  categoria: string
  urgencia: 'alta' | 'media' | 'baja'
}

export default function BOMsFaltantes() {
  const router = useRouter()
  const [productos, setProductos] = useState<ProductoSinBOM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarProductosSinBOM = async () => {
    try {
      setLoading(true)
      const productosData = await productosApi.getAll()
      
      // Verificar cuáles productos NO tienen BOM
      const productosVerificados = await Promise.all(
        productosData.slice(0, 8).map(async (producto: Product) => { // Limitar para el dashboard
          try {
            const [materialesComunes, materialesVariaciones] = await Promise.all([
              bomApi.obtenerMaterialesComunes(producto.producto_id).catch(() => []),
              bomApi.obtenerMaterialesVariacion(producto.producto_id).catch(() => [])
            ])
            const tieneBOM = materialesComunes.length > 0 || materialesVariaciones.length > 0
            
            if (!tieneBOM) {
              // Determinar urgencia basada en categoría
              let urgencia: 'alta' | 'media' | 'baja' = 'media'
              if (producto.categoria?.includes('polos') || producto.categoria?.includes('pantalones')) {
                urgencia = 'alta'
              } else if (producto.categoria?.includes('shorts') || producto.categoria?.includes('joggers')) {
                urgencia = 'media'
              } else {
                urgencia = 'baja'
              }

              return {
                producto_id: producto.producto_id,
                nombre: producto.nombre || 'Sin nombre',
                codigo: producto.codigo || 'Sin código',
                categoria: producto.categoria || 'Sin categoría',
                urgencia
              }
            }
            return null
          } catch (error) {
            return {
              producto_id: producto.producto_id,
              nombre: producto.nombre || 'Sin nombre',
              codigo: producto.codigo || 'Sin código',
              categoria: producto.categoria || 'Sin categoría',
              urgencia: 'media' as 'media'
            }
          }
        })
      )

      const sinBOM = productosVerificados.filter(p => p !== null) as ProductoSinBOM[]
      // Ordenar por urgencia
      sinBOM.sort((a, b) => {
        const urgenciaOrder = { alta: 0, media: 1, baja: 2 }
        return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia]
      })
      
      setProductos(sinBOM)
      
    } catch (error) {
      console.error('Error al cargar productos sin BOM:', error)
      setError('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductosSinBOM()
  }, [])

  const handleCrearBOM = (productoId: number) => {
    router.push(`/bom/${productoId}`)
  }

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'destructive'
      case 'media': return 'secondary'
      case 'baja': return 'outline'
      default: return 'outline'
    }
  }

  const getUrgenciaLabel = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'Urgente'
      case 'media': return 'Normal'
      case 'baja': return 'Baja'
      default: return 'Normal'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            BOMs Faltantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Verificando productos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            BOMs Faltantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            BOMs Faltantes
          </CardTitle>
          <Badge variant={productos.length > 0 ? "destructive" : "secondary"} className="text-xs">
            {productos.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {productos.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-1 text-sm">✅</div>
              <p className="text-xs text-muted-foreground">
                Todos los productos tienen BOM
              </p>
            </div>
          ) : (
            <>
              {productos.slice(0, 5).map((producto) => (
                <div key={producto.producto_id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{producto.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {producto.codigo} • {producto.categoria}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={getUrgenciaColor(producto.urgencia) as any} className="text-xs">
                      {getUrgenciaLabel(producto.urgencia)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCrearBOM(producto.producto_id)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {productos.length > 5 && (
                <div className="text-center pt-1">
                  <p className="text-xs text-muted-foreground">
                    +{productos.length - 5} productos más
                  </p>
                </div>
              )}
              
              <div className="pt-1 border-t mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/bom')}
                  className="w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ver Todos los BOMs
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 