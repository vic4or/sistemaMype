"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, FileDown, Check, History, Eye, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { planificadorApi, type EjecutarPlanDto, type SugerenciaCompra, type MaterialSugerencia, type PlanificacionHistorial } from "@/services/api/planificador"
import { pedidosApi } from "@/services/api/pedidos"
import type { Pedido } from "@/types/order"
import { formatDate } from "@/lib/utils"

// Tipo extendido para la interfaz con propiedades de UI
interface SugerenciaCompraUI extends SugerenciaCompra {
  seleccionado: boolean
  expandido: boolean
}

// Tipo extendido para materiales con propiedades de UI
interface MaterialSugerenciaUI extends MaterialSugerencia {
  modificado?: boolean
}

export default function MRPPage() {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<"configuracion" | "sugerencias" | "historial">("configuracion")
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  })
  const [fechaFin, setFechaFin] = useState(() => {
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + 30) // 30 días desde hoy
    return fechaFin.toISOString().split('T')[0]
  })
  
  // Estados de datos
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<number[]>([])
  const [sugerenciasCompra, setSugerenciasCompra] = useState<SugerenciaCompraUI[]>([])
  const [historialPlanificaciones, setHistorialPlanificaciones] = useState<PlanificacionHistorial[]>([])
  
  // Estados de loading y errores
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [ejecutandoMRP, setEjecutandoMRP] = useState(false)
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [corridaActual, setCorridaActual] = useState<number | null>(null)

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos()
  }, [])

  // Cargar historial cuando se cambia a esa vista
  useEffect(() => {
    if (vistaActual === "historial") {
      cargarHistorial()
    }
  }, [vistaActual])

  const cargarPedidos = async () => {
    try {
      setCargandoPedidos(true)
      setError(null)
      const pedidosData = await pedidosApi.getAll()
      setPedidos(pedidosData)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      setError('Error al cargar los pedidos')
    } finally {
      setCargandoPedidos(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      setCargandoHistorial(true)
      const historial = await planificadorApi.obtenerHistorial()
      setHistorialPlanificaciones(historial)
    } catch (error) {
      console.error('Error al cargar historial:', error)
      // No mostrar error si no hay historial
    } finally {
      setCargandoHistorial(false)
    }
  }

  // Filtrar pedidos por periodo
  const pedidosEnPeriodo = useMemo(() => {
    return pedidos.filter((pedido) => {
      const fechaEntrega = new Date(pedido.fecha_entrega)
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      return fechaEntrega >= inicio && fechaEntrega <= fin
    })
  }, [pedidos, fechaInicio, fechaFin])

  // Inicializar pedidos seleccionados cuando cambie el filtro
  useEffect(() => {
    setPedidosSeleccionados(pedidosEnPeriodo.map((p) => p.pedido_cliente_id))
  }, [pedidosEnPeriodo])

  const handlePedidoSeleccionado = (pedidoId: number) => {
    setPedidosSeleccionados((prev) =>
      prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId],
    )
  }

  const ejecutarMRP = async () => {
    if (pedidosSeleccionados.length === 0) {
      setError("Debe seleccionar al menos un pedido para ejecutar el MRP")
      return
    }

    setEjecutandoMRP(true)
    setError(null)

    try {
      // Ejecutar planificación usando la nueva API
      const dto: EjecutarPlanDto = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }
      
      const result = await planificadorApi.ejecutarPlanificacion(dto)
      setCorridaActual(result.corrida_id)
      
      // Obtener sugerencias de la corrida
      const sugerencias = await planificadorApi.obtenerSugerencias(result.corrida_id)
      
      // Convertir las sugerencias de la API al formato de la UI
      const sugerenciasUI: SugerenciaCompraUI[] = sugerencias.map(sugerencia => ({
        ...sugerencia,
        materiales: sugerencia.materiales.map(material => ({
          ...material,
          modificado: false
        })) as MaterialSugerenciaUI[],
        seleccionado: true,
        expandido: false
      }))
      
      setSugerenciasCompra(sugerenciasUI)
      setVistaActual("sugerencias")
      
    } catch (error) {
      console.error('Error al ejecutar MRP:', error)
      setError('Error al ejecutar la planificación MRP. Por favor intente nuevamente.')
    } finally {
      setEjecutandoMRP(false)
    }
  }

  const toggleProveedorSeleccionado = (index: number) => {
    setSugerenciasCompra((prev) =>
      prev.map((sugerencia, i) =>
        i === index ? { ...sugerencia, seleccionado: !sugerencia.seleccionado } : sugerencia,
      ),
    )
  }

  const toggleProveedorExpandido = (index: number) => {
    setSugerenciasCompra((prev) =>
      prev.map((sugerencia, i) => (i === index ? { ...sugerencia, expandido: !sugerencia.expandido } : sugerencia)),
    )
  }

  const modificarMaterial = (proveedorIndex: number, materialId: number, campo: string, valor: any) => {
    setSugerenciasCompra((prev) =>
      prev.map((sugerencia, i) => {
        if (i === proveedorIndex) {
          const materialesActualizados = sugerencia.materiales.map((material) => {
            if (material.id === materialId) {
              const materialActualizado = { ...material, [campo]: valor, modificado: true } as MaterialSugerenciaUI
              if (campo === "cantidad" || campo === "precio_unitario") {
                materialActualizado.subtotal = materialActualizado.cantidad * materialActualizado.precio_unitario
              }
              return materialActualizado
            }
            return material
          }) as MaterialSugerenciaUI[]

          const nuevoTotal = materialesActualizados.reduce((sum, mat) => sum + mat.subtotal, 0)

          return {
            ...sugerencia,
            materiales: materialesActualizados,
            total: nuevoTotal,
          }
        }
        return sugerencia
      }),
    )
  }

  const generarOrdenesCompra = async () => {
    const proveedoresSeleccionados = sugerenciasCompra.filter((s) => s.seleccionado)
    if (proveedoresSeleccionados.length === 0) {
      setError("Debe seleccionar al menos un proveedor para generar órdenes de compra")
      return
    }

    if (!corridaActual) {
      setError("No hay una corrida de MRP activa")
      return
    }

    try {
      const dto = {
        sugerencias_aprobadas: proveedoresSeleccionados.map(s => s.id)
      }
      
      const result = await planificadorApi.aprobarSugerencias(corridaActual, dto)
      
      alert(`Se generaron ${result.ordenes_generadas} órdenes de compra exitosamente`)
      
      // Recargar historial y volver a configuración
      await cargarHistorial()
      setVistaActual("historial")
      
    } catch (error) {
      console.error('Error al generar órdenes:', error)
      setError('Error al generar las órdenes de compra')
    }
  }

  const getNombreCliente = (pedido: Pedido) => {
    return pedido.cli_clientes?.nombre || 'Cliente sin nombre'
  }

  const getCodigoPedido = (pedido: Pedido) => {
    return `PED-${pedido.pedido_cliente_id.toString().padStart(4, '0')}`
  }

  // Nota: formatDate ya viene de lib/utils, no necesitamos función local

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `S/ ${(numericAmount || 0).toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Planificador MRP</h1>
        <div className="flex gap-2">
          <Button
            variant={vistaActual === "historial" ? "default" : "outline"}
            onClick={() => setVistaActual("historial")}
          >
            <History className="mr-2 h-4 w-4" />
            Historial
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {vistaActual === "configuracion" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Planificación MRP</CardTitle>
            <CardDescription>
              Seleccione el periodo y los pedidos para generar el plan de requerimientos de materiales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuración de Periodo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Inicio</label>
                <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Fin</label>
                <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              </div>
            </div>

            {/* Pedidos en el Periodo */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Pedidos en el Periodo 
                  {cargandoPedidos ? " (Cargando...)" : ` (${pedidosEnPeriodo.length} encontrados)`}
                </h3>
                <Badge variant="secondary">{pedidosSeleccionados.length} seleccionados</Badge>
              </div>

              {cargandoPedidos ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Cargando pedidos...
                  </CardContent>
                </Card>
              ) : pedidosEnPeriodo.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay pedidos en el periodo seleccionado
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha Entrega</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosEnPeriodo.map((pedido) => (
                        <TableRow key={pedido.pedido_cliente_id}>
                          <TableCell>
                            <Checkbox
                              checked={pedidosSeleccionados.includes(pedido.pedido_cliente_id)}
                              onCheckedChange={() => handlePedidoSeleccionado(pedido.pedido_cliente_id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{getCodigoPedido(pedido)}</TableCell>
                          <TableCell>{getNombreCliente(pedido)}</TableCell>
                          <TableCell>{formatDate(pedido.fecha_entrega)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {pedido.estado_pedido}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(pedido.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Botón Ejecutar */}
            <div className="flex justify-end">
              <Button 
                onClick={ejecutarMRP} 
                disabled={ejecutandoMRP || pedidosSeleccionados.length === 0 || cargandoPedidos} 
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                {ejecutandoMRP ? "Ejecutando MRP..." : "Ejecutar MRP"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {vistaActual === "sugerencias" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Sugerencias de Compra</h2>
              <p className="text-muted-foreground">
                Revise y modifique las sugerencias antes de generar las órdenes de compra
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setVistaActual("configuracion")}>
                Volver a Configuración
              </Button>
              <Button onClick={generarOrdenesCompra} disabled={sugerenciasCompra.length === 0}>
                <Check className="mr-2 h-4 w-4" />
                Generar Órdenes de Compra
              </Button>
            </div>
          </div>

          {sugerenciasCompra.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay sugerencias de compra disponibles
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Resumen */}
              <Card>
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{sugerenciasCompra.length}</div>
                      <div className="text-sm text-muted-foreground">Proveedores</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {sugerenciasCompra.reduce((sum, s) => sum + s.materiales.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Materiales</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {sugerenciasCompra.filter((s) => s.seleccionado).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Seleccionados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(
                          sugerenciasCompra.filter((s) => s.seleccionado).reduce((sum, s) => sum + s.total, 0),
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sugerencias por Proveedor */}
              <div className="space-y-4">
                {sugerenciasCompra.map((sugerencia, index) => (
                  <Card key={sugerencia.id} className={`${sugerencia.seleccionado ? "ring-2 ring-blue-500" : ""}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={sugerencia.seleccionado}
                            onCheckedChange={() => toggleProveedorSeleccionado(index)}
                          />
                          <div>
                            <CardTitle className="text-lg">{sugerencia.proveedor_nombre}</CardTitle>
                            <CardDescription>{sugerencia.contacto}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatCurrency(sugerencia.total)}</div>
                            <div className="text-sm text-muted-foreground">{sugerencia.materiales.length} materiales</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toggleProveedorExpandido(index)}>
                            {sugerencia.expandido ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {sugerencia.expandido && (
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-center">Precio Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                              <TableHead className="text-center">Fecha Necesaria</TableHead>
                              <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sugerencia.materiales.map((material) => (
                              <TableRow key={material.id}>
                                <TableCell className="font-medium">{material.material_nombre}</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    value={material.cantidad}
                                    onChange={(e) =>
                                      modificarMaterial(
                                        index,
                                        material.id,
                                        "cantidad",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-20 text-center"
                                    step="0.01"
                                  />
                                  <span className="text-xs text-muted-foreground ml-1">{material.unidad}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    value={material.precio_unitario}
                                    onChange={(e) =>
                                      modificarMaterial(
                                        index,
                                        material.id,
                                        "precio_unitario",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-20 text-center"
                                    step="0.01"
                                  />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(material.subtotal)}
                                </TableCell>
                                <TableCell className="text-center text-sm">{formatDate(material.fecha_necesaria)}</TableCell>
                                <TableCell className="text-center">
                                  {(material as MaterialSugerenciaUI).modificado && (
                                    <Badge variant="outline" className="text-orange-600">
                                      Modificado
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {vistaActual === "historial" && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Planificaciones MRP</CardTitle>
            <CardDescription>Revise las corridas anteriores del planificador MRP</CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoHistorial ? (
              <div className="py-8 text-center text-muted-foreground">
                Cargando historial...
              </div>
            ) : historialPlanificaciones.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No hay planificaciones en el historial
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Corrida</TableHead>
                    <TableHead>Fecha Ejecución</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-center">Sugerencias</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historialPlanificaciones.map((planificacion) => (
                    <TableRow key={planificacion.corrida_id}>
                      <TableCell className="font-medium">MRP-{planificacion.corrida_id}</TableCell>
                      <TableCell>{formatDate(planificacion.fecha_ejecucion)}</TableCell>
                      <TableCell>{planificacion.usuario}</TableCell>
                      <TableCell className="text-center">{planificacion.pedidos_incluidos}</TableCell>
                      <TableCell className="text-center">{planificacion.sugerencias_generadas}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-green-600">
                          {planificacion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" disabled>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
