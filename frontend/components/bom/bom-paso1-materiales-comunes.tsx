"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Search, Package, Palette, Ruler } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBOMStore } from "@/stores/bom-store"
import { bomApi } from "@/services/api/bom"
import { categoriasMaterialApi } from "@/services/api/configuracion"
import { materialesApi } from "@/services/api/materiales"
import type { BOMComun } from "@/types/bom"
import type { CategoriaMaterial } from "@/types/api"
import type { Material } from "@/types/api"

interface MaterialComun extends BOMComun {
  mat_materiales: {
    codigo_material: string
    descripcion_material: string
  }
  cfg_unidades_medida: {
    abreviatura: string
  }
}

export default function BOMPaso1MaterialesComunes() {
  const { toast } = useToast()
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaMaterial | null>(null)
  const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  
  // Estado global
  const {
    productoId,
    materialesComunes,
    isLoadingComunes,
    setMaterialesComunes,
    setIsLoadingComunes,
    setError
  } = useBOMStore()

  const [busquedaMaterial, setBusquedaMaterial] = useState("")
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)
  const [cantidad, setCantidad] = useState("")
  const [materialesFiltrados, setMaterialesFiltrados] = useState<Material[]>([])

  // Obtener categoría seleccionada
  const categoriaSeleccionadaId = categoriaSeleccionada?.categoria_material_id

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias()
    cargarMateriales()
  }, [])

  // Cargar materiales al montar
  useEffect(() => {
    if (!productoId) return
    cargarMaterialesComunes()
  }, [productoId])

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true)
      console.log('Iniciando carga de categorías...')
      const data = await categoriasMaterialApi.getAll()
      console.log('Categorías cargadas:', data)
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron cargar las categorías de materiales"
      })
      if (error instanceof Error) {
        setError(error.message)
      }
    } finally {
      setLoadingCategorias(false)
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

  // Cargar materiales comunes
  const cargarMaterialesComunes = async () => {
    try {
      setIsLoadingComunes(true)
      const materiales = await bomApi.obtenerMaterialesComunes(productoId!)
      setMaterialesComunes(materiales)
    } catch (error) {
      console.error('Error al cargar materiales comunes:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron cargar los materiales comunes"
      })
      if (error instanceof Error) {
        setError(error.message)
      }
    } finally {
      setIsLoadingComunes(false)
    }
  }

  // Guardar todos los materiales comunes en lote
  const guardarMaterialesComunes = async () => {
    try {
      if (materialesComunes.length === 0) {
        toast({
          variant: "destructive",
          description: "No hay materiales para guardar"
        })
        return
      }

      setIsLoadingComunes(true)
      
                    const dto: import('@/types/bom').CrearBOMComunDto = {
        usuario: "Usuario", // TODO: Obtener del contexto de auth
        items: materialesComunes.map(material => {
          const unidadConsumo = (material as any).unidad_consumo_id || material.unidad_medida_id
          console.log(`🔧 [Guardar Paso 1] ${(material as any).mat_materiales?.descripcion_material}: unidad_consumo_id=${(material as any).unidad_consumo_id}, unidad_medida_id=${material.unidad_medida_id}, usando=${unidadConsumo}`)
          return {
            producto_id: material.producto_id,
            material_id: material.material_id,
            unidad_medida_id: unidadConsumo,
            cantidad_consumo_base: material.cantidad_consumo_base
          }
        })
      }

      await bomApi.guardarMaterialesComunes(dto)
      
      toast({
        description: `${materialesComunes.length} materiales comunes guardados correctamente`
      })
      
      // Recargar lista para obtener los datos actualizados del servidor
      await cargarMaterialesComunes()
    } catch (error) {
      console.error('Error al guardar materiales comunes:', error)
      toast({
        variant: "destructive",
        description: "No se pudieron guardar los materiales comunes"
      })
      if (error instanceof Error) {
        setError(error.message)
      }
    } finally {
      setIsLoadingComunes(false)
    }
  }

  // Validar campos antes de agregar
  const validarCampos = () => {
    if (!categoriaSeleccionada) {
      throw new Error("Debe seleccionar una categoría")
    }
    if (!materialSeleccionado) {
      throw new Error("Debe seleccionar un material")
    }
    if (!categoriaSeleccionada.tiene_talla && (!cantidad || Number.parseFloat(cantidad) <= 0)) {
      throw new Error("Debe especificar una cantidad válida")
    }
  }

  // Filtrar materiales según categoría y búsqueda
  const handleBusquedaMaterial = (busqueda: string) => {
    setBusquedaMaterial(busqueda)
    if (!categoriaSeleccionada || busqueda.trim() === "") {
      setMaterialesFiltrados([])
      return
    }

    const filtrados = materialesDisponibles.filter(
      (material) =>
        material.categoria_material_id === categoriaSeleccionada.categoria_material_id &&
        (material.descripcion_material.toLowerCase().includes(busqueda.toLowerCase()) ||
          material.codigo_material.toLowerCase().includes(busqueda.toLowerCase())),
    )
    setMaterialesFiltrados(filtrados.slice(0, 5))
  }

  // Seleccionar material
  const handleSeleccionarMaterial = (material: Material) => {
    setMaterialSeleccionado(material)
    setBusquedaMaterial(material.descripcion_material)
    setMaterialesFiltrados([])
  }

  // Manejar cambio de categoría
  const handleCambioCategoria = (categoriaId: string) => {
    setCategoriaSeleccionada(categorias.find((c) => c.categoria_material_id.toString() === categoriaId) || null)
    setMaterialSeleccionado(null)
    setBusquedaMaterial("")
    setMaterialesFiltrados([])
    setCantidad("")
  }

  // Agregar material común (solo al estado local)
  const handleAgregarMaterial = () => {
    try {
      validarCampos()

      // Verificar si ya existe
      const existe = materialesComunes.find((item) => item.material_id === materialSeleccionado!.material_id)
      if (existe) {
        toast({
          variant: "destructive",
          description: "Este material ya está agregado"
        })
        return
      }

      const unidadConsumo = (materialSeleccionado as any).unidad_consumo_id || materialSeleccionado!.unidad_medida_id
      console.log(`🔧 [Paso 1] Agregando material ${materialSeleccionado!.descripcion_material}: unidad_consumo_id=${(materialSeleccionado as any).unidad_consumo_id}, unidad_medida_id=${materialSeleccionado!.unidad_medida_id}, usando=${unidadConsumo}`)

      const nuevoMaterial: BOMComun = {
        producto_id: productoId!,
        material_id: materialSeleccionado!.material_id,
        unidad_medida_id: unidadConsumo,
        cantidad_consumo_base: categoriaSeleccionada!.tiene_talla ? 1 : Number.parseFloat(cantidad),
        usuario_creacion: "Usuario", // TODO: Obtener del contexto de auth
        mat_materiales: {
          codigo_material: materialSeleccionado!.codigo_material,
          descripcion_material: materialSeleccionado!.descripcion_material
        },
        cfg_unidades_medida: {
          abreviatura: materialSeleccionado!.cfg_unidades_medida?.abreviatura || ""
        }
      }

      setMaterialesComunes([...materialesComunes, nuevoMaterial])

      // Limpiar formulario
      setCategoriaSeleccionada(null)
      setMaterialSeleccionado(null)
      setBusquedaMaterial("")
      setCantidad("")

      toast({
        description: "Material común agregado a la lista"
      })
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          description: error.message
        })
      }
    }
  }

  // Eliminar material común
  const handleEliminarMaterial = async (material_id: number) => {
    try {
      setMaterialesComunes(materialesComunes.filter(m => m.material_id !== material_id))
      toast({
        description: "Material eliminado correctamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "No se pudo eliminar el material"
      })
    }
  }

  const getBehaviorDescription = (categoria: CategoriaMaterial) => {
    if (!categoria.tiene_talla && !categoria.tiene_color) {
      return "Material específico con cantidad fija"
    }
    if (categoria.tiene_talla) {
      return "Match automático por TALLA_ID"
    }
    if (categoria.tiene_color) {
      return "Restringido desde la lógica"
    }
    return ""
  }

  // Renderizar tabla de materiales
  const renderTabla = (items: MaterialComun[]) => {
    if (!items.length) {
      return <div className="text-center py-4">No hay materiales registrados</div>
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Consumo Base</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.material_id}>
              <TableCell>{item.mat_materiales?.descripcion_material}</TableCell>
              <TableCell>{item.cfg_unidades_medida?.abreviatura}</TableCell>
              <TableCell>{item.cantidad_consumo_base}</TableCell>
              <TableCell>
                <button onClick={() => handleEliminarMaterial(item.material_id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
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
              <h4 className="font-medium text-blue-900">Materiales Comunes (BOM Base por Categoría)</h4>
              <div className="text-sm text-blue-800 mt-1 space-y-1">
                <p>Seleccione categorías de materiales comunes y configure sus cantidades base.</p>
                <p className="text-yellow-800">
                  <strong>📋 Este paso NO GUARDA al backend.</strong> Los datos se mantienen en memoria hasta "Finalizar BOM".
                </p>
                <p>
                  <strong>Comportamiento según categoría:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>Sin talla/color:</strong> Dropdown específico + cantidad fija
                  </li>
                  <li>
                    <strong>Con talla:</strong> Solo cantidad (match automático por TALLA_ID)
                  </li>
                  <li>
                    <strong>Con color:</strong> Restringido desde la lógica
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Material Común</CardTitle>
          <CardDescription>Seleccione una categoría y configure el material base</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">


          {/* Selección de categoría con combobox */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoriaSeleccionadaId?.toString()} onValueChange={handleCambioCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingCategorias 
                      ? "Cargando categorías..." 
                      : categorias.length === 0 
                        ? "No hay categorías disponibles" 
                        : "Seleccionar categoría"
                  } />
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
              {categoriaSeleccionada && (
                <div className="text-xs text-muted-foreground">{getBehaviorDescription(categoriaSeleccionada)}</div>
              )}
            </div>

            {/* Búsqueda de material */}
            <div className="space-y-2 relative">
              <Label>Buscar Material</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={
                    categoriaSeleccionada ? `Buscar en ${categoriaSeleccionada.nombre_categoria}...` : "Seleccione categoría"
                  }
                  value={busquedaMaterial}
                  onChange={(e) => handleBusquedaMaterial(e.target.value)}
                  className="pl-10"
                  disabled={!categoriaSeleccionada}
                />
              </div>

              {/* Resultados de búsqueda */}
              {materialesFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {materialesFiltrados.map((material) => (
                    <div
                      key={material.material_id}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSeleccionarMaterial(material)}
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

            {/* Campo de cantidad - condicional según tipo de categoría */}
            {categoriaSeleccionada?.tiene_talla ? (
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-900">Automático</div>
                  <div className="text-xs text-blue-700">Por talla</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  disabled={!categoriaSeleccionada}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Acción</Label>
              <Button
                className="w-full"
                onClick={handleAgregarMaterial}
                disabled={
                  !categoriaSeleccionada || !materialSeleccionado || (!categoriaSeleccionada.tiene_talla && !cantidad)
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Vista previa del material seleccionado */}
          {materialSeleccionado && categoriaSeleccionada && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Material Seleccionado</h4>
              <div className="text-sm text-green-800">
                <p>
                  <strong>Material:</strong> {materialSeleccionado.descripcion_material}
                </p>
                <p>
                  <strong>Código:</strong> {materialSeleccionado.codigo_material}
                </p>
                <p>
                  <strong>Categoría:</strong> {categoriaSeleccionada.nombre_categoria}
                </p>
                <p>
                  <strong>Comportamiento:</strong> {getBehaviorDescription(categoriaSeleccionada)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de materiales agregados */}
      {materialesComunes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Materiales Comunes Configurados</CardTitle>
            <CardDescription>Resumen de materiales base agregados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingComunes ? (
              <div>Cargando...</div>
            ) : (
              renderTabla(materialesComunes as MaterialComun[])
            )}
            
            {/* Info: Los materiales se guardarán al finalizar el BOM */}
            <div className="flex justify-end">
              <div className="text-sm text-muted-foreground bg-blue-50 px-3 py-2 rounded-md">
                📝 {materialesComunes.length} material{materialesComunes.length !== 1 ? 'es' : ''} configurado{materialesComunes.length !== 1 ? 's' : ''} 
                • Se guardará{materialesComunes.length !== 1 ? 'n' : ''} al finalizar el BOM
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
