"use client"

import { useEffect, useState } from "react"
import { useBOMStore } from "@/stores/bom-store"
import { bomApi } from "@/services/api/bom"
import { productosApi } from "@/services/api/productos"
import { materialesApi } from "@/services/api/materiales"
import { useToast } from "@/hooks/use-toast"
import type { BOMVariacion, CrearBOMVariacionDto } from "@/types/bom"
import type { ProductoTallaColor } from "@/types/product"
import type { Material } from "@/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Search, Package, AlertTriangle, X } from "lucide-react"
import { categoriasMaterialApi } from "@/services/api/configuracion"
import type { CategoriaMaterial } from "@/types/api"

interface MaterialVariable {
  id: string
  categoriaId: number
  categoria: CategoriaMaterial
  mapeoColores: Record<string, Material>
}

interface ColorProducto {
  nombre: string
  hex: string
}

export default function BOMPaso2InsumosVariables() {
  const { toast } = useToast()
  const {
    productoId,
    materialesVariaciones,
    isLoadingVariaciones,
    categoriasConfiguradas,
    setMaterialesVariaciones,
    setIsLoadingVariaciones,
    setCategoriasConfiguradas,
    setError
  } = useBOMStore()

  const [combinaciones, setCombinaciones] = useState<ProductoTallaColor[]>([])
  const [loadingCombinaciones, setLoadingCombinaciones] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaMaterial | null>(null)
  const [mapeoActual, setMapeoActual] = useState<Record<string, Material>>({})
  const [busquedaPorColor, setBusquedaPorColor] = useState<Record<string, string>>({})
  const [materialesFiltradosPorColor, setMaterialesFiltradosPorColor] = useState<Record<string, Material[]>>({})
  const [colorEnBusqueda, setColorEnBusqueda] = useState<string>("")
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])
  const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([])

  // Obtener categoría seleccionada
  const categoriaSeleccionadaId = categoriaSeleccionada?.categoria_material_id

  // Obtener colores únicos del producto
  const coloresProducto = Array.from(new Set(combinaciones.map((c) => c.cfg_colores?.nombre_color || ''))).map(
    (colorNombre): ColorProducto => {
      const combinacion = combinaciones.find((c) => c.cfg_colores?.nombre_color === colorNombre)
      return {
        nombre: colorNombre,
        hex: combinacion?.cfg_colores?.codigo_color || "#000000",
      }
    },
  ).filter(color => color.nombre !== '')

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias()
    cargarMateriales()
  }, [])

  // Cargar datos al montar
  useEffect(() => {
    if (!productoId) return
    cargarCombinaciones()
    cargarMaterialesVariacion()
  }, [productoId])

  // Debug: mostrar categorías configuradas disponibles
  useEffect(() => {
    console.log('🔧 [Paso 2] Estado de categorías configuradas:', categoriasConfiguradas)
    console.log('🔧 [Paso 2] Total categorías configuradas:', categoriasConfiguradas.length)
    if (categoriasConfiguradas.length > 0) {
      console.log('🔧 [Paso 2] Detalle de categorías:')
      categoriasConfiguradas.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.categoria.nombre_categoria}:`)
        console.log(`     - Es material común: ${cat.esMaterialComun}`)
        console.log(`     - Es variable: ${cat.esVariable}`)
        console.log(`     - Mapeo colores:`, Object.keys(cat.mapeoColores || {}))
      })
    }
  }, [categoriasConfiguradas])

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const data = await categoriasMaterialApi.getAll()
      // Filtrar solo categorías que varían por color (el paso 2 se enfoca en mapeo por color)
      const categoriasVariables = data.filter(cat => cat.tiene_color)
      setCategorias(categoriasVariables)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron cargar las categorías de materiales"
      })
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  // Cargar materiales
  const cargarMateriales = async () => {
    try {
      const data = await materialesApi.getAll()
      setMaterialesDisponibles(data)
    } catch (error) {
      console.error('Error al cargar materiales:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron cargar los materiales"
      })
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  // Cargar combinaciones del producto
  const cargarCombinaciones = async () => {
    try {
      setLoadingCombinaciones(true)
      const data = await productosApi.getCombinaciones(productoId!)
      setCombinaciones(data)
    } catch (error: any) {
      console.error('Error al cargar combinaciones:', error)
      toast({
        description: "No se pudieron cargar las combinaciones del producto",
        variant: "destructive",
      })
      setError(error.message)
    } finally {
      setLoadingCombinaciones(false)
    }
  }

  // Cargar materiales por variación
  const cargarMaterialesVariacion = async () => {
    try {
      setIsLoadingVariaciones(true)
      const materiales = await bomApi.obtenerMaterialesVariacion(productoId!)
      setMaterialesVariaciones(materiales)
    } catch (error: any) {
      console.error('Error al cargar materiales por variación:', error)
      toast({
        description: "No se pudieron cargar los materiales por variación",
        variant: "destructive",
      })
      setError(error.message)
    } finally {
      setIsLoadingVariaciones(false)
    }
  }

  // Manejar cambio de categoría
  const handleCambioCategoria = (categoriaId: string) => {
    setCategoriaSeleccionada(categorias.find((c) => c.categoria_material_id.toString() === categoriaId) || null)
    setMapeoActual({})
    setBusquedaPorColor({})
    setMaterialesFiltradosPorColor({})
    setColorEnBusqueda("")
  }

  // Filtrar materiales según categoría y búsqueda para un color específico
  const handleBusquedaMaterial = (busqueda: string, colorNombre: string) => {
    setBusquedaPorColor((prev) => ({ ...prev, [colorNombre]: busqueda }))
    setColorEnBusqueda(colorNombre)

    if (!categoriaSeleccionada || busqueda.trim() === "") {
      setMaterialesFiltradosPorColor((prev) => ({ ...prev, [colorNombre]: [] }))
      return
    }

    const filtrados = materialesDisponibles.filter(
      (material) =>
        material.categoria_material_id === categoriaSeleccionada.categoria_material_id &&
        (material.descripcion_material.toLowerCase().includes(busqueda.toLowerCase()) ||
          material.codigo_material.toLowerCase().includes(busqueda.toLowerCase())),
    )
    setMaterialesFiltradosPorColor((prev) => ({ ...prev, [colorNombre]: filtrados.slice(0, 5) }))
  }

  // Seleccionar material para un color
  const handleSeleccionarMaterial = (material: Material, colorNombre: string) => {
    setMapeoActual((prev) => ({
      ...prev,
      [colorNombre]: material,
    }))
    setBusquedaPorColor((prev) => ({ ...prev, [colorNombre]: material.descripcion_material }))
    setMaterialesFiltradosPorColor((prev) => ({ ...prev, [colorNombre]: [] }))
    setColorEnBusqueda("")
  }

  // Limpiar búsqueda para un color
  const handleLimpiarBusqueda = (colorNombre: string) => {
    setBusquedaPorColor((prev) => ({ ...prev, [colorNombre]: "" }))
    setMaterialesFiltradosPorColor((prev) => ({ ...prev, [colorNombre]: [] }))
    setMapeoActual((prev) => {
      const nuevo = { ...prev }
      delete nuevo[colorNombre]
      return nuevo
    })
  }

  // Agregar o actualizar categoría con mapeo completo
  const handleAgregarCategoria = () => {
    if (!categoriaSeleccionada) {
      toast({
        description: "Seleccione una categoría",
        variant: "destructive"
      })
      return
    }

    // Verificar que todos los colores tengan material asignado
    const coloresSinMaterial = coloresProducto.filter((color) => !mapeoActual[color.nombre])
    if (coloresSinMaterial.length > 0) {
      toast({
        description: `Falta asignar material para: ${coloresSinMaterial.map((c) => c.nombre).join(", ")}`,
        variant: "destructive"
      })
      return
    }

    // Verificar si ya existe (para nuevas categorías)
    const existe = categoriasConfiguradas.find((item) => item.categoria.categoria_material_id === categoriaSeleccionada.categoria_material_id)
    if (existe) {
      toast({
        description: "Esta categoría ya está agregada",
        variant: "destructive"
      })
      return
    }

    const nuevaCategoria = {
      categoria: categoriaSeleccionada,
      esMaterialComun: false,
      esVariable: true,
      materialesAsignados: Object.values(mapeoActual).map(m => m.material_id),
      mapeoColores: { ...mapeoActual }
    }

    setCategoriasConfiguradas([...categoriasConfiguradas, nuevaCategoria])

    // Limpiar formulario
    setCategoriaSeleccionada(null)
    setMapeoActual({})
    setBusquedaPorColor({})
    setMaterialesFiltradosPorColor({})
    setColorEnBusqueda("")

    toast({
      description: "Insumo variable configurado correctamente"
    })
  }

  // Eliminar insumo variable
  const handleEliminarInsumo = (categoriaId: number) => {
    setCategoriasConfiguradas(categoriasConfiguradas.filter((item) => item.categoria.categoria_material_id !== categoriaId))
    toast({
      description: "Insumo variable eliminado"
    })
  }

  // Editar insumo variable existente
  const handleEditarInsumo = (categoriaId: number) => {
    const categoriaAEditar = categoriasConfiguradas.find(cat => cat.categoria.categoria_material_id === categoriaId)
    if (categoriaAEditar) {
      // Cargar los datos existentes en el formulario
      setCategoriaSeleccionada(categoriaAEditar.categoria)
      setMapeoActual(categoriaAEditar.mapeoColores || {})
      
      // Pre-llenar las búsquedas con los materiales actuales
      const busquedasIniciales: Record<string, string> = {}
      Object.entries(categoriaAEditar.mapeoColores || {}).forEach(([color, material]) => {
        busquedasIniciales[color] = (material as any)?.descripcion_material || ''
      })
      setBusquedaPorColor(busquedasIniciales)
      
      // Eliminar temporalmente la categoría del listado para poder re-agregarla
      setCategoriasConfiguradas(categoriasConfiguradas.filter(cat => cat.categoria.categoria_material_id !== categoriaId))
      
      toast({
        description: `Editando categoría: ${categoriaAEditar.categoria.nombre_categoria}`
      })
    }
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
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Insumos Variables (por Categoría)</h4>
              <p className="text-sm text-blue-800 mt-1">Configure qué material específico usar según el color del producto final.</p>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Selección de categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Categoría Variable</CardTitle>
          <CardDescription>Elija una categoría que varíe según el color del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Categoría Variable por Color</Label>
                <Select value={categoriaSeleccionadaId?.toString()} onValueChange={handleCambioCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.categoria_material_id} value={categoria.categoria_material_id.toString()}>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{categoria.nombre_categoria}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Información</Label>
                <div className="p-3 bg-muted rounded-md">
                  {categoriaSeleccionada ? (
                    <div className="text-sm">
                      <p><strong>Varía por color:</strong> {categoriaSeleccionada.tiene_color ? "Sí" : "No"}</p>
                      <p><strong>Varía por talla:</strong> {categoriaSeleccionada.tiene_talla ? "Sí" : "No"}</p>
                      <p className="text-blue-600 mt-1">
                        <strong>Uso:</strong> Esta categoría permite seleccionar diferentes materiales según el color del producto final.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Seleccione una categoría que varíe por color</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapeo por color */}
      {categoriaSeleccionada && (
        <Card>
          <CardHeader>
            <CardTitle>Mapeo: {categoriaSeleccionada.nombre_categoria} por Color</CardTitle>
            <CardDescription>Asigne un material específico para cada color del producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coloresProducto.map((color) => (
                <div key={color.nombre} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="font-medium">Color {color.nombre}</div>
                      <div className="text-sm text-muted-foreground">Producto en {color.nombre.toLowerCase()}</div>
                    </div>
                  </div>

                  <div className="col-span-2 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder={`Buscar ${categoriaSeleccionada.nombre_categoria}...`}
                        value={busquedaPorColor[color.nombre] || ""}
                        onChange={(e) => handleBusquedaMaterial(e.target.value, color.nombre)}
                        className="pl-10"
                        onFocus={() => setColorEnBusqueda(color.nombre)}
                      />
                      {mapeoActual[color.nombre] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => handleLimpiarBusqueda(color.nombre)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Resultados de búsqueda */}
                    {materialesFiltradosPorColor[color.nombre]?.length > 0 && colorEnBusqueda === color.nombre && (
                      <div className="absolute z-20 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                        {materialesFiltradosPorColor[color.nombre].map((material) => (
                          <div
                            key={material.material_id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => handleSeleccionarMaterial(material, color.nombre)}
                          >
                            <div className="font-medium">{material.descripcion_material}</div>
                            <div className="text-sm text-muted-foreground">
                              {material.codigo_material} • {material.cfg_unidades_medida?.abreviatura}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {mapeoActual[color.nombre] ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ✓ {mapeoActual[color.nombre].codigo_material}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleAgregarCategoria}
                disabled={coloresProducto.some((color) => !mapeoActual[color.nombre])}
              >
                <Plus className="mr-2 h-4 w-4" />
                {categoriasConfiguradas.find(cat => cat.categoria.categoria_material_id === categoriaSeleccionada?.categoria_material_id) 
                  ? "Actualizar Categoría Variable" 
                  : "Agregar Categoría Variable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de insumos variables configurados */}
      {categoriasConfiguradas.filter(cat => cat.categoria.tiene_color).length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Insumos Variables Configurados</CardTitle>
              <CardDescription>Mapeo de materiales por color del producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                  {categoriasConfiguradas.filter(cat => cat.categoria.tiene_color).map((insumo) => (
                    <Card key={insumo.categoria.categoria_material_id} className="bg-muted/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{insumo.categoria.nombre_categoria}</CardTitle>
                          <CardDescription>Mapeo por color del producto</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditarInsumo(insumo.categoria.categoria_material_id)}
                            title="Editar mapeo de materiales"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleEliminarInsumo(insumo.categoria.categoria_material_id)}
                            title="Eliminar categoría"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Color del Producto</TableHead>
                              <TableHead>Material Específico</TableHead>
                              <TableHead>Código</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {coloresProducto.map((color) => (
                              <TableRow key={color.nombre}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }} />
                                    {color.nombre}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {insumo.mapeoColores?.[color.nombre]?.descripcion_material || "No asignado"}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {insumo.mapeoColores?.[color.nombre]?.codigo_material || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}



      {/* Advertencia si no hay insumos variables */}
      {categoriasConfiguradas.filter(cat => cat.categoria.tiene_color).length === 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Paso Opcional</h4>
                <p className="text-sm text-orange-800 mt-1">
                  Si no hay materiales que varíen por color, puede continuar al siguiente paso. Este paso es solo para
                  materiales como telas, hilos, botones que cambian según el color del producto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
