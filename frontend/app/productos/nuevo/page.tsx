"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowRight, CheckCircle, Package, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { productosApi } from "@/services/api/productos"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import type { Color, Talla } from "@/types/api"

interface ProductoData {
  nombre: string
  codigo: string
  categoria: string
  estacion: string
  linea: string
  precio: number
}

interface Combinacion {
  id: string
  tallaId: number
  colorId: number
  tallaNombre: string
  colorNombre: string
  precio_venta: number
  codigo: string
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [productoId, setProductoId] = useState<number | null>(null)
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
  })

  // Estados para combinaciones
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<number[]>([])
  const [coloresSeleccionados, setColoresSeleccionados] = useState<number[]>([])
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([])

  const [busquedaTalla, setBusquedaTalla] = useState("")
  const [busquedaColor, setBusquedaColor] = useState("")

  // Cargar tallas y colores
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [tallasData, coloresData] = await Promise.all([
          tallasApi.getAll(),
          coloresApi.getAll()
        ])
        setTallas(tallasData)
        setColores(coloresData)
      } catch (error) {
        toast.error("Error al cargar tallas y colores")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Manejar cambios en el formulario del producto
  const handleProductoChange = (field: keyof ProductoData, value: string | number) => {
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
      const newProducto = await productosApi.create({
        nombre: productoData.nombre,
        codigo: productoData.codigo,
        categoria: productoData.categoria,
        estacion: productoData.estacion,
        linea: productoData.linea,
        precio: productoData.precio,
        estado: true,
      })
      if (!newProducto || !newProducto.producto_id) {
        throw new Error("No se recibió un ID de producto válido")
      }
      setProductoId(newProducto.producto_id)
      setCurrentStep(2)
      toast.success("Producto guardado correctamente")
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast.error("Error al guardar el producto")
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
    if (!productoId) {
      toast.error("Error: No se encontró el ID del producto")
      return
    }
    const nuevasCombinaciones: Combinacion[] = []
    tallasSeleccionadas.forEach((tallaId) => {
      coloresSeleccionados.forEach((colorId) => {
        const talla = tallas.find((t) => t.talla_id === tallaId)
        const color = colores.find((c) => c.color_id === colorId)
        if (talla && color) {
          // Código: codigo_producto_Base-Talla-(tres primeras letras del color)
          const codigo = `${productoData.codigo}-${talla.valor_talla}-${(color.nombre_color || "").substring(0,3).toUpperCase()}`
          nuevasCombinaciones.push({
            id: `${tallaId}-${colorId}`,
            tallaId,
            colorId,
            tallaNombre: talla.valor_talla || "",
            colorNombre: color.nombre_color || "",
            precio_venta: productoData.precio,
            codigo,
          } as any)
        }
      })
    })
    setCombinaciones(nuevasCombinaciones)
    setIsSubmitting(true)
    try {
      const promises = nuevasCombinaciones.map((combinacion) =>
        productosApi.createCombinacion({
          producto_id: productoId,
          talla_id: combinacion.tallaId,
          color_id: combinacion.colorId,
          precio_venta: productoData.precio.toString(),
          codigo: combinacion.codigo,
          estado: true,
        })
      )
      await Promise.all(promises)
      toast.success(`Producto creado con ${nuevasCombinaciones.length} combinaciones`)
      router.push("/productos")
    } catch (error) {
      console.error("Error al guardar combinaciones:", error)
      toast.error("Error al guardar las combinaciones")
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="text-muted-foreground">Registra un nuevo producto de confección</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/productos")}>Volver a Productos</Button>
      </div>
      {renderProgressIndicator()}
      {/* Sección 1: Datos Generales */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Datos Generales del Producto
            </CardTitle>
            <CardDescription>Complete la información básica del producto</CardDescription>
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
              <Palette className="w-5 h-5" />
              Combinaciones Talla-Color
            </CardTitle>
            <CardDescription>Seleccione las tallas y colores disponibles para este producto</CardDescription>
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
                          <TableCell>S/ {typeof combinacion.precio_venta === "number" ? combinacion.precio_venta.toFixed(2) : "0.00"}</TableCell>
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
