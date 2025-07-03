"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ArrowRight, ShoppingCart, CheckSquare, Square } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { pedidosApi } from "@/services/api/pedidos"
import { productosApi } from "@/services/api/productos"
import { clientesApi } from "@/services/api/clientes"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import type { Cliente, Color, Talla } from "@/types/api"
import type { Product, ProductoTallaColor } from "@/types/product"

interface FormData {
  clienteId: string
  productoId: string
  fechaPedido: string
  fechaEntrega: string
  direccionEnvio: string
  observaciones: string
}

interface MatrizCantidades {
  [colorId: number]: {
    [tallaId: number]: number
  }
}

interface ColorDisponible {
  id: number
  name: string
  hex: string
}

interface TallaDisponible {
  id: number
  name: string
}

interface CombinacionesDisponibles {
  colores: ColorDisponible[]
  tallas: TallaDisponible[]
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fechaError, setFechaError] = useState<string | null>(null)

  // Estados para datos del formulario
  const [formData, setFormData] = useState<FormData>({
    clienteId: "",
    productoId: "",
    fechaPedido: "",
    fechaEntrega: "",
    direccionEnvio: "",
    observaciones: "",
  })

  // Estados para clientes y productos
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Product[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])

  // Estados para combinaciones
  const [combinacionesProducto, setCombinacionesProducto] = useState<ProductoTallaColor[]>([])
  const [combinacionesSeleccionadas, setCombinacionesSeleccionadas] = useState<Set<string>>(new Set())
  const [matrizCantidades, setMatrizCantidades] = useState<MatrizCantidades>({})
  const [cantidadRapida, setCantidadRapida] = useState("")
  const [mostrarLlenadoRapido, setMostrarLlenadoRapido] = useState(false)

  const clienteSeleccionado = clientes.find((c) => c.cliente_id.toString() === formData.clienteId)
  const productoSeleccionado = productos.find((p) => p.producto_id.toString() === formData.productoId)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientesData, productosData, coloresData, tallasData] = await Promise.all([
          clientesApi.getAll(),
          productosApi.getAll(),
          coloresApi.getAll(),
          tallasApi.getAll()
        ])
        
        console.log('🎨 Colores cargados:', coloresData.map(c => ({
          id: c.color_id,
          nombre: c.nombre_color,
          hex: c.codigo_color,
          estructura_completa: c
        })))
        
        setClientes(clientesData)
        setProductos(productosData)
        setColores(coloresData)
        setTallas(tallasData)
        
        // Establecer fecha de pedido por defecto
        setFormData(prev => ({
          ...prev,
          fechaPedido: new Date().toISOString().split("T")[0]
        }))
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar los datos iniciales")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Cargar combinaciones cuando se selecciona un producto
  useEffect(() => {
    const loadCombinaciones = async () => {
      if (formData.productoId) {
        try {
          console.log('Cargando combinaciones para producto:', formData.productoId)
          const combinaciones = await productosApi.getCombinaciones(Number(formData.productoId))
          console.log('Combinaciones recibidas:', combinaciones)
          setCombinacionesProducto(combinaciones)
        } catch (error) {
          console.error("Error detallado al cargar combinaciones:", error)
          toast.error("Error al cargar las combinaciones del producto")
        }
      } else {
        setCombinacionesProducto([])
      }
    }
    loadCombinaciones()
  }, [formData.productoId])

  // Procesar combinaciones para la matriz
  const combinacionesDisponibles: CombinacionesDisponibles | null = formData.productoId ? {
    colores: Array.from(new Set(combinacionesProducto
      .map(c => c.color_id)
      .filter((id): id is number => id !== undefined)))
      .map(colorId => {
        const color = colores.find(c => c.color_id === colorId)
        console.log('🎨 Debug color mapping:', {
          colorId,
          colorFound: color,
          hex: color?.codigo_color,
          name: color?.nombre_color
        })
        return {
          id: colorId,
          name: color?.nombre_color || `Color ${colorId}`,
          hex: color?.codigo_color || "#cccccc"
        }
      }),
    tallas: Array.from(new Set(combinacionesProducto
      .map(c => c.talla_id)
      .filter((id): id is number => id !== undefined)))
      .map(tallaId => {
        const talla = tallas.find(t => t.talla_id === tallaId)
        return {
          id: tallaId,
          name: talla?.valor_talla || `Talla ${tallaId}`
        }
      })
  } : null

  // Validar fechas
  const validateFechas = (fechaPedido: string, fechaEntrega: string) => {
    if (!fechaPedido || !fechaEntrega) return null

    const pedido = new Date(fechaPedido)
    const entrega = new Date(fechaEntrega)

    if (entrega < pedido) {
      return "La fecha de entrega no puede ser anterior a la fecha del pedido"
    }

    return null
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Validar fechas cuando cambien
    if (field === "fechaPedido" || field === "fechaEntrega") {
      const nuevaFechaPedido = field === "fechaPedido" ? value : formData.fechaPedido
      const nuevaFechaEntrega = field === "fechaEntrega" ? value : formData.fechaEntrega

      if (nuevaFechaPedido && nuevaFechaEntrega) {
        const error = validateFechas(nuevaFechaPedido, nuevaFechaEntrega)
        setFechaError(error)
      }
    }

    // Auto-completar dirección si se selecciona un cliente
    if (field === "clienteId") {
      const cliente = clientes.find((c) => c.cliente_id.toString() === value)
      if (cliente) {
        setFormData((prev) => ({ ...prev, direccionEnvio: cliente.direccion || "" }))
      }
    }

    // Limpiar combinaciones si cambia el producto
    if (field === "productoId") {
      setCombinacionesSeleccionadas(new Set())
      setMatrizCantidades({})
    }
  }

  const getCombinacionKey = (colorId: number, tallaId: number) => `${colorId}-${tallaId}`

  const handleCombinacionToggle = (colorId: number, tallaId: number, checked: boolean) => {
    const key = getCombinacionKey(colorId, tallaId)
    const newSet = new Set(combinacionesSeleccionadas)

    if (checked) {
      newSet.add(key)
    } else {
      newSet.delete(key)
      // Limpiar cantidad si se deselecciona
      setMatrizCantidades((prev) => {
        const newMatriz = { ...prev }
        if (newMatriz[colorId]) {
          delete newMatriz[colorId][tallaId]
          if (Object.keys(newMatriz[colorId]).length === 0) {
            delete newMatriz[colorId]
          }
        }
        return newMatriz
      })
    }

    setCombinacionesSeleccionadas(newSet)
  }

  const isCombinacionSeleccionada = (colorId: number, tallaId: number) => {
    return combinacionesSeleccionadas.has(getCombinacionKey(colorId, tallaId))
  }

  // Funciones para selección masiva
  const seleccionarTodo = () => {
    if (!combinacionesDisponibles) return

    const newSet = new Set<string>()
    combinacionesDisponibles.colores.forEach((color) => {
      combinacionesDisponibles.tallas.forEach((talla) => {
        newSet.add(getCombinacionKey(color.id, talla.id))
      })
    })
    setCombinacionesSeleccionadas(newSet)
  }

  const deseleccionarTodo = () => {
    setCombinacionesSeleccionadas(new Set())
    setMatrizCantidades({})
  }

  const seleccionarFila = (colorId: number) => {
    if (!combinacionesDisponibles) return

    const newSet = new Set(combinacionesSeleccionadas)
    combinacionesDisponibles.tallas.forEach((talla) => {
      newSet.add(getCombinacionKey(colorId, talla.id))
    })
    setCombinacionesSeleccionadas(newSet)
  }

  const seleccionarColumna = (tallaId: number) => {
    if (!combinacionesDisponibles) return

    const newSet = new Set(combinacionesSeleccionadas)
    combinacionesDisponibles.colores.forEach((color) => {
      newSet.add(getCombinacionKey(color.id, tallaId))
    })
    setCombinacionesSeleccionadas(newSet)
  }

  const continuarPaso2 = () => {
    setPaso(2)
  }

  const volverPaso1 = () => {
    setPaso(1)
  }

  const handleCantidadChange = (colorId: number, tallaId: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0
    setMatrizCantidades((prev) => {
      const newMatriz = { ...prev }
      if (!newMatriz[colorId]) newMatriz[colorId] = {}
      newMatriz[colorId][tallaId] = cantidadNum
      return newMatriz
    })
  }

  const calcularTotal = () => {
    let total = 0
    for (const [colorId, tallas] of Object.entries(matrizCantidades)) {
      for (const [tallaId, cantidad] of Object.entries(tallas)) {
        const cantidadNum = Number(cantidad) || 0
        if (cantidadNum > 0) {
          const combinacion = combinacionesProducto.find(
            c => c.color_id === Number(colorId) && c.talla_id === Number(tallaId)
          )
          if (combinacion && combinacion.precio_venta) {
            total += cantidadNum * parseFloat(combinacion.precio_venta)
          }
        }
      }
    }
    return total
  }

  const calcularTotalUnidades = () => {
    let total = 0
    for (const tallas of Object.values(matrizCantidades)) {
      for (const cantidad of Object.values(tallas)) {
        total += Number(cantidad) || 0
      }
    }
    return total
  }

  const llenarFilaCompleta = (colorId: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0
    if (cantidadNum <= 0) return

    setMatrizCantidades((prev) => {
      const newMatriz = { ...prev }
      if (!newMatriz[colorId]) newMatriz[colorId] = {}
      combinacionesDisponibles?.tallas.forEach((talla) => {
        if (isCombinacionSeleccionada(colorId, talla.id)) {
          newMatriz[colorId][talla.id] = cantidadNum
        }
      })
      return newMatriz
    })
  }

  const llenarColumnaCompleta = (tallaId: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0
    if (cantidadNum <= 0) return

    setMatrizCantidades((prev) => {
      const newMatriz = { ...prev }
      combinacionesDisponibles?.colores.forEach((color) => {
        if (isCombinacionSeleccionada(color.id, tallaId)) {
          if (!newMatriz[color.id]) newMatriz[color.id] = {}
          newMatriz[color.id][tallaId] = cantidadNum
        }
      })
      return newMatriz
    })
  }

  const llenarTodoConCantidad = (cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0
    if (cantidadNum <= 0) return

    setMatrizCantidades((prev) => {
      const newMatriz = { ...prev }
      combinacionesDisponibles?.colores.forEach((color) => {
        if (!newMatriz[color.id]) newMatriz[color.id] = {}
        combinacionesDisponibles?.tallas.forEach((talla) => {
          if (isCombinacionSeleccionada(color.id, talla.id)) {
            newMatriz[color.id][talla.id] = cantidadNum
          }
        })
      })
      return newMatriz
    })
  }

  const handleSubmit = async () => {
    if (fechaError) {
      toast.error("Por favor corrija los errores de fecha antes de guardar")
      return
    }

    if (calcularTotalUnidades() === 0) {
      toast.error("Debe ingresar al menos una cantidad mayor a cero")
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar detalles del pedido
      const detalles = []
      for (const [colorId, tallas] of Object.entries(matrizCantidades)) {
        for (const [tallaId, cantidad] of Object.entries(tallas)) {
          const cantidadNum = Number(cantidad) || 0
          if (cantidadNum > 0) {
            const combinacion = combinacionesProducto.find(
              c => c.color_id === Number(colorId) && c.talla_id === Number(tallaId)
            )
            if (combinacion) {
              detalles.push({
                producto_tal_col_id: combinacion.producto_tal_col_id,
                cantidad_solicitada: cantidadNum,
              })
            }
          }
        }
      }

      const pedidoData = {
        cliente_id: Number(formData.clienteId),
        producto_id: Number(formData.productoId),
        fecha_pedido: formData.fechaPedido,
        fecha_entrega: formData.fechaEntrega,
        direccion_envio: formData.direccionEnvio,
        observaciones: formData.observaciones,
        detalles,
      }

      await pedidosApi.create(pedidoData)
      toast.success("Pedido creado correctamente")
      router.push("/pedidos")
    } catch (error) {
      console.error("Error al crear pedido:", error)
      toast.error("Error al crear el pedido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const puedeAvanzar =
    formData.clienteId &&
    formData.productoId &&
    formData.fechaEntrega &&
    combinacionesSeleccionadas.size > 0 &&
    !fechaError

  // Renderizar tabla de combinaciones
  const renderCombinacionesTable = () => {
    if (!combinacionesDisponibles) return null

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Combinaciones Disponibles para {productoSeleccionado?.nombre}</h3>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={seleccionarTodo}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Seleccionar Todo
            </Button>
            <Button variant="outline" size="sm" onClick={deseleccionarTodo}>
              <Square className="h-4 w-4 mr-2" />
              Deseleccionar Todo
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color / Talla</TableHead>
                {combinacionesDisponibles.tallas.map((talla) => (
                  <TableHead key={talla.id} className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span>{talla.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => seleccionarColumna(talla.id)}
                        className="h-6 px-2"
                      >
                        Sel. Col.
                      </Button>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinacionesDisponibles.colores.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                        title={`Color: ${color.name} (${color.hex})`}
                      />
                      <span>{color.name}</span>
                    </div>
                  </TableCell>
                  {combinacionesDisponibles.tallas.map((talla) => (
                    <TableCell key={talla.id} className="text-center">
                      <Checkbox
                        checked={isCombinacionSeleccionada(color.id, talla.id)}
                        onCheckedChange={(checked) =>
                          handleCombinacionToggle(color.id, talla.id, checked === true)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => seleccionarFila(color.id)}
                      className="h-6 px-2"
                    >
                      Sel. Fila
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const formatPrecio = (precio: any): string => {
    const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : Number(precio)
    return isNaN(precioNumerico) ? "0.00" : precioNumerico.toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pedidos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Pedido</h1>
          <p className="text-muted-foreground">
            Paso {paso} de 2: {paso === 1 ? "Selección de combinaciones" : "Ingreso de cantidades"}
          </p>
        </div>
      </div>

      {paso === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              Información del Pedido y Selección de Combinaciones
            </CardTitle>
            <CardDescription>
              Complete la información básica y seleccione las combinaciones de talla y color para el pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulario básico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select value={formData.clienteId} onValueChange={(value) => handleInputChange("clienteId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="producto">Producto *</Label>
                <Select value={formData.productoId} onValueChange={(value) => handleInputChange("productoId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.producto_id} value={producto.producto_id.toString()}>
                        {producto.codigo} - {producto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaPedido">Fecha del Pedido</Label>
                <Input
                  id="fechaPedido"
                  type="date"
                  value={formData.fechaPedido}
                  onChange={(e) => handleInputChange("fechaPedido", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrega">Fecha de Entrega *</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={(e) => handleInputChange("fechaEntrega", e.target.value)}
                  required
                  className={fechaError ? "border-destructive" : ""}
                />
                {fechaError && <p className="text-sm text-destructive">{fechaError}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccionEnvio">Dirección de Envío *</Label>
                <Input
                  id="direccionEnvio"
                  placeholder="Dirección completa de entrega"
                  value={formData.direccionEnvio}
                  onChange={(e) => handleInputChange("direccionEnvio", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Instrucciones especiales..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Matriz de combinaciones */}
            {formData.productoId && renderCombinacionesTable()}

            <div className="flex justify-end">
              <Button onClick={continuarPaso2} disabled={!puedeAvanzar} className="min-w-[120px]">
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              Ingreso de Cantidades
            </CardTitle>
            <CardDescription>Ingrese las cantidades específicas para cada combinación seleccionada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumen del pedido */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Resumen del Pedido</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium">{clienteSeleccionado?.nombre}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Producto:</span>
                  <p className="font-medium">{productoSeleccionado?.nombre}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio unitario:</span>
                  <p className="font-medium">S/. {formatPrecio(productoSeleccionado?.precio)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha Entrega:</span>
                  <p className="font-medium">{formData.fechaEntrega}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Dirección:</span>
                  <p className="font-medium">{formData.direccionEnvio}</p>
                </div>
              </div>
            </div>

            {/* Matriz de cantidades */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Matriz de Cantidades</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarLlenadoRapido(!mostrarLlenadoRapido)}
                >
                  {mostrarLlenadoRapido ? "Ocultar" : "Llenado Rápido"}
                </Button>
              </div>

              {/* Panel de llenado rápido */}
              {mostrarLlenadoRapido && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="cantidadRapida" className="text-sm font-medium">
                          Cantidad:
                        </Label>
                        <Input
                          id="cantidadRapida"
                          type="number"
                          min="1"
                          value={cantidadRapida}
                          onChange={(e) => setCantidadRapida(e.target.value)}
                          className="w-20"
                          placeholder="0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const cantidad = Number.parseInt(cantidadRapida) || 0
                          if (cantidad > 0) llenarTodoConCantidad(cantidad.toString())
                        }}
                        disabled={!cantidadRapida || Number.parseInt(cantidadRapida) <= 0}
                      >
                        Llenar Todo
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Usa los botones "Llenar Fila" y "Llenar Col." en la tabla para llenar filas/columnas específicas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color / Talla</TableHead>
                      {combinacionesDisponibles?.tallas.map((talla) => (
                        <TableHead key={talla.id} className="text-center min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{talla.name}</span>
                            {mostrarLlenadoRapido && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const cantidad = Number.parseInt(cantidadRapida) || 0
                                  if (cantidad > 0) llenarColumnaCompleta(talla.id, cantidad.toString())
                                }}
                                disabled={!cantidadRapida || Number.parseInt(cantidadRapida) <= 0}
                                className="h-6 px-2 text-xs"
                              >
                                Llenar Col.
                              </Button>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinacionesDisponibles?.colores.map((color) => {
                      const totalFila = combinacionesDisponibles.tallas.reduce((sum, talla) => {
                        return sum + (matrizCantidades[color.id]?.[talla.id] || 0)
                      }, 0)

                      return (
                        <TableRow key={color.id}>
                          <TableCell>
                            <div className="flex items-center justify-between min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.hex }}
                                  title={`Color: ${color.name} (${color.hex})`}
                                />
                                <span className="font-medium">{color.name}</span>
                              </div>
                              {mostrarLlenadoRapido && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const cantidad = Number.parseInt(cantidadRapida) || 0
                                    if (cantidad > 0) llenarFilaCompleta(color.id, cantidad.toString())
                                  }}
                                  disabled={!cantidadRapida || Number.parseInt(cantidadRapida) <= 0}
                                  className="h-6 px-2 text-xs ml-2"
                                >
                                  Llenar Fila
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          {combinacionesDisponibles.tallas.map((talla) => {
                            const isSelected = isCombinacionSeleccionada(color.id, talla.id)
                            return (
                              <TableCell key={talla.id} className="text-center">
                                {isSelected ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    value={matrizCantidades[color.id]?.[talla.id]?.toString() || ""}
                                    onChange={(e) =>
                                      handleCantidadChange(color.id, talla.id, e.target.value)
                                    }
                                    className="w-20 text-center mx-auto"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-center font-medium">{totalFila > 0 ? totalFila : "-"}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      {combinacionesDisponibles?.tallas.map((talla) => {
                        const totalColumna = combinacionesDisponibles.colores.reduce((sum, color) => {
                          return sum + (matrizCantidades[color.id]?.[talla.id] || 0)
                        }, 0)
                        return (
                          <TableCell key={talla.id} className="text-center font-bold">
                            {totalColumna > 0 ? totalColumna : "-"}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center font-bold text-lg">{calcularTotalUnidades()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={volverPaso1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver atrás
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || calcularTotalUnidades() === 0}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  "Guardando..."
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Guardar Pedido
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
