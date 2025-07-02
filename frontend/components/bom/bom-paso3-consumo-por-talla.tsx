"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ruler, Zap, RotateCcw, AlertTriangle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBOMStore } from "@/stores/bom-store"
import { productosApi } from "@/services/api/productos"
import type { ProductoTallaColor } from "@/types/product"
import type { CategoriaMaterial } from "@/types/api"

interface CategoriaConsumo {
  categoria: CategoriaMaterial
  esMaterialComun: boolean
  esVariable: boolean
  consumoPorTalla: Record<string, number> // talla -> cantidad
}

interface ConsumoMatriz {
  valorLlenarTodo: string
  valorBase: string
  valorIncremento: string
  categorias: CategoriaConsumo[]
}

export default function BOMPaso3ConsumoPorTalla() {
  const { toast } = useToast()
  
  // Estado global
  const {
    productoId,
    categoriasConfiguradas,
    actualizarConsumoTalla,
    setError
  } = useBOMStore()

  // Estado local
  const [combinaciones, setCombinaciones] = useState<ProductoTallaColor[]>([])
  const [loadingCombinaciones, setLoadingCombinaciones] = useState(false)
  const [matriz, setMatriz] = useState<ConsumoMatriz>({
    valorLlenarTodo: "",
    valorBase: "",
    valorIncremento: "",
    categorias: []
  })

  // Cargar datos al montar
  useEffect(() => {
    if (!productoId) return
    cargarCombinaciones()
  }, [productoId])

  // Actualizar matriz cuando cambien las categorías configuradas
  useEffect(() => {
    construirMatrizCategorias()
  }, [categoriasConfiguradas])

  // Obtener tallas únicas del producto (ordenadas de mayor a menor)
  const tallasProducto = useMemo(() => {
    const tallasUnicas = Array.from(new Set(combinaciones.map(c => c.cfg_tallas?.valor_talla)))
      .filter((talla): talla is string => talla !== undefined)
      .sort((a, b) => {
        // Ordenar de mayor a menor (numérico si es posible, alfanumérico en caso contrario)
        const numA = parseInt(a)
        const numB = parseInt(b)
        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA // Mayor a menor
        }
        return b.localeCompare(a) // Alfabéticamente de mayor a menor
      })
    return tallasUnicas
  }, [combinaciones])

  // Cargar combinaciones del producto
  const cargarCombinaciones = async () => {
    try {
      setLoadingCombinaciones(true)
      const data = await productosApi.getCombinaciones(productoId!)
      setCombinaciones(data)
    } catch (error: any) {
      console.error('Error al cargar combinaciones:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron cargar las combinaciones del producto"
      })
      setError(error.message)
    } finally {
      setLoadingCombinaciones(false)
    }
  }

  // Construir matriz de categorías con valores iniciales
  const construirMatrizCategorias = async () => {
    try {
      // Convertir las categorías configuradas del store al formato de la matriz
      // FILTRAR: Solo mostrar categorías que varían por color (no etiquetas automáticas)
      const categorias: CategoriaConsumo[] = categoriasConfiguradas
        .filter(cat => cat.categoria.tiene_color) // Solo categorías que varían por color
        .map(cat => ({
          categoria: cat.categoria,
          esMaterialComun: cat.esMaterialComun,
          esVariable: cat.esVariable,
          // Cargar cantidades existentes del store (valores iniciales al editar)
          consumoPorTalla: cat.consumoPorTalla || {}
        }))

      setMatriz(prev => ({
        ...prev,
        categorias: categorias
      }))

      console.log(`🔧 [Paso 3] Matriz construida con ${categorias.length} categorías variables`)
      if (categorias.length > 0) {
        console.log('🔧 [Paso 3] Valores iniciales cargados:')
        categorias.forEach((cat, index) => {
          const cantidadesCargadas = Object.keys(cat.consumoPorTalla || {}).length
          console.log(`  ${index + 1}. ${cat.categoria.nombre_categoria}: ${cantidadesCargadas} cantidades cargadas`)
          if (cantidadesCargadas > 0) {
            console.log(`     - Cantidades:`, cat.consumoPorTalla)
          }
        })
      }
    } catch (error) {
      console.error('Error al construir matriz:', error)
      toast({
        variant: "destructive",
        description: "Error al construir la matriz de categorías"
      })
    }
  }

  // Actualizar consumo para una categoría y talla específica
  const actualizarConsumo = (categoriaId: number, talla: string, valor: string) => {
    const numeroValor = parseFloat(valor) || 0
    
    // Actualizar estado local de la matriz
    setMatriz(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => 
        cat.categoria.categoria_material_id === categoriaId
          ? {
              ...cat,
              consumoPorTalla: {
                ...cat.consumoPorTalla,
                [talla]: numeroValor
              }
            }
          : cat
      )
    }))

    // Actualizar store global 
    const categoriaActual = categoriasConfiguradas.find(cat => cat.categoria.categoria_material_id === categoriaId)
    if (categoriaActual) {
      const nuevoConsumo = {
        ...categoriaActual.consumoPorTalla,
        [talla]: numeroValor
      }
      console.log(`🔧 [Paso 3] Actualizando consumo: categoría ${categoriaId}, talla ${talla}, valor ${numeroValor}`)
      actualizarConsumoTalla(categoriaId, nuevoConsumo)
    }
  }

  // Llenar toda la matriz con un valor
  const llenarTodo = () => {
    const valor = parseFloat(matriz.valorLlenarTodo) || 0
    
    setMatriz(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => {
        const nuevoConsumo: Record<string, number> = {}
        tallasProducto.forEach(talla => {
          nuevoConsumo[talla] = valor
        })
        
        // Actualizar store global para esta categoría
        actualizarConsumoTalla(cat.categoria.categoria_material_id, nuevoConsumo)
        
        return {
          ...cat,
          consumoPorTalla: nuevoConsumo
        }
      })
    }))

    toast({
      description: `Todas las cantidades se llenaron con ${valor}`
    })
  }

  // Aplicar patrón incremental
  const aplicarPatronIncremental = () => {
    const base = parseFloat(matriz.valorBase) || 0
    const incremento = parseFloat(matriz.valorIncremento) || 0
    
    setMatriz(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => {
        const nuevoConsumo: Record<string, number> = {}
        tallasProducto.forEach((talla, index) => {
          nuevoConsumo[talla] = base + (incremento * index)
        })
        
        // Actualizar store global para esta categoría
        actualizarConsumoTalla(cat.categoria.categoria_material_id, nuevoConsumo)
        
        return {
          ...cat,
          consumoPorTalla: nuevoConsumo
        }
      })
    }))

    toast({
      description: `Patrón incremental aplicado: base ${base}, incremento ${incremento}`
    })
  }

  // Limpiar toda la matriz
  const limpiarTodo = () => {
    setMatriz(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => {
        // Limpiar también el store global
        actualizarConsumoTalla(cat.categoria.categoria_material_id, {})
        
        return {
          ...cat,
          consumoPorTalla: {}
        }
      })
    }))

    toast({
      description: "Matriz limpiada"
    })
  }

  // Limpiar una fila específica
  const limpiarFila = (categoriaId: number) => {
    setMatriz(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => 
        cat.categoria.categoria_material_id === categoriaId
          ? {
              ...cat,
              consumoPorTalla: {}
            }
          : cat
      )
    }))

    // Limpiar también el store global
    actualizarConsumoTalla(categoriaId, {})

    toast({
      description: "Fila limpiada"
    })
  }

  if (!productoId) {
    return <div>Debe seleccionar un producto</div>
  }

  return (
    <div className="space-y-6">
      {/* Explicación */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Ruler className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Consumo por Talla (Matriz Final)</h4>
              <div className="text-sm text-blue-800 mt-1 space-y-1">
                <p>Configure las cantidades específicas por talla para cada categoría variable.</p>
                <p>
                  <strong>Matriz tipo hoja de cálculo:</strong> Cada fila es una categoría, cada columna una talla.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías a configurar */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías Variables a Configurar ({matriz.categorias.length})</CardTitle>
          <CardDescription>
            Estado: <Badge variant="outline" className="text-orange-600">
              Pendiente ({matriz.categorias.length} categoría{matriz.categorias.length !== 1 ? 's' : ''} variable{matriz.categorias.length !== 1 ? 's' : ''})
            </Badge>
            {categoriasConfiguradas.length > matriz.categorias.length && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({categoriasConfiguradas.length - matriz.categorias.length} automática{categoriasConfiguradas.length - matriz.categorias.length !== 1 ? 's' : ''} oculta{categoriasConfiguradas.length - matriz.categorias.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {matriz.categorias.map((cat) => (
                <Badge
                  key={cat.categoria.categoria_material_id}
                  variant={cat.esVariable ? "default" : "secondary"}
                >
                  {cat.categoria.nombre_categoria}
                  {cat.esVariable && " (por color + talla)"}
                  {cat.esMaterialComun && !cat.esVariable && " (común)"}
                </Badge>
              ))}
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Herramientas de llenado */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Consumo por Talla</CardTitle>
          <CardDescription>Configure las cantidades para cada categoría según la talla del producto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de llenado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Llenar Todo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Llenar Todo
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  value={matriz.valorLlenarTodo}
                  onChange={(e) => setMatriz(prev => ({ ...prev, valorLlenarTodo: e.target.value }))}
                />
                <Button onClick={llenarTodo} variant="outline" size="icon">
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Patrón Incremental */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Patrón Incremental
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Base"
                  value={matriz.valorBase}
                  onChange={(e) => setMatriz(prev => ({ ...prev, valorBase: e.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="+ Inc"
                  value={matriz.valorIncremento}
                  onChange={(e) => setMatriz(prev => ({ ...prev, valorIncremento: e.target.value }))}
                />
                <Button onClick={aplicarPatronIncremental} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Limpiar */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Limpiar
              </Label>
              <Button onClick={limpiarTodo} variant="outline" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar Todo
              </Button>
            </div>
          </div>

          {/* Matriz de cantidades */}
          {matriz.categorias.length > 0 && tallasProducto.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Categoría</TableHead>
                    <TableHead className="text-center min-w-[80px]">UDM</TableHead>
                    {tallasProducto.map((talla) => (
                      <TableHead key={talla} className="text-center min-w-[100px]">
                        {talla}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriz.categorias.map((categoria) => (
                    <TableRow key={categoria.categoria.categoria_material_id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{categoria.categoria.nombre_categoria}</div>
                          <div className="text-xs text-muted-foreground">
                            {categoria.esVariable && "Variable por color"}
                            {categoria.esMaterialComun && !categoria.esVariable && "Material común"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">u/m</Badge>
                      </TableCell>
                      {tallasProducto.map((talla) => (
                        <TableCell key={talla} className="text-center">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-20 text-center"
                            value={categoria.consumoPorTalla[talla] || ""}
                            onChange={(e) => actualizarConsumo(
                              categoria.categoria.categoria_material_id,
                              talla,
                              e.target.value
                            )}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => limpiarFila(categoria.categoria.categoria_material_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {matriz.categorias.length === 0 
                  ? "No hay categorías configuradas en los pasos anteriores"
                  : "No hay tallas disponibles para este producto"
                }
              </p>
            </div>
          )}

          {/* Resumen */}
          {matriz.categorias.length > 0 && tallasProducto.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Completado: {
                matriz.categorias.reduce((total, cat) => {
                  return total + tallasProducto.filter(talla => 
                    cat.consumoPorTalla[talla] && cat.consumoPorTalla[talla] > 0
                  ).length
                }, 0)
              }/{matriz.categorias.length * tallasProducto.length} tallas • Total: {
                matriz.categorias.reduce((total, cat) => {
                  return total + tallasProducto.reduce((subtotal, talla) => {
                    return subtotal + (cat.consumoPorTalla[talla] || 0)
                  }, 0)
                }, 0).toFixed(2)
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info sobre las cantidades configuradas */}
      {matriz.categorias.length > 0 && tallasProducto.length > 0 && (
        <div className="flex justify-end">
          <div className="text-sm text-muted-foreground bg-green-50 px-3 py-2 rounded-md">
            📊 Completado: {
              matriz.categorias.reduce((total, cat) => {
                return total + tallasProducto.filter(talla => 
                  cat.consumoPorTalla[talla] && cat.consumoPorTalla[talla] > 0
                ).length
              }, 0)
            }/{matriz.categorias.length * tallasProducto.length} cantidades variables
            • Se guardará al finalizar el BOM
          </div>
        </div>
      )}
    </div>
  )
}
