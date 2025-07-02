"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Package, Palette, Pencil } from "lucide-react"
import { toast } from "sonner"
import { productosApi } from "@/services/api/productos"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import type { Product, ProductoTallaColor } from "@/types/product"
import type { Color, Talla } from "@/types/api"

export default function VerProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [producto, setProducto] = useState<Product | null>(null)
  const [combinaciones, setCombinaciones] = useState<ProductoTallaColor[]>([])
  const [tallas, setTallas] = useState<Record<number, Talla>>({})
  const [colores, setColores] = useState<Record<number, Color>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productoData, combinacionesData, tallasData, coloresData] = await Promise.all([
          productosApi.getById(Number(params.id)),
          productosApi.getCombinaciones(Number(params.id)),
          tallasApi.getAll(),
          coloresApi.getAll()
        ])
        setProducto(productoData)
        setCombinaciones(combinacionesData)
        const tallasMap = tallasData.reduce((acc, talla) => {
          acc[talla.talla_id] = talla
          return acc
        }, {} as Record<number, Talla>)
        const coloresMap = coloresData.reduce((acc, color) => {
          acc[color.color_id] = color
          return acc
        }, {} as Record<number, Color>)
        setTallas(tallasMap)
        setColores(coloresMap)
      } catch (error) {
        toast.error("Error al cargar los datos del producto")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">Producto no encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/productos")}>Volver a Productos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Producto</h1>
          <p className="text-muted-foreground">Información completa del producto y sus combinaciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/productos")}>Volver</Button>
          <Button onClick={() => router.push(`/productos/${params.id}/editar`)}>
            <Pencil className="mr-2 h-4 w-4" />Editar
          </Button>
        </div>
      </div>
      {/* Datos Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />Datos Generales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Información Básica</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Código</dt>
                  <dd className="font-medium">{producto.codigo}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nombre</dt>
                  <dd className="font-medium">{producto.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Categoría</dt>
                  <dd className="font-medium">{producto.categoria}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium mb-2">Detalles Adicionales</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Estación</dt>
                  <dd className="font-medium">{producto.estacion}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Línea</dt>
                  <dd className="font-medium">{producto.linea}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Estado</dt>
                  <dd>
                    <Badge variant={producto.estado ? "default" : "destructive"}>{producto.estado ? "Activo" : "Inactivo"}</Badge>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Combinaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />Combinaciones Talla-Color
          </CardTitle>
          <CardDescription>Lista de todas las combinaciones disponibles para este producto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinaciones.map((combinacion) => {
                  const talla = tallas[combinacion.talla_id || 0]
                  const color = colores[combinacion.color_id || 0]
                  return (
                    <TableRow key={combinacion.producto_tal_col_id}>
                      <TableCell className="font-mono">{combinacion.codigo}</TableCell>
                      <TableCell>{talla?.valor_talla}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color?.codigo_color }} />
                          {color?.nombre_color}
                        </div>
                      </TableCell>
                      <TableCell>
                        S/ {Number(combinacion.precio_venta).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={combinacion.estado ? "default" : "destructive"}>{combinacion.estado ? "Activo" : "Inactivo"}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
