"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Combobox } from "@/components/ui/combobox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { movimientosApi, type RegistrarMovimientoManualDto, type RegistrarEntradaOCDto, type MovimientoOCItemDto } from "@/services/api/movimientos"
import { materialesApi } from "@/services/api/materiales"
import { ordenesCompraApi } from "@/services/api/ordenes-compra"
import type { Material } from "@/types/api"
import type { OrdenCompra } from "@/types/ordenes-compra"

interface ItemRecepcion {
  oc_detalle_id: number
  material_id: number
  codigo: string
  descripcion: string
  cantidad_pedida: number
  cantidad_recibida: number
  unidad: string
  recibiendo_ahora: number
  seleccionado: boolean
  tiene_discrepancia: boolean
  tipo_discrepancia: "menor" | "mayor" | "none"
  notas_discrepancia: string
  numero_oc: string
}

interface Props {
  onSuccess?: () => void
}

export default function NuevoMovimientoForm({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [movimientoTipo, setMovimientoTipo] = useState<"basadoEnOC" | "manual">("basadoEnOC")
  const [selectedOrdenCompra, setSelectedOrdenCompra] = useState("")
  const [itemsRecepcion, setItemsRecepcion] = useState<ItemRecepcion[]>([])
  const [observacionesGenerales, setObservacionesGenerales] = useState("")

  // Estados para datos de la API
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([])
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(false)
  const [loadingMateriales, setLoadingMateriales] = useState(false)

  // Estados para movimiento manual
  const [formDataManual, setFormDataManual] = useState({
    fecha: new Date().toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
    tipo: "Entrada",
    materialId: "",
    cantidad: "",
    referencia: "",
    observaciones: "",
  })

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  // Estados para manejar la carga y errores
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Cargar órdenes de compra y materiales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (movimientoTipo === "basadoEnOC") {
        cargarOrdenesCompra()
      } else {
        cargarMateriales()
      }
    }
  }, [open, movimientoTipo])

  const cargarOrdenesCompra = async () => {
    try {
      setLoadingOrdenes(true)
      const ordenes = await ordenesCompraApi.getAll()
      
      console.log('📦 Órdenes obtenidas:', ordenes.length)
      console.log('📦 Estados de órdenes:', ordenes.map(o => ({ numero: o.numero_oc, estado: o.estado_oc })))
      
      // Filtrar órdenes PENDIENTES que tengan items por recibir
      const ordenesPendientes = ordenes.filter(orden => {
        const esPendiente = orden.estado_oc === 'PENDIENTE'
        const tienePendientes = orden.cmp_ordenes_compra_det.some(item => 
          Number(item.cantidad_recibida) < Number(item.cantidad_pedida)
        )
        
        // Debug detallado para OC-7
        if (orden.numero_oc === 'OC-7') {
          console.log(`🔍 Debug OC-7:`, {
            items: orden.cmp_ordenes_compra_det.map(item => ({
              material: item.mat_materiales?.codigo_material,
              pedida: item.cantidad_pedida,
              recibida: item.cantidad_recibida,
              pendiente: Number(item.cantidad_pedida) - Number(item.cantidad_recibida)
            }))
          })
        }
        
        console.log(`📦 ${orden.numero_oc}: Estado=${orden.estado_oc}, Pendiente=${esPendiente}, TienePendientes=${tienePendientes}`)
        
        return esPendiente && tienePendientes
      })
      
      console.log('📦 Órdenes pendientes filtradas:', ordenesPendientes.length)
      setOrdenesCompra(ordenesPendientes)
    } catch (error: any) {
      console.error('Error al cargar órdenes de compra:', error)
      toast({
        title: "Error",
        description: "Error al cargar las órdenes de compra",
        variant: "destructive",
      })
    } finally {
      setLoadingOrdenes(false)
    }
  }

  const cargarMateriales = async () => {
    try {
      setLoadingMateriales(true)
      const materialesData = await materialesApi.getAll()
      setMateriales(materialesData.filter(m => m.estado))
    } catch (error: any) {
      console.error('Error al cargar materiales:', error)
      toast({
        title: "Error",
        description: "Error al cargar los materiales",
        variant: "destructive",
      })
    } finally {
      setLoadingMateriales(false)
    }
  }

  // Función para cargar los items de la orden de compra seleccionada
  const cargarItemsOrdenCompra = (ordenId: string) => {
    const orden = ordenesCompra.find((oc) => oc.numero_oc === ordenId)
    if (orden) {
      const items = orden.cmp_ordenes_compra_det
        .filter(item => Number(item.cantidad_recibida) < Number(item.cantidad_pedida))
        .map((item) => ({
          oc_detalle_id: item.oc_detalle_id,
          material_id: item.material_id,
          codigo: item.mat_materiales.codigo_material,
          descripcion: item.mat_materiales.descripcion_material,
          cantidad_pedida: Number(item.cantidad_pedida),
          cantidad_recibida: Number(item.cantidad_recibida),
          unidad: item.mat_materiales.cfg_unidades_medida?.abreviatura || "und",
          recibiendo_ahora: Number(item.cantidad_pedida) - Number(item.cantidad_recibida),
          seleccionado: true,
          tiene_discrepancia: false,
          tipo_discrepancia: "none" as const,
          notas_discrepancia: "",
          numero_oc: orden.numero_oc
      }))
      setItemsRecepcion(items)
    } else {
      setItemsRecepcion([])
    }
  }

  // Manejar cambio de orden de compra
  const handleOrdenCompraChange = (value: string) => {
    setSelectedOrdenCompra(value)
    cargarItemsOrdenCompra(value)
  }

  // Manejar cambio de material
  const handleMaterialChange = (value: string) => {
    setFormDataManual((prev) => ({ ...prev, materialId: value }))
    const material = materiales.find((m) => m.material_id.toString() === value)
    setSelectedMaterial(material || null)
  }

  // Preparar opciones para el combobox de órdenes de compra
  const ordenesOptions = ordenesCompra.map(orden => {
    const itemsPendientes = orden.cmp_ordenes_compra_det.filter(item => 
      Number(item.cantidad_recibida) < Number(item.cantidad_pedida)
    ).length

                  const fechaEntrega = orden.fecha_esperada.split('T')[0]
    
    return {
      value: orden.numero_oc,
      label: orden.numero_oc,
      description: orden.pro_proveedores.razon_social,
      metadata: `${itemsPendientes} ítems pendientes • Entrega: ${fechaEntrega}`,
    }
  })

  // Preparar opciones para el combobox de materiales
  const materialesOptions = materiales.map(material => {
    const categoria = material.cfg_categorias_material?.nombre_categoria || 'Sin categoría'
    const stock = material.stock_actual ? Number(material.stock_actual).toFixed(2) : '0.00'
    const unidad = material.cfg_unidades_medida?.abreviatura || 'und'
    
    return {
      value: material.material_id.toString(),
      label: material.codigo_material,
      description: material.descripcion_material,
      metadata: `Stock: ${stock} ${unidad} • ${categoria}`,
    }
  })

  // Manejar cambio en cantidad a recibir
  const handleCantidadChange = (oc_detalle_id: number, value: string) => {
    const cantidad = Number.parseFloat(value) || 0
    setItemsRecepcion((items) =>
      items.map((item) => {
        if (item.oc_detalle_id === oc_detalle_id) {
          const pendiente = item.cantidad_pedida - item.cantidad_recibida
          const tiene_discrepancia = cantidad !== pendiente
          const tipo_discrepancia = cantidad < pendiente ? "menor" : cantidad > pendiente ? "mayor" : "none"

          return {
            ...item,
            recibiendo_ahora: cantidad,
            tiene_discrepancia,
            tipo_discrepancia,
          }
        }
        return item
      }),
    )
  }

  // Manejar cambio en checkbox
  const handleCheckChange = (oc_detalle_id: number, checked: boolean) => {
    setItemsRecepcion((items) => 
      items.map((item) => 
        item.oc_detalle_id === oc_detalle_id ? { ...item, seleccionado: checked } : item
      )
    )
  }

  // Manejar cambio en tipo de discrepancia
  const handleDiscrepancyTypeChange = (oc_detalle_id: number, type: "menor" | "mayor" | "none") => {
    setItemsRecepcion((items) =>
      items.map((item) => {
        if (item.oc_detalle_id === oc_detalle_id) {
          const pendiente = item.cantidad_pedida - item.cantidad_recibida
          const recibiendo_ahora = type === "none" ? pendiente : item.recibiendo_ahora

          return {
            ...item,
            tipo_discrepancia: type,
            tiene_discrepancia: type !== "none",
            recibiendo_ahora,
          }
        }
        return item
      }),
    )
  }

  // Manejar cambio en notas de discrepancia
  const handleDiscrepancyNotesChange = (oc_detalle_id: number, notes: string) => {
    setItemsRecepcion((items) => 
      items.map((item) => 
        item.oc_detalle_id === oc_detalle_id ? { ...item, notas_discrepancia: notes } : item
      )
    )
  }

  // Manejar cambios en formulario manual
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormDataManual((prev) => ({ ...prev, [name]: value }))
  }

  // Función para obtener la unidad según el tipo de movimiento
  const getUnidadSegunTipo = () => {
    if (!selectedMaterial) return 'und'
    
    const tipo = formDataManual.tipo
    if (tipo === 'Entrada') {
      // Para entradas: usar unidad de presentación de compra
      return selectedMaterial.cfg_presentaciones?.abreviatura_compra || 
             selectedMaterial.cfg_unidades_medida?.abreviatura || 'und'
    } else {
      // Para salidas y ajustes: usar unidad de consumo
      return selectedMaterial.cfg_presentaciones?.abreviatura_consumo || 
             selectedMaterial.cfg_unidades_medida?.abreviatura || 'und'
    }
  }

  // Función para obtener el tipo de unidad para mostrar
  const getTipoUnidad = () => {
    const tipo = formDataManual.tipo
    if (tipo === 'Entrada') {
      return 'compra'
    } else {
      return 'consumo'
    }
  }

  const handleManualSelectChange = (field: string, value: string) => {
    setFormDataManual((prev) => ({ ...prev, [field]: value }))
  }

  // Get current items for pagination
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return itemsRecepcion.slice(indexOfFirstItem, indexOfLastItem)
  }

  // Get total pages
  const totalPages = Math.ceil(itemsRecepcion.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Función principal para enviar datos al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (movimientoTipo === "basadoEnOC") {
        if (!selectedOrdenCompra) {
          throw new Error("Debe seleccionar una orden de compra")
        }

        const itemsSeleccionados = itemsRecepcion.filter((item) => item.seleccionado && item.recibiendo_ahora > 0)
        if (itemsSeleccionados.length === 0) {
          throw new Error("Debe seleccionar al menos un ítem para recibir")
        }

        // Verificar si hay discrepancias sin notas
        const discrepanciasSinNotas = itemsSeleccionados.some(
          (item) => item.tiene_discrepancia && !item.notas_discrepancia.trim(),
        )
        if (discrepanciasSinNotas) {
          throw new Error("Debe proporcionar notas para todas las discrepancias")
        }

        // Preparar datos para enviar al backend
        const entradaData: RegistrarEntradaOCDto = {
          fecha_movimiento: new Date().toISOString().split('T')[0], // Solo fecha sin hora
          usuario: "Usuario", // TODO: Obtener del contexto de autenticación
          items: itemsSeleccionados.map((item): MovimientoOCItemDto => ({
            oc_detalle_id: item.oc_detalle_id,
            cantidad_recibida: item.recibiendo_ahora,
            estado_discrepancia: item.tiene_discrepancia ? "DISCREPANCIA" : "OK",
            nota_discrepancia: item.notas_discrepancia || undefined,
          })),
        }

        console.log("🚀 ENVIANDO ENTRADA POR OC AL BACKEND:")
        console.log("📄 Datos completos:", JSON.stringify(entradaData, null, 2))
        console.log("📦 OC seleccionada:", selectedOrdenCompra)
        console.log("📋 Items a procesar:", entradaData.items.length)
        
        await movimientosApi.registrarDesdeOC(entradaData)

        toast({
          title: "Éxito",
          description: "Entrada por orden de compra registrada correctamente",
        })

        // Resetear el formulario
        setSelectedOrdenCompra("")
        setItemsRecepcion([])
        setObservacionesGenerales("")
        setOpen(false)
        
        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Lógica para movimiento manual
        if (!formDataManual.materialId || !formDataManual.cantidad) {
          throw new Error("Debe seleccionar un material y especificar la cantidad")
        }

        // Preparar datos para enviar al backend
        const movimientoData: RegistrarMovimientoManualDto = {
          fecha_movimiento: formDataManual.fecha, // Ya está en formato YYYY-MM-DD
          tipo_movimiento: formDataManual.tipo as 'Entrada' | 'Salida' | 'Ajuste',
          material_id: Number.parseInt(formDataManual.materialId),
          cantidad: Number.parseFloat(formDataManual.cantidad),
          usuario: "Usuario", // TODO: Obtener del contexto de autenticación
          referencia: formDataManual.referencia || undefined,
          observaciones: formDataManual.observaciones || undefined,
        }

        console.log("Enviando movimiento manual:", movimientoData)
        await movimientosApi.registrarManual(movimientoData)

        toast({
          title: "Éxito",
          description: "Movimiento manual registrado correctamente",
        })

        // Resetear el formulario
        setFormDataManual({
          fecha: new Date().toISOString().split("T")[0],
          tipo: "Entrada",
          materialId: "",
          cantidad: "",
          referencia: "",
          observaciones: "",
        })
        setSelectedMaterial(null)
        setOpen(false)

        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error("Error al registrar movimiento:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
            <DialogDescription>
              Complete la información del movimiento de entrada, salida o ajuste de inventario.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Selector de tipo de movimiento */}
            <div className="flex space-x-4 mb-2">
              <Button
                type="button"
                variant={movimientoTipo === "basadoEnOC" ? "default" : "outline"}
                onClick={() => setMovimientoTipo("basadoEnOC")}
              >
                Basado en Orden de Compra
              </Button>
              <Button
                type="button"
                variant={movimientoTipo === "manual" ? "default" : "outline"}
                onClick={() => setMovimientoTipo("manual")}
              >
                Movimiento Manual
              </Button>
            </div>

            {/* Formulario basado en orden de compra */}
            {movimientoTipo === "basadoEnOC" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ordenCompra" className="text-right">
                    Orden de Compra
                  </Label>
                  <div className="col-span-3">
                    <Combobox
                      options={ordenesOptions}
                      value={selectedOrdenCompra}
                      onSelect={handleOrdenCompraChange}
                      placeholder="Buscar orden de compra..."
                      searchPlaceholder="Buscar por código de OC..."
                      emptyText="No se encontraron órdenes de compra"
                      loading={loadingOrdenes}
                      className="w-full"
                    />
                  </div>
                </div>

                {selectedOrdenCompra && (
                  <>
                    <div className="border rounded-md p-4 mt-2">
                      <h3 className="font-medium mb-2">Ítems a Recibir</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-right">Pendiente</TableHead>
                            <TableHead className="text-right">Recibiendo</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentPageItems().map((item) => {
                            const pendiente = item.cantidad_pedida - item.cantidad_recibida
                            return (
                              <TableRow key={item.oc_detalle_id}>
                                <TableCell>
                                  <Checkbox
                                    checked={item.seleccionado}
                                    onCheckedChange={(checked) => handleCheckChange(item.oc_detalle_id, checked === true)}
                                  />
                                </TableCell>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell>{item.descripcion}</TableCell>
                                <TableCell className="text-right">
                                  {pendiente} {item.unidad}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.recibiendo_ahora || ""}
                                    onChange={(e) => handleCantidadChange(item.oc_detalle_id, e.target.value)}
                                    className="w-20 text-right"
                                    disabled={!item.seleccionado}
                                  />
                                </TableCell>
                                <TableCell>
                                  {item.tiene_discrepancia && item.seleccionado ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      Discrepancia
                                    </Badge>
                                  ) : item.seleccionado ? (
                                    <Badge variant="default">OK</Badge>
                                  ) : (
                                    <Badge variant="outline">Pendiente</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {itemsRecepcion.length > itemsPerPage && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                  aria-disabled={currentPage === 1}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                  aria-disabled={currentPage === totalPages}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </div>

                    {/* Notas de discrepancia */}
                    {itemsRecepcion.some((item) => item.tiene_discrepancia && item.seleccionado) && (
                      <div className="border rounded-md p-4 mt-2">
                        <h3 className="font-medium mb-2">Gestión de Discrepancias</h3>
                        {itemsRecepcion
                          .filter((item) => item.tiene_discrepancia && item.seleccionado)
                          .map((item) => (
                            <div key={`discrepancy-${item.oc_detalle_id}`} className="mb-6 border-b pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                                <Label className="font-medium">
                                  {item.codigo} - {item.descripcion}
                                </Label>
                              </div>

                              <div className="mb-3">
                                <Label className="mb-1 block text-sm">Tipo de discrepancia</Label>
                                <RadioGroup
                                  value={item.tipo_discrepancia}
                                  onValueChange={(value) =>
                                    handleDiscrepancyTypeChange(item.oc_detalle_id, value as "menor" | "mayor" | "none")
                                  }
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="menor" id={`menor-${item.oc_detalle_id}`} />
                                    <Label htmlFor={`menor-${item.oc_detalle_id}`}>Cantidad menor</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="mayor" id={`mayor-${item.oc_detalle_id}`} />
                                    <Label htmlFor={`mayor-${item.oc_detalle_id}`}>Cantidad mayor</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id={`none-${item.oc_detalle_id}`} />
                                    <Label htmlFor={`none-${item.oc_detalle_id}`}>Sin discrepancia</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <div>
                                <Label htmlFor={`discrepancy-${item.oc_detalle_id}`} className="mb-1 block text-sm">
                                  Notas de discrepancia
                                </Label>
                                <Textarea
                                  id={`discrepancy-${item.oc_detalle_id}`}
                                  value={item.notas_discrepancia}
                                  onChange={(e) => handleDiscrepancyNotesChange(item.oc_detalle_id, e.target.value)}
                                  placeholder="Explique la razón de la discrepancia"
                                  className="w-full"
                                  required={item.tiene_discrepancia}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="observacionesGenerales" className="text-right">
                        Observaciones
                      </Label>
                      <Textarea
                        id="observacionesGenerales"
                        value={observacionesGenerales}
                        onChange={(e) => setObservacionesGenerales(e.target.value)}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Formulario para movimiento manual */}
            {movimientoTipo === "manual" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha" className="text-right">
                    Fecha
                  </Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formDataManual.fecha}
                    onChange={handleManualChange}
                    className="col-span-3"
                    required
                    max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={formDataManual.tipo}
                    onValueChange={(value) => handleManualSelectChange("tipo", value)}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Salida">Salida</SelectItem>
                      <SelectItem value="Ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="materialId" className="text-right">
                    Material
                  </Label>
                  <div className="col-span-3">
                    <Combobox
                      options={materialesOptions}
                    value={formDataManual.materialId}
                      onSelect={handleMaterialChange}
                      placeholder="Buscar material..."
                      searchPlaceholder="Buscar por código o descripción..."
                      emptyText="No se encontraron materiales"
                      loading={loadingMateriales}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cantidad" className="text-right">
                    Cantidad
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="cantidad"
                      name="cantidad"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formDataManual.cantidad}
                      onChange={handleManualChange}
                      className="flex-1"
                      required
                    />
                    {selectedMaterial && (
                      <span className="text-sm text-muted-foreground">
                        {getUnidadSegunTipo()} ({getTipoUnidad()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="referencia" className="text-right">
                    Referencia
                  </Label>
                  <Input
                    id="referencia"
                    name="referencia"
                    value={formDataManual.referencia}
                    onChange={handleManualChange}
                    className="col-span-3"
                    placeholder="Ej: OC-2023-001, OP-2023-001"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observaciones" className="text-right">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    value={formDataManual.observaciones}
                    onChange={handleManualChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
