"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ArrowRight, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { productosApi } from "@/services/api/productos"
import { bomApi } from "@/services/api/bom"
import type { Product } from "@/types/product"

interface ProductoPendienteBOM {
  producto_id: number
  nombre: string
  codigo: string
  categoria: string
  tieneBOM: boolean
  requiereActualizacion: boolean
}

export default function BOMsPendientes() {
  const router = useRouter()
  const [productos, setProductos] = useState<ProductoPendienteBOM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarProductosPendientes = async () => {
    try {
      setLoading(true)
      const productosData = await productosApi.getAll()
      
      // Verificar cuáles productos tienen BOM
      const productosConEstado = await Promise.all(
        productosData.slice(0, 10).map(async (producto: Product) => { // Limitar a 10 para el dashboard
          try {
            const [materialesComunes, materialesVariaciones] = await Promise.all([
              bomApi.obtenerMaterialesComunes(producto.producto_id).catch(() => []),
              bomApi.obtenerMaterialesVariacion(producto.producto_id).catch(() => [])
            ])
            const tieneBOM = materialesComunes.length > 0 || materialesVariaciones.length > 0
            
            return {
              producto_id: producto.producto_id,
              nombre: producto.nombre || 'Sin nombre',
              codigo: producto.codigo || 'Sin código',
              categoria: producto.categoria || 'Sin categoría',
              tieneBOM,
              requiereActualizacion: false // TODO: Implementar lógica de actualización
            }
          } catch (error) {
            return {
              producto_id: producto.producto_id,
              nombre: producto.nombre || 'Sin nombre',
              codigo: producto.codigo || 'Sin código',
              categoria: producto.categoria || 'Sin categoría',
              tieneBOM: false,
              requiereActualizacion: false
            }
          }
        })
      )

      // Filtrar solo productos sin BOM o que requieren actualización
      const pendientes = productosConEstado.filter(p => !p.tieneBOM || p.requiereActualizacion)
      setProductos(pendientes)
      
    } catch (error) {
      console.error('Error al cargar productos pendientes:', error)
      setError('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductosPendientes()
  }, [])

  const handleIrABOM = (productoId: number) => {
    router.push(`/bom/${productoId}`)
  }

  const handleVerTodos = () => {
    router.push('/bom')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            BOMs Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Verificando BOMs...
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
            <Package className="h-5 w-5" />
            BOMs Pendientes
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
            <Package className="h-5 w-5" />
            BOMs Pendientes
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {productos.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productos.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-green-600 mb-2">✅</div>
              <p className="text-sm text-muted-foreground">
                Todos los productos tienen BOM definido
              </p>
            </div>
          ) : (
            <>
              {productos.slice(0, 5).map((producto) => (
                <div key={producto.producto_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{producto.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {producto.codigo} • {producto.categoria}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {producto.requiereActualizacion ? (
                      <Badge variant="secondary" className="text-xs">Actualizar</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Sin BOM</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleIrABOM(producto.producto_id)}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {productos.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    +{productos.length - 5} productos más
                  </p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerTodos}
                  className="w-full"
                >
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