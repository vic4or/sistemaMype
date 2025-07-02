"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para clientes
const clientesEjemplo = [
  { id: 1, name: "Tiendas Comercial S.A." },
  { id: 2, name: "Boutique Eleganza" },
  { id: 3, name: "ModaExpress" },
  { id: 4, name: "TrendsStore" },
  { id: 5, name: "Fashion Center" },
]

// Datos de ejemplo para productos
const productosEjemplo = [
  {
    id: 1,
    code: "CAM-001",
    name: "Camisa Casual Manga Larga",
    price: 89.9,
  },
  {
    id: 2,
    code: "PAN-002",
    name: "Pantalón Jean Skinny",
    price: 129.9,
  },
  {
    id: 3,
    code: "BLU-001",
    name: "Blusa Elegante",
    price: 79.9,
  },
  {
    id: 4,
    code: "POL-005",
    name: "Polo Sport",
    price: 59.9,
  },
]

// Catálogo de tallas disponibles
const catalogoTallas = [
  // Tallas para prendas superiores
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  // Tallas para pantalones
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
]

// Catálogo de colores disponibles
const catalogoColores = [
  "Blanco",
  "Negro",
  "Azul",
  "Rojo",
  "Verde",
  "Amarillo",
  "Gris",
  "Rosa",
  "Celeste",
  "Beige",
  "Marrón",
  "Naranja",
]

interface ProductoSeleccionado {
  productoId: number
  code: string
  name: string
  price: number
  matriz: {
    color: string
    tallas: {
      talla: string
      cantidad: number
    }[]
  }[]
  subtotal: number
}

export default function NuevoPedidoForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    customerId: "",
    deliveryDate: "",
    notes: "",
  })

  const [productos, setProductos] = useState<ProductoSeleccionado[]>([])
  const [currentProductId, setCurrentProductId] = useState("")
  const [currentProducto, setCurrentProducto] = useState<any>(null)
  const [matrizVisible, setMatrizVisible] = useState(false)

  // Estados para la selección personalizada de colores y tallas
  const [coloresSeleccionados, setColoresSeleccionados] = useState<string[]>([])
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([])
  const [nuevoColor, setNuevoColor] = useState("")
  const [nuevaTalla, setNuevaTalla] = useState("")

  // Estado para la matriz temporal
  const [matrizTemporal, setMatrizTemporal] = useState<
    {
      color: string
      tallas: {
        talla: string
        cantidad: number
      }[]
    }[]
  >([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProductChange = (value: string) => {
    setCurrentProductId(value)
    const producto = productosEjemplo.find((p) => p.id.toString() === value)
    setCurrentProducto(producto || null)

    if (producto) {
      // Resetear colores y tallas seleccionadas
      setColoresSeleccionados([])
      setTallasSeleccionadas([])
      setMatrizTemporal([])
      setMatrizVisible(true)
    } else {
      setMatrizVisible(false)
    }
  }

  // Manejar selección de color
  const handleColorChange = (value: string) => {
    setNuevoColor(value)
  }

  // Manejar selección de talla
  const handleTallaChange = (value: string) => {
    setNuevaTalla(value)
  }

  // Agregar color a la selección
  const agregarColor = () => {
    if (nuevoColor && !coloresSeleccionados.includes(nuevoColor)) {
      setColoresSeleccionados([...coloresSeleccionados, nuevoColor])
      setNuevoColor("")
      actualizarMatrizTemporal([...coloresSeleccionados, nuevoColor], tallasSeleccionadas)
    }
  }

  // Agregar talla a la selección
  const agregarTalla = () => {
    if (nuevaTalla && !tallasSeleccionadas.includes(nuevaTalla)) {
      setTallasSeleccionadas([...tallasSeleccionadas, nuevaTalla])
      setNuevaTalla("")
      actualizarMatrizTemporal(coloresSeleccionados, [...tallasSeleccionadas, nuevaTalla])
    }
  }

  // Eliminar color de la selección
  const eliminarColor = (color: string) => {
    const nuevosColores = coloresSeleccionados.filter((c) => c !== color)
    setColoresSeleccionados(nuevosColores)
    actualizarMatrizTemporal(nuevosColores, tallasSeleccionadas)
  }

  // Eliminar talla de la selección
  const eliminarTalla = (talla: string) => {
    const nuevasTallas = tallasSeleccionadas.filter((t) => t !== talla)
    setTallasSeleccionadas(nuevasTallas)
    actualizarMatrizTemporal(coloresSeleccionados, nuevasTallas)
  }

  // Actualizar matriz temporal cuando cambian colores o tallas
  const actualizarMatrizTemporal = (colores: string[], tallas: string[]) => {
    // Crear nueva matriz con los colores y tallas seleccionados
    const nuevaMatriz = colores.map((color) => {
      // Buscar si el color ya existe en la matriz actual
      const colorExistente = matrizTemporal.find((m) => m.color === color)

      if (colorExistente) {
        // Si el color existe, mantener las cantidades para las tallas que siguen existiendo
        return {
          color,
          tallas: tallas.map((talla) => {
            const tallaExistente = colorExistente.tallas.find((t) => t.talla === talla)
            return {
              talla,
              cantidad: tallaExistente ? tallaExistente.cantidad : 0,
            }
          }),
        }
      } else {
        // Si es un nuevo color, inicializar todas las tallas con cantidad 0
        return {
          color,
          tallas: tallas.map((talla) => ({
            talla,
            cantidad: 0,
          })),
        }
      }
    })

    setMatrizTemporal(nuevaMatriz)
  }

  const handleCantidadChange = (colorIndex: number, tallaIndex: number, value: string) => {
    const cantidad = Number.parseInt(value) || 0
    setMatrizTemporal((prev) => {
      const newMatriz = [...prev]
      newMatriz[colorIndex].tallas[tallaIndex].cantidad = cantidad
      return newMatriz
    })
  }

  const agregarProducto = () => {
    if (currentProducto && matrizTemporal.some((color) => color.tallas.some((talla) => talla.cantidad > 0))) {
      // Filtrar solo colores con al menos una talla con cantidad > 0
      const matrizFiltrada = matrizTemporal
        .map((color) => ({
          ...color,
          tallas: color.tallas.filter((talla) => talla.cantidad > 0),
        }))
        .filter((color) => color.tallas.length > 0)

      // Calcular subtotal
      const subtotal = matrizFiltrada.reduce(
        (sum, color) =>
          sum + color.tallas.reduce((subSum, talla) => subSum + talla.cantidad * currentProducto.price, 0),
        0,
      )

      const nuevoProducto: ProductoSeleccionado = {
        productoId: currentProducto.id,
        code: currentProducto.code,
        name: currentProducto.name,
        price: currentProducto.price,
        matriz: matrizFiltrada,
        subtotal,
      }

      setProductos([...productos, nuevoProducto])
      setCurrentProductId("")
      setCurrentProducto(null)
      setMatrizVisible(false)
      setMatrizTemporal([])
      setColoresSeleccionados([])
      setTallasSeleccionadas([])
    }
  }

  const eliminarProducto = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index))
  }

  const calcularTotal = () => {
    return productos.reduce((sum, producto) => sum + producto.subtotal, 0)
  }

  const calcularTotalUnidades = (producto: ProductoSeleccionado) => {
    return producto.matriz.reduce(
      (sum, color) => sum + color.tallas.reduce((subSum, talla) => subSum + talla.cantidad, 0),
      0,
    )
  }

  // INTEGRACIÓN CON BACKEND SPRING BOOT

  // 1. Agregar estados para manejar la carga y errores
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. Modificar la función handleSubmit para realizar la petición al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.customerId || productos.length === 0) {
        throw new Error("Debe seleccionar un cliente y agregar al menos un producto")
      }

      // Preparar datos para enviar
      const pedidoData = {
        customerId: Number.parseInt(formData.customerId),
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
        productos: productos.map((producto) => ({
          productoId: producto.productoId,
          precio: producto.price,
          matriz: producto.matriz,
        })),
        total: calcularTotal(),
      }

      console.log("Datos de pedido a enviar:", pedidoData)

      // Aquí iría la llamada al backend
      // const response = await fetch("http://localhost:8080/api/pedidos", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(pedidoData),
      // })

      // if (!response.ok) {
      //   throw new Error("Error al registrar el pedido")
      // }

      // const data = await response.json()
      // console.log("Pedido registrado:", data)

      // Simulación de respuesta exitosa
      console.log("Pedido registrado exitosamente")

      // Resetear el formulario y cerrar el diálogo
      setFormData({
        customerId: "",
        deliveryDate: "",
        notes: "",
      })
      setProductos([])
      setOpen(false)

      // Mostrar notificación de éxito (requiere un componente de toast)
      // toast({ title: "Éxito", description: "Pedido registrado correctamente" })

      // Si hay una función de callback para éxito, llamarla
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      // Mostrar notificación de error
      // toast({ title: "Error", description: error instanceof Error ? error.message : 'Error desconocido', variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
            <DialogDescription>
              Complete la información del pedido y agregue los productos con sus tallas y colores.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerId" className="text-right">
                Cliente
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => handleSelectChange("customerId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesEjemplo.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryDate" className="text-right">
                Fecha de Entrega
              </Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Agregar Productos</h4>
              <div className="grid grid-cols-12 gap-2 mb-4">
                <div className="col-span-10">
                  <Select value={currentProductId} onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productosEjemplo.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.code} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    onClick={agregarProducto}
                    className="w-full"
                    disabled={
                      !matrizVisible ||
                      !matrizTemporal.some((color) => color.tallas.some((talla) => talla.cantidad > 0))
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              {matrizVisible && currentProducto && (
                <div className="border rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-2">
                    {currentProducto.code} - {currentProducto.name} - S/. {currentProducto.price.toFixed(2)}
                  </h3>

                  {/* Selección de colores */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Seleccionar Colores</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {coloresSeleccionados.map((color) => (
                        <Badge key={color} className="flex items-center gap-1 px-3 py-1">
                          {color}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => eliminarColor(color)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={nuevoColor} onValueChange={handleColorChange}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar color" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogoColores
                            .filter((color) => !coloresSeleccionados.includes(color))
                            .map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={agregarColor} disabled={!nuevoColor}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Selección de tallas */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Seleccionar Tallas</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tallasSeleccionadas.map((talla) => (
                        <Badge key={talla} className="flex items-center gap-1 px-3 py-1">
                          {talla}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => eliminarTalla(talla)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={nuevaTalla} onValueChange={handleTallaChange}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar talla" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogoTallas
                            .filter((talla) => !tallasSeleccionadas.includes(talla))
                            .map((talla) => (
                              <SelectItem key={talla} value={talla}>
                                {talla}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={agregarTalla} disabled={!nuevaTalla}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Matriz de entrada */}
                  {coloresSeleccionados.length > 0 && tallasSeleccionadas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Color / Talla</TableHead>
                            {tallasSeleccionadas.map((talla) => (
                              <TableHead key={talla} className="text-center">
                                {talla}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matrizTemporal.map((color, colorIndex) => (
                            <TableRow key={colorIndex}>
                              <TableCell className="font-medium">{color.color}</TableCell>
                              {color.tallas.map((talla, tallaIndex) => (
                                <TableCell key={tallaIndex} className="text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={talla.cantidad || ""}
                                    onChange={(e) => handleCantidadChange(colorIndex, tallaIndex, e.target.value)}
                                    className="w-16 text-center mx-auto"
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Seleccione al menos un color y una talla para crear la matriz.
                    </div>
                  )}
                </div>
              )}

              {productos.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productos.map((producto, index) => {
                        const totalUnidades = calcularTotalUnidades(producto)
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{producto.code}</TableCell>
                            <TableCell>
                              <div>
                                <p>{producto.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {producto.matriz
                                    .map(
                                      (color) =>
                                        `${color.color}: ${color.tallas
                                          .map((t) => `${t.talla}(${t.cantidad})`)
                                          .join(", ")}`,
                                    )
                                    .join(" | ")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{producto.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{totalUnidades}</TableCell>
                            <TableCell className="text-right">{producto.subtotal.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarProducto(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold">S/. {calcularTotal().toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay productos agregados. Agregue al menos un producto.
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Instrucciones adicionales para el pedido"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
