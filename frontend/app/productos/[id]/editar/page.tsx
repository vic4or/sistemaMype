"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowRight, CheckCircle, Package, Palette } from "lucide-react"
import { toast } from "sonner"
import { productosApi } from "@/services/api/productos"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import type { Product, ProductoTallaColor } from "@/types/product"
import type { Color, Talla } from "@/types/api"

interface ProductoData {
  nombre: string
  codigo: string
  categoria: string
  estacion: string
  linea: string
  precio: number
  estado: boolean
}

interface Combinacion {
  id: string
  tallaId: number
  colorId: number
  tallaNombre: string
  colorNombre: string
  precio_venta: number
  estado: boolean
}

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Estados para tallas y colores
  const [tallas, setTallas] = useState<Talla[]>([])
  const [colores, setColores] = useState<Color[]>([])

  // Datos del producto
  const [productoData, setProductoData] = useState<ProductoData>({
    nombre: "",
    codigo: "",
    categoria: "",
    estacion: "",
    linea: "",
    precio: 0,
    estado: true,
  })

  // Estados para combinaciones
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<number[]>([])
  const [coloresSeleccionados, setColoresSeleccionados] = useState<number[]>([])
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([])
  const [combinacionesExistentes, setCombinacionesExistentes] = useState<ProductoTallaColor[]>([])

  const [busquedaTalla, setBusquedaTalla] = useState("")
  const [busquedaColor, setBusquedaColor] = useState("")

  // Cargar datos iniciales
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
        setProductoData({
          nombre: productoData.nombre || "",
          codigo: productoData.codigo || "",
          categoria: productoData.categoria || "",
          estacion: productoData.estacion || "",
          linea: productoData.linea || "",
          precio: productoData.precio || 0,
          estado: productoData.estado ?? true,
        })
        setCombinacionesExistentes(combinacionesData)
        setTallas(tallasData)
        setColores(coloresData)
        // Cargar combinaciones existentes
        const combinacionesIniciales = combinacionesData.map(combinacion => ({
          id: `${combinacion.talla_id}-${combinacion.color_id}`,
          tallaId: combinacion.talla_id || 0,
          colorId: combinacion.color_id || 0,
          tallaNombre: tallasData.find(t => t.talla_id === combinacion.talla_id)?.valor_talla || "",
          colorNombre: coloresData.find(c => c.color_id === combinacion.color_id)?.nombre_color || "",
          precio_venta: typeof combinacion.precio_venta === 'string' ? parseFloat(combinacion.precio_venta) : (combinacion.precio_venta || 0),
          estado: combinacion.estado ?? true,
        }))
        setCombinaciones(combinacionesIniciales)
        setTallasSeleccionadas([...new Set(combinacionesData.map(c => c.talla_id || 0))])
        setColoresSeleccionados([...new Set(combinacionesData.map(c => c.color_id || 0))])
      } catch (error) {
        toast.error("Error al cargar los datos del producto")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  // Manejar cambios en el formulario del producto
  const handleProductoChange = (field: keyof ProductoData, value: string | number | boolean) => {
    setProductoData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Guardar producto (Sección 1)
  const handleGuardarProducto = async () => {
    if (
      !productoData.nombre ||
      !productoData.codigo ||
      !productoData.categoria ||
      !productoData.estacion ||
      !productoData.linea ||
      !productoData.precio
    ) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }
    setIsSubmitting(true)
    try {
      await productosApi.update(Number(params.id), {
        nombre: productoData.nombre,
        codigo: productoData.codigo,
        categoria: productoData.categoria,
        estacion: productoData.estacion,
        linea: productoData.linea,
        precio: productoData.precio,
        estado: productoData.estado,
      })
      setCurrentStep(2)
      toast.success("Producto actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar el producto")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generar combinaciones (Sección 2)
  const handleGenerarCombinaciones = async () => {
    if (tallasSeleccionadas.length === 0 || coloresSeleccionados.length === 0) {
      toast.error("Seleccione al menos una talla y un color")
      return
    }
    setIsSubmitting(true)
    try {
      // Eliminar combinaciones que ya no existen
      const combinacionesAEliminar = combinacionesExistentes.filter(
        existente =>
          !tallasSeleccionadas.includes(existente.talla_id || 0) ||
          !coloresSeleccionados.includes(existente.color_id || 0)
      )
      await Promise.all(
        combinacionesAEliminar.map(combinacion =>
          productosApi.deleteCombinacion(combinacion.producto_tal_col_id || 0)
        )
      )
      // Actualizar el precio de todas las combinaciones existentes
      const combinacionesAActualizar = combinacionesExistentes.filter(
        existente =>
          tallasSeleccionadas.includes(existente.talla_id || 0) &&
          coloresSeleccionados.includes(existente.color_id || 0)
      )
      await Promise.all(
        combinacionesAActualizar.map(combinacion =>
          productosApi.updateCombinacion(combinacion.producto_tal_col_id, {
            precio_venta: productoData.precio.toString()
          })
        )
      )
      // Solo crear combinaciones que no existan
      const existentes = new Set(
        combinacionesExistentes.map(c => `${c.talla_id}-${c.color_id}`)
      )
      const nuevasCombinaciones: Array<{
        producto_id: number
        talla_id: number
        color_id: number
        precio_venta: string
        codigo: string
        estado: boolean
      }> = []
      
      tallasSeleccionadas.forEach(tallaId => {
        coloresSeleccionados.forEach(colorId => {
          const key = `${tallaId}-${colorId}`
          if (!existentes.has(key)) {
            const talla = tallas.find(t => t.talla_id === tallaId)
            const color = colores.find(c => c.color_id === colorId)
            const codigo = `${productoData.codigo}-${talla?.valor_talla}-${(color?.nombre_color || "").substring(0,3).toUpperCase()}`
            nuevasCombinaciones.push({
              producto_id: Number(params.id),
              talla_id: tallaId,
              color_id: colorId,
              precio_venta: productoData.precio.toString(),
              codigo,
              estado: true,
            })
          }
        })
      })
      await Promise.all(
        nuevasCombinaciones.map(combinacion =>
          productosApi.createCombinacion(combinacion)
        )
      )
      toast.success("Combinaciones actualizadas correctamente")
      router.push("/productos")
    } catch (error) {
      toast.error("Error al actualizar las combinaciones")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar indicador de progreso
  const renderProgressIndicator = () => {
    const steps = [
      { number: 1, title: "Datos Generales", icon: Package, completed: currentStep > 1 },
      { number: 2, title: "Combinaciones", icon: Palette, completed: false },
    ]
    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.completed
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : currentStep === step.number
                  ? "border-emerald-500 text-emerald-500"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {step.completed ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                step.completed || currentStep === step.number ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />}
          </div>
        ))}
      </div>
    )
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
          <p className="text-muted-foreground">Modifica la información del producto y sus combinaciones</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/productos")}>Volver a Productos</Button>
      </div>
      {renderProgressIndicator()}
      {/* Sección 1: Datos Generales */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />Datos Generales del Producto
            </CardTitle>
            <CardDescription>Modifica la información básica del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del producto *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Polo Básico Algodón"
                  value={productoData.nombre}
                  onChange={(e) => handleProductoChange("nombre", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código interno *</Label>
                <Input
                  id="codigo"
                  placeholder="Ej: POL001"
                  value={productoData.codigo}
                  onChange={(e) => handleProductoChange("codigo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={productoData.categoria}
                  onValueChange={(value) => handleProductoChange("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Polos">Polos</SelectItem>
                    <SelectItem value="Joggers">Joggers</SelectItem>
                    <SelectItem value="Cafarenas">Cafarenas</SelectItem>
                    <SelectItem value="Pantalones">Pantalones</SelectItem>
                    <SelectItem value="Shorts">Shorts</SelectItem>
                    <SelectItem value="Blusas">Blusas</SelectItem>
                    <SelectItem value="Vestidos">Vestidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estacion">Estación *</Label>
                <Select
                  value={productoData.estacion}
                  onValueChange={(value) => handleProductoChange("estacion", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verano">Verano</SelectItem>
                    <SelectItem value="Invierno">Invierno</SelectItem>
                    <SelectItem value="Otoño">Otoño</SelectItem>
                    <SelectItem value="Primavera">Primavera</SelectItem>
                    <SelectItem value="Todo el año">Todo el año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linea">Tipo *</Label>
                <Select
                  value={productoData.linea}
                  onValueChange={(value) => handleProductoChange("linea", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Inferior">Inferior</SelectItem>
                    <SelectItem value="Completa">Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio Base *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productoData.precio}
                  onChange={(e) => handleProductoChange("precio", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estado"
                    checked={productoData.estado}
                    onCheckedChange={(checked) => handleProductoChange("estado", checked as boolean)}
                  />
                  <Label htmlFor="estado">Activo</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGuardarProducto} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Siguiente"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Sección 2: Combinaciones */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />Combinaciones Talla-Color
            </CardTitle>
            <CardDescription>Modifica las combinaciones disponibles para este producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de tallas */}
            <div className="space-y-4">
              <Label>Tallas Disponibles</Label>
              <Input
                placeholder="Buscar talla..."
                value={busquedaTalla}
                onChange={(e) => setBusquedaTalla(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tallas
                  .filter(t => t.valor_talla?.toLowerCase().includes(busquedaTalla.toLowerCase()))
                  .map((talla) => (
                    <div key={talla.talla_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`talla-${talla.talla_id}`}
                        checked={tallasSeleccionadas.includes(talla.talla_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTallasSeleccionadas([...tallasSeleccionadas, talla.talla_id])
                          } else {
                            setTallasSeleccionadas(tallasSeleccionadas.filter((id) => id !== talla.talla_id))
                          }
                        }}
                      />
                      <Label htmlFor={`talla-${talla.talla_id}`}>{talla.valor_talla}</Label>
                    </div>
                  ))}
              </div>
            </div>
            {/* Selección de colores */}
            <div className="space-y-4">
              <Label>Colores Disponibles</Label>
              <Input
                placeholder="Buscar color..."
                value={busquedaColor}
                onChange={(e) => setBusquedaColor(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {colores
                  .filter(c => c.nombre_color?.toLowerCase().includes(busquedaColor.toLowerCase()))
                  .map((color) => (
                    <div key={color.color_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color.color_id}`}
                        checked={coloresSeleccionados.includes(color.color_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setColoresSeleccionados([...coloresSeleccionados, color.color_id])
                          } else {
                            setColoresSeleccionados(coloresSeleccionados.filter((id) => id !== color.color_id))
                          }
                        }}
                      />
                      <Label htmlFor={`color-${color.color_id}`} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.codigo_color }}
                        />
                        {color.nombre_color}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
            {/* Vista previa de combinaciones */}
            {combinaciones.length > 0 && (
              <div className="space-y-4">
                <Label>Vista Previa de Combinaciones</Label>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Talla</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinaciones.map((combinacion) => (
                        <TableRow key={combinacion.id}>
                          <TableCell>{combinacion.tallaNombre}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor:
                                    colores.find((c) => c.color_id === combinacion.colorId)?.codigo_color,
                                }}
                              />
                              {combinacion.colorNombre}
                            </div>
                          </TableCell>
                          <TableCell>
                            S/ {Number(combinacion.precio_venta).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={combinacion.estado ? "default" : "destructive"}>{combinacion.estado ? "Activo" : "Inactivo"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleGenerarCombinaciones} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Finalizar"}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
