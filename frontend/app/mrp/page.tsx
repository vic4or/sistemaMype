"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Check, History, Eye, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { planificadorApi, type EjecutarPlanDto, type SugerenciaCompra, type MaterialSugerencia, type PlanificacionHistorial } from "@/services/api/planificador"
import { pedidosApi } from "@/services/api/pedidos"
import { clientesApi } from "@/services/api/clientes"
import type { Pedido } from "@/types/order"
import type { Cliente } from "@/types/api"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  
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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [sugerenciasCompra, setSugerenciasCompra] = useState<SugerenciaCompraUI[]>([])
  const [historialPlanificaciones, setHistorialPlanificaciones] = useState<PlanificacionHistorial[]>([])
  
  // Estados de loading y errores
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [ejecutandoMRP, setEjecutandoMRP] = useState(false)
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [corridaActual, setCorridaActual] = useState<number | null>(null)

  // Cargar pedidos y clientes al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Cargar historial cuando se cambia a esa vista
  useEffect(() => {
    if (vistaActual === "historial") {
      cargarHistorial()
    }
  }, [vistaActual])

  const cargarDatos = async () => {
    try {
      setCargandoPedidos(true)
      setError(null)
      const [pedidosData, clientesData] = await Promise.all([
        pedidosApi.getAll(),
        clientesApi.getAll()
      ])
      setPedidos(pedidosData)
      setClientes(clientesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los datos')
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

  const ejecutarMRP = async () => {
    if (pedidosEnPeriodo.length === 0) {
      setError("No hay pedidos en el rango de fechas seleccionado para ejecutar el MRP")
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
      
      console.log(`Ejecutando MRP para ${pedidosEnPeriodo.length} pedidos...`)
      const result = await planificadorApi.ejecutarPlanificacion(dto)
      console.log(`MRP ejecutado exitosamente. Corrida ID: ${result.corrida_id}`)
      setCorridaActual(result.corrida_id)
      
      // Obtener sugerencias de la corrida
      console.log('Obteniendo sugerencias de compra...')
      const sugerencias = await planificadorApi.obtenerSugerencias(result.corrida_id)
      console.log(`Se obtuvieron ${sugerencias.length} sugerencias agrupadas por proveedor`)
      
      console.log('=== DEBUG: Datos recibidos del backend ===')
      sugerencias.forEach((sugerencia, index) => {
        console.log(`Proveedor ${index}: ${sugerencia.proveedor_nombre}`)
        sugerencia.materiales.forEach((material, matIndex) => {
          console.log(`  Material ${matIndex}:`, {
            id: material.id,
            nombre: material.material_nombre,
            estado: material.estado,
            seleccionado_inicial: material.seleccionado
          })
        })
      })
      
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

  const toggleMaterialSeleccionado = (proveedorIndex: number, materialId: number) => {
    console.log('=== DEBUG: Toggle material ===')
    console.log('Proveedor index:', proveedorIndex)
    console.log('Material ID:', materialId)
    
    setSugerenciasCompra((prev) =>
      prev.map((sugerencia, i) => {
        if (i === proveedorIndex) {
          const materialesActualizados = sugerencia.materiales.map((material) => {
            if (material.id === materialId && material.estado === 'PENDIENTE') {
              console.log(`Cambiando selección de material ${material.material_nombre}:`, {
                estado_actual: material.seleccionado,
                nuevo_estado: !material.seleccionado,
                estado_material: material.estado
              })
              return { ...material, seleccionado: !material.seleccionado } as MaterialSugerenciaUI
            }
            return material
          }) as MaterialSugerenciaUI[]

          return {
            ...sugerencia,
            materiales: materialesActualizados,
          }
        }
        return sugerencia
      }),
    )
  }

  const cargarSugerenciasDeHistorial = async (corridaId: number) => {
    try {
      setCorridaActual(corridaId)
      const sugerencias = await planificadorApi.obtenerSugerencias(corridaId)
      
      const sugerenciasUI: SugerenciaCompraUI[] = sugerencias.map(sugerencia => ({
        ...sugerencia,
        materiales: sugerencia.materiales.map(material => ({
          ...material,
          modificado: false
        })) as MaterialSugerenciaUI[],
        seleccionado: true,
        expandido: true // Expandir por defecto al venir del historial
      }))
      
      setSugerenciasCompra(sugerenciasUI)
      setVistaActual("sugerencias")
    } catch (error) {
      console.error('Error al cargar sugerencias del historial:', error)
      setError('Error al cargar las sugerencias de la corrida seleccionada')
    }
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
    // Obtener todas las sugerencias individuales seleccionadas
    const sugerenciasSeleccionadas: number[] = []
    
    console.log('=== DEBUG: Análisis de sugerencias ===')
    sugerenciasCompra.forEach((proveedor, proveedorIndex) => {
      console.log(`Proveedor ${proveedorIndex}: ${proveedor.proveedor_nombre}`)
      proveedor.materiales.forEach((material, materialIndex) => {
        console.log(`  Material ${materialIndex}:`, {
          id: material.id,
          nombre: material.material_nombre,
          estado: material.estado,
          seleccionado: material.seleccionado,
          seIncluira: material.seleccionado && material.estado === 'PENDIENTE'
        })
        
        if (material.seleccionado && material.estado === 'PENDIENTE') {
          sugerenciasSeleccionadas.push(material.id)
        }
      })
    })

    console.log('=== IDs que se enviarán al backend ===')
    console.log('Total de IDs seleccionados:', sugerenciasSeleccionadas.length)
    console.log('IDs:', sugerenciasSeleccionadas)

    if (sugerenciasSeleccionadas.length === 0) {
      setError("Debe seleccionar al menos una sugerencia pendiente para generar órdenes de compra")
      return
    }

    if (!corridaActual) {
      setError("No hay una corrida de MRP activa")
      return
    }

    try {
      const dto = {
        sugerencia_ids: sugerenciasSeleccionadas
      }
      
      console.log('=== DTO que se envía al backend ===')
      console.log('Corrida ID:', corridaActual)
      console.log('DTO completo:', dto)
      
      const result = await planificadorApi.aprobarSugerencias(corridaActual, dto)
      
      console.log('=== Respuesta del backend ===')
      console.log('Resultado completo:', result)
      
      // Mostrar toast de éxito
      toast({
        title: "¡Éxito!",
        description: result?.message || 'Sugerencias procesadas exitosamente'
      })
      
      // Recargar historial y volver a configuración
      await cargarHistorial()
      setVistaActual("configuracion")
      
    } catch (error) {
      console.error('Error al generar órdenes:', error)
      setError('Error al generar las órdenes de compra')
    }
  }

  const getNombreCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.cliente_id === clienteId)
    return cliente?.nombre || "Cliente no encontrado"
  }

  const getCodigoPedido = (pedido: Pedido) => {
    return `PED-${pedido.pedido_cliente_id.toString().padStart(4, '0')}`
  }

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "EN_PROCESO": { variant: "default", label: "En Proceso", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      "COMPLETADO": { variant: "outline", label: "Completado", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      "ANULADO": { variant: "destructive", label: "Anulado", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  const getEstadoSugerenciaBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "OC_GENERADA": { variant: "outline", label: "OC Generada", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      "CANCELADA": { variant: "destructive", label: "Cancelada", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
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
          {vistaActual !== "configuracion" && (
            <Button
              variant="outline"
              onClick={() => setVistaActual("configuracion")}
            >
              Volver a Configuración
            </Button>
          )}
          <Button
            variant={vistaActual === "historial" ? "default" : "outline"}
            onClick={() => setVistaActual("historial")}
          >
            <History className="mr-2 h-4 w-4" />
            Historial
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
              Seleccione el periodo de fechas para generar el plan de requerimientos de materiales. Todos los pedidos en el rango serán procesados.
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
                {pedidosEnPeriodo.length > 0 && (
                  <Badge variant="secondary">Todos serán procesados</Badge>
                )}
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
                          <TableCell className="font-medium">{getCodigoPedido(pedido)}</TableCell>
                          <TableCell>{getNombreCliente(pedido.cliente_id)}</TableCell>
                          <TableCell>{formatDate(pedido.fecha_entrega)}</TableCell>
                          <TableCell>
                            {getEstadoBadge(pedido.estado_pedido)}
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
                disabled={ejecutandoMRP || pedidosEnPeriodo.length === 0 || cargandoPedidos} 
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
                  {corridaActual ? `Corrida MRP-${corridaActual}: ` : ''}
                  Seleccione las sugerencias pendientes para generar órdenes de compra
                </p>
              </div>
            <div className="flex gap-2">
              <Button 
                onClick={generarOrdenesCompra} 
                disabled={sugerenciasCompra.reduce((sum, s) => sum + s.materiales.filter(m => m.seleccionado && m.estado === 'PENDIENTE').length, 0) === 0}
              >
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
                        {sugerenciasCompra.reduce((sum, s) => sum + s.materiales.filter(m => m.seleccionado).length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Seleccionados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(
                          sugerenciasCompra.reduce((sum, s) => 
                            sum + s.materiales.filter(m => m.seleccionado).reduce((matSum, m) => matSum + m.subtotal, 0), 0)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Seleccionado</div>
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
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Material</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-center">Precio Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                              <TableHead className="text-center">Fecha Sugerida Ordenar</TableHead>
                              <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sugerencia.materiales.map((material) => (
                              <TableRow key={material.id} className="h-14">
                                <TableCell className="align-middle">
                                  <Checkbox
                                    checked={material.seleccionado}
                                    disabled={material.estado !== 'PENDIENTE'}
                                    onCheckedChange={() => toggleMaterialSeleccionado(index, material.id)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium align-middle">{material.material_nombre}</TableCell>
                                <TableCell className="text-center align-middle">
                                  <div className="flex items-center justify-center">
                                    <div className="flex items-center bg-gray-50 rounded-md border px-3 py-2 min-w-[100px]">
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
                                        className="w-14 text-center border-0 bg-transparent focus:ring-0 focus:border-0 p-0 text-sm"
                                        step="0.01"
                                      />
                                      <div className="w-10 text-center ml-1">
                                        <span className="text-xs text-muted-foreground font-medium">{material.unidad}</span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center align-middle">
                                  <div className="flex items-center justify-center">
                                    <div className="flex items-center bg-gray-50 rounded-md border px-3 py-2 min-w-[90px]">
                                      <span className="text-xs text-muted-foreground mr-1">S/.</span>
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
                                        className="w-16 text-center border-0 bg-transparent focus:ring-0 focus:border-0 p-0 text-sm"
                                        step="0.01"
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium align-middle">
                                  {formatCurrency(material.subtotal)}
                                </TableCell>
                                <TableCell className="text-center text-sm align-middle">{formatDate(material.fecha_necesaria)}</TableCell>
                                <TableCell className="text-center align-middle">
                                  <div className="flex flex-col items-center space-y-1">
                                    {getEstadoSugerenciaBadge(material.estado)}
                                    {(material as MaterialSugerenciaUI).modificado && (
                                      <Badge variant="outline" className="text-orange-600 text-xs">
                                        Modificado
                                      </Badge>
                                    )}
                                  </div>
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
                      <TableCell className="text-center">{planificacion.pedidos_incluidos}</TableCell>
                      <TableCell className="text-center">{planificacion.sugerencias_generadas}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={planificacion.estado === 'Completado' ? "outline" : "secondary"} 
                          className={planificacion.estado === 'Completado' ? "text-green-600" : "text-yellow-600"}
                        >
                          {planificacion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => cargarSugerenciasDeHistorial(planificacion.corrida_id)}
                            title="Ver sugerencias"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {planificacion.sugerencias_pendientes > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {planificacion.sugerencias_pendientes} pendientes
                            </Badge>
                          )}
                        </div>
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
