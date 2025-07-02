"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { pedidosApi } from "@/services/api/pedidos"
import { productosApi } from "@/services/api/productos"
import { clientesApi } from "@/services/api/clientes"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import type { Cliente, Color, Talla } from "@/types/api"
import type { Product, ProductoTallaColor } from "@/types/product"
import type { Pedido, PedidoDetalle } from "@/types/order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
  params: {
    id: string
  }
}

interface FormData {
  clienteId: string
  productoId: string
  fechaPedido: string
  fechaEntrega: string
  direccionEnvio: string
  observaciones: string
  estadoPedido: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ANULADO'
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

export default function EditarPedidoPage({ params }: Props) {
  const router = useRouter()
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
    estadoPedido: "PENDIENTE",
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

  // Estados adicionales
  const [cantidadRapida, setCantidadRapida] = useState("")
  const [mostrarLlenadoRapido, setMostrarLlenadoRapido] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [pedidoData, detallesData, clientesData, productosData, coloresData, tallasData] = await Promise.all([
          pedidosApi.getById(parseInt(params.id)),
          pedidosApi.getDetalles(parseInt(params.id)),
          clientesApi.getAll(),
          productosApi.getAll(),
          coloresApi.getAll(),
          tallasApi.getAll()
        ])

        // Cargar datos del formulario
        setFormData({
          clienteId: pedidoData.cliente_id.toString(),
          productoId: pedidoData.producto_id.toString(),
          fechaPedido: pedidoData.fecha_pedido.split('T')[0],
          fechaEntrega: pedidoData.fecha_entrega.split('T')[0],
          direccionEnvio: pedidoData.direccion_envio,
          observaciones: pedidoData.observaciones || "",
          estadoPedido: pedidoData.estado_pedido as 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ANULADO'
        })

        // Cargar combinaciones del producto
        const combinaciones = await productosApi.getCombinaciones(pedidoData.producto_id)
        setCombinacionesProducto(combinaciones)

        // Marcar combinaciones seleccionadas y cantidades
        const newCombinacionesSeleccionadas = new Set<string>()
        const newMatrizCantidades: MatrizCantidades = {}

        detallesData.forEach((detalle) => {
          const combinacion = combinaciones.find(c => c.producto_tal_col_id === detalle.producto_tal_col_id)
          if (combinacion && combinacion.color_id && combinacion.talla_id) {
            const key = `${combinacion.color_id}-${combinacion.talla_id}`
            newCombinacionesSeleccionadas.add(key)

            if (!newMatrizCantidades[combinacion.color_id]) {
              newMatrizCantidades[combinacion.color_id] = {}
            }
            newMatrizCantidades[combinacion.color_id][combinacion.talla_id] = detalle.cantidad_solicitada
          }
        })

        setCombinacionesSeleccionadas(newCombinacionesSeleccionadas)
        setMatrizCantidades(newMatrizCantidades)

        // Guardar datos maestros
        setClientes(clientesData)
        setProductos(productosData)
        setColores(coloresData)
        setTallas(tallasData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar los datos del pedido")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  // Procesar combinaciones para la matriz
  const combinacionesDisponibles: CombinacionesDisponibles | null = formData.productoId ? {
    colores: Array.from(new Set(combinacionesProducto
      .map(c => c.color_id)
      .filter((id): id is number => id !== undefined)))
      .map(colorId => {
        const combinacion = combinacionesProducto.find(c => c.color_id === colorId)
        const color = combinacion?.cfg_colores
        return {
          id: colorId,
          name: color?.nombre_color || `Color ${colorId}`,
          hex: color?.codigo_color || "#000000"
        }
      }),
    tallas: Array.from(new Set(combinacionesProducto
      .map(c => c.talla_id)
      .filter((id): id is number => id !== undefined)))
      .map(tallaId => {
        const combinacion = combinacionesProducto.find(c => c.talla_id === tallaId)
        const talla = combinacion?.cfg_tallas
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

    if (field === "fechaPedido" || field === "fechaEntrega") {
      const nuevaFechaPedido = field === "fechaPedido" ? value : formData.fechaPedido
      const nuevaFechaEntrega = field === "fechaEntrega" ? value : formData.fechaEntrega

      if (nuevaFechaPedido && nuevaFechaEntrega) {
        const error = validateFechas(nuevaFechaPedido, nuevaFechaEntrega)
        setFechaError(error)
      }
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

  const handleCantidadChange = (colorId: number, tallaId: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0
    setMatrizCantidades((prev) => {
      const newMatriz = { ...prev }
      if (!newMatriz[colorId]) newMatriz[colorId] = {}
      newMatriz[colorId][tallaId] = cantidadNum
      return newMatriz
    })
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
      console.log('=== DATOS A ENVIAR AL BACKEND ===')
      
      // Asegurar que la fecha incluya la parte de tiempo
      const fechaEntregaISO = new Date(formData.fechaEntrega + 'T00:00:00.000Z').toISOString()

      // Preparar datos del pedido principal
      const datosPedidoPrincipal = {
        fecha_entrega: fechaEntregaISO,
        direccion_envio: formData.direccionEnvio,
        observaciones: formData.observaciones,
      }

      const datosEstado = {
        estado_pedido: formData.estadoPedido
      }

      console.log('1. Datos del pedido principal:', datosPedidoPrincipal)
      console.log('2. Actualización de estado:', datosEstado)

      // 1. Actualizar el pedido principal y su estado
      await Promise.all([
        pedidosApi.update(Number(params.id), datosPedidoPrincipal),
        pedidosApi.updateEstado(Number(params.id), formData.estadoPedido)
      ])

      // 2. Obtener los detalles actuales para comparar
      const detallesActuales = await pedidosApi.getDetalles(Number(params.id))
      console.log('3. Detalles actuales en BD:', detallesActuales)
      
      // Preparar los datos de los detalles
      const detallesNuevos = []
      const detallesActualizar = []
      const detallesEliminar = new Set(detallesActuales.map(d => d.producto_tal_col_id))
      
      // Procesar cada combinación seleccionada
      for (const [colorId, tallas] of Object.entries(matrizCantidades)) {
        for (const [tallaId, cantidad] of Object.entries(tallas)) {
          const cantidadNum = Number(cantidad) || 0
          const combinacion = combinacionesProducto.find(
            c => c.color_id === Number(colorId) && c.talla_id === Number(tallaId)
          )

          if (combinacion) {
            const detalleExistente = detallesActuales.find(
              d => d.producto_tal_col_id === combinacion.producto_tal_col_id
            )

            if (cantidadNum > 0) {
              const datosDetalle = {
                producto_tal_col_id: combinacion.producto_tal_col_id,
                cantidad_solicitada: cantidadNum,
              }

              if (!detalleExistente) {
                detallesNuevos.push(datosDetalle)
              } else if (detalleExistente.cantidad_solicitada !== cantidadNum) {
                detallesActualizar.push({
                  ...datosDetalle,
                  detalle_id: detalleExistente.ped_cliente_det_id
                })
              }
              detallesEliminar.delete(combinacion.producto_tal_col_id)
            }
          }
        }
      }

      console.log('4. Resumen de cambios en detalles:')
      console.log('   - Detalles nuevos a crear:', detallesNuevos)
      console.log('   - Detalles a actualizar:', detallesActualizar)
      console.log('   - Detalles a eliminar:', Array.from(detallesEliminar))

      // Ejecutar las operaciones de detalles
      const detallesPromises = [
        ...detallesNuevos.map(detalle => 
          pedidosApi.addDetalle(Number(params.id), detalle)
            .catch(error => {
              console.error('Error al agregar detalle:', detalle, error)
              throw error
            })
        ),
        ...detallesActualizar.map(detalle => 
          pedidosApi.updateDetalle(Number(params.id), detalle.detalle_id, {
            producto_tal_col_id: detalle.producto_tal_col_id,
            cantidad_solicitada: detalle.cantidad_solicitada,
          }).catch(error => {
            console.error('Error al actualizar detalle:', detalle, error)
            throw error
          })
        ),
        ...Array.from(detallesEliminar).map(productoTalColId => 
          pedidosApi.deleteDetalle(Number(params.id), productoTalColId)
            .catch(error => {
              console.error('Error al eliminar detalle:', productoTalColId, error)
              throw error
            })
        )
      ]

      await Promise.all(detallesPromises)
      
      console.log('=== Actualización completada con éxito ===')
      toast.success("Pedido actualizado correctamente")
      router.push("/pedidos")
    } catch (error) {
      console.error("Error detallado al actualizar pedido:", error)
      toast.error("Error al actualizar el pedido")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pedidos/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Pedido #{params.id.padStart(4, '0')}</h1>
          <p className="text-muted-foreground">
            Modifique los datos del pedido
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario básico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                value={clientes.find(c => c.cliente_id.toString() === formData.clienteId)?.nombre || ''}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producto">Producto</Label>
              <Input
                value={productos.find(p => p.producto_id.toString() === formData.productoId)?.nombre || ''}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaPedido">Fecha del Pedido</Label>
              <Input
                id="fechaPedido"
                type="date"
                value={formData.fechaPedido}
                disabled
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

            <div className="space-y-2">
              <Label htmlFor="estadoPedido">Estado del Pedido *</Label>
              <Select
                value={formData.estadoPedido}
                onValueChange={(value: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ANULADO') => 
                  handleInputChange("estadoPedido", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="ANULADO">Anulado</SelectItem>
                </SelectContent>
              </Select>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinacionesDisponibles?.colores.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <div className="flex items-center justify-between min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
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
                            {isSelected && (
                              <Input
                                type="number"
                                min="0"
                                value={matrizCantidades[color.id]?.[talla.id]?.toString() || ""}
                                onChange={(e) =>
                                  handleCantidadChange(color.id, talla.id, e.target.value)
                                }
                                className="w-20 text-center mx-auto"
                              />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
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
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || calcularTotalUnidades() === 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
