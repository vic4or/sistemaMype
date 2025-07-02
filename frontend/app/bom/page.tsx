"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { productosApi } from "@/services/api/productos"
import type { Product, ProductoTallaColor } from "@/types/product"
import { useToast } from "@/components/ui/use-toast"
import { bomApi } from "@/services/api/bom"

interface ProductoConBOM extends Product {
  tieneBOM: boolean
  combinaciones: ProductoTallaColor[]
}

export default function BOMPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null)
  const [productos, setProductos] = useState<ProductoConBOM[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Verificar si un producto tiene BOM
  const verificarBOMExistente = async (productoId: number): Promise<boolean> => {
    try {
      const [materialesComunes, materialesVariaciones] = await Promise.all([
        bomApi.obtenerMaterialesComunes(productoId).catch(() => []),
        bomApi.obtenerMaterialesVariacion(productoId).catch(() => [])
      ])
      return materialesComunes.length > 0 || materialesVariaciones.length > 0
    } catch (error) {
      // Si hay error, asumimos que no tiene BOM
      return false
    }
  }

  // Refrescar la lista de productos
  const refrescarProductos = async () => {
    if (isLoading || isRefreshing) return
    
    try {
      setIsRefreshing(true)
      const productosData = await productosApi.getAll()
      console.log(`🔄 [BOM Listado] Refrescando ${productosData.length} productos...`)
      
      // Cargar combinaciones y verificar BOM para cada producto
      const productosActualizados = await Promise.all(
        productosData.map(async (producto) => {
          const [combinaciones, tieneBOM] = await Promise.all([
            productosApi.getCombinaciones(producto.producto_id).catch(() => []),
            verificarBOMExistente(producto.producto_id)
          ])
          return {
            ...producto,
            tieneBOM,
            combinaciones
          }
        })
      )
      
      setProductos(productosActualizados)
      console.log(`✅ [BOM Listado] Lista refrescada`)
      
      // Mostrar resumen del refresh
      const productosConBOM = productosActualizados.filter(p => p.tieneBOM).length
      toast({
        title: "Lista Actualizada",
        description: `${productosConBOM} de ${productosActualizados.length} productos tienen BOM.`
      })
    } catch (error) {
      console.error('Error al refrescar productos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo refrescar la lista de productos."
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosData = await productosApi.getAll()
        console.log(`📋 [BOM Listado] Cargando ${productosData.length} productos...`)
        
        // Cargar las combinaciones y verificar BOM para cada producto
        const productosConCombinaciones = await Promise.all(
          productosData.map(async (producto, index) => {
            try {
              console.log(`📋 [BOM Listado] Procesando producto ${index + 1}/${productosData.length}: ${producto.nombre}`)
              
              const [combinaciones, tieneBOM] = await Promise.all([
                productosApi.getCombinaciones(producto.producto_id).catch(() => []),
                verificarBOMExistente(producto.producto_id)
              ])
              
              console.log(`${tieneBOM ? '✅' : '❌'} [BOM Listado] Producto ${producto.nombre}: ${tieneBOM ? 'CON BOM' : 'SIN BOM'}`)
              
              return {
                ...producto,
                tieneBOM,
                combinaciones
              }
            } catch (error) {
              console.error(`Error al cargar datos para producto ${producto.producto_id}:`, error)
              return {
                ...producto,
                tieneBOM: false,
                combinaciones: []
              }
            }
          })
        )
        
        const productosConBOM = productosConCombinaciones.filter(p => p.tieneBOM).length
        console.log(`📊 [BOM Listado] Resumen: ${productosConBOM}/${productosConCombinaciones.length} productos tienen BOM`)
        
        setProductos(productosConCombinaciones)
        
        // Mostrar resumen al usuario
        if (productosConBOM > 0) {
          toast({
            title: "BOMs Detectados",
            description: `Se encontraron ${productosConBOM} producto${productosConBOM !== 1 ? 's' : ''} con BOM existente de ${productosConCombinaciones.length} total.`
          })
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos. Por favor, intente de nuevo."
        })
      } finally {
        setIsLoading(false)
      }
    }

    cargarProductos()
  }, [toast])

  // Refrescar cuando el usuario regresa a la página
  useEffect(() => {
    const handleFocus = () => {
      // Solo refrescar si han pasado al menos 2 segundos desde la carga inicial
      if (!isLoading && productos.length > 0) {
        console.log('👁️ [BOM Listado] Usuario regresó a la página - refrescando...')
        refrescarProductos()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isLoading, productos.length])

  // Categorías únicas para el filtro
  const categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean)))

  // Filtrar productos
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      (producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (producto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesCategoria = categoriaFilter === "todos" || producto.categoria === categoriaFilter

    return matchesSearch && matchesCategoria
  })

  const toggleExpand = useCallback((id: number) => {
    setExpandedProductId((prev) => (prev === id ? null : id))
  }, [])

  const getCategoriaLabel = (categoria: string | undefined) => {
    if (!categoria) return "Sin categoría"
    const labels: Record<string, string> = {
      polos: "Polos",
      joggers: "Joggers",
      cafarenas: "Cafarenas",
      pantalones: "Pantalones",
      shorts: "Shorts",
      blusas: "Blusas",
      vestidos: "Vestidos",
    }
    return labels[categoria] || categoria
  }

  const getEstacionLabel = (estacion: string | undefined) => {
    if (!estacion) return "Sin estación"
    const labels: Record<string, string> = {
      verano: "Verano",
      invierno: "Invierno",
      otoño: "Otoño",
      primavera: "Primavera",
      "todo-año": "Todo el año",
    }
    return labels[estacion] || estacion
  }

  const getLineaLabel = (linea: string | undefined) => {
    if (!linea) return "Sin línea"
    const labels: Record<string, string> = {
      superior: "Superior",
      inferior: "Inferior",
      completa: "Completa",
    }
    return labels[linea] || linea
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
          <p className="text-xs text-muted-foreground">Verificando BOMs existentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lista de Materiales (BOM)</h1>
        <p className="text-muted-foreground">
          Gestiona los materiales necesarios para la fabricación de cada producto
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Seleccione un producto para ver o editar su BOM</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refrescarProductos}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refrescando...' : 'Refrescar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                {categorias.map((cat) => cat && (
                  <SelectItem key={cat} value={cat}>
                    {getCategoriaLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de productos */}
          <div className="space-y-2">
            {isRefreshing && (
              <div className="text-center py-4 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-md">
                <RefreshCw className="inline mr-2 h-4 w-4 animate-spin" />
                Refrescando estado de BOMs...
              </div>
            )}
            {filteredProductos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron productos</div>
            ) : (
              filteredProductos.map((producto) => (
                <Collapsible
                  key={producto.producto_id}
                  open={expandedProductId === producto.producto_id}
                  onOpenChange={() => toggleExpand(producto.producto_id)}
                >
                  <Card className="mb-3">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          {expandedProductId === producto.producto_id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-semibold text-lg">{producto.nombre || 'Sin nombre'}</div>
                            <div className="text-sm text-muted-foreground">Código: {producto.codigo || 'Sin código'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{getCategoriaLabel(producto.categoria)}</Badge>
                          <Badge variant="outline">{getEstacionLabel(producto.estacion)}</Badge>
                          <Badge variant="outline">{getLineaLabel(producto.linea)}</Badge>
                          {producto.tieneBOM ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Con BOM</Badge>
                          ) : (
                            <Badge variant="destructive">Sin BOM</Badge>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex-1 pl-8">
                            <h3 className="text-lg font-medium">Resumen del Producto</h3>
                            <p className="text-sm text-muted-foreground">
                              {producto.combinaciones.length} combinaciones disponibles
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {producto.tieneBOM ? (
                              <Button
                                variant="default"
                                onClick={() => router.push(`/bom/${producto.producto_id}`)}
                              >
                                Ver/Editar BOM
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                onClick={() => router.push(`/bom/${producto.producto_id}`)}
                              >
                                Definir BOM
                              </Button>
                            )}
                          </div>
                        </div>

                        {producto.combinaciones.length > 0 && (() => {
                          // Extraer colores únicos con sus códigos hex
                          const coloresUnicos = Array.from(new Map(
                            producto.combinaciones
                              .filter(c => c.cfg_colores?.nombre_color)
                              .map(c => [
                                c.cfg_colores!.nombre_color, 
                                {
                                  nombre: c.cfg_colores!.nombre_color,
                                  hex: c.cfg_colores!.codigo_color || '#666666'
                                }
                              ])
                          ).values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
                          
                          const tallasUnicas = Array.from(new Set(
                            producto.combinaciones
                              .map(c => c.cfg_tallas?.valor_talla)
                              .filter(Boolean)
                          )).sort()

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3 pl-8">
                                <h4 className="font-medium text-sm text-muted-foreground">Colores disponibles</h4>
                                <div className="flex flex-wrap gap-2">
                                  {coloresUnicos.map((color) => (
                                    <div key={color.nombre} className="flex items-center gap-2 px-3 py-1.5 border rounded-full bg-white hover:bg-gray-50 transition-colors">
                                      <div 
                                        className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      <span className="text-sm font-medium">{color.nombre}</span>
                                    </div>
                                  ))}
                                  {coloresUnicos.length === 0 && (
                                    <span className="text-sm text-muted-foreground">Sin colores definidos</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-3 pl-8">
                                <h4 className="font-medium text-sm text-muted-foreground">Tallas disponibles</h4>
                                <div className="flex flex-wrap gap-2">
                                  {tallasUnicas.map((talla) => (
                                    <Badge key={talla} variant="outline" className="text-sm py-1.5 px-3">
                                      {talla}
                                    </Badge>
                                  ))}
                                  {tallasUnicas.length === 0 && (
                                    <span className="text-sm text-muted-foreground">Sin tallas definidas</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
