"use client"

import React, { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, PlusCircle, Loader2, DollarSign, Package } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { proveedoresApi } from "@/services/api/proveedores"
import { materialesApi } from "@/services/api/materiales"
import { categoriasMaterialApi, unidadesMedidaApi } from "@/services/api/configuracion"
import { createOrdenCompra } from "@/services/api/ordenes-compra"
import type { Material, MaterialProveedor, AsociarProveedorDto, UnidadMedida } from "@/types/api"
import type { Proveedor } from "@/types/material-proveedor"

interface OrderItem {
  material_id: number
  codigo_material: string
  descripcion_material: string
  cantidad: number
  precio_unitario: number
  unidad: string
  subtotal: number
}

interface MaterialEnCreacion {
  material: Material
  relacionExistente: MaterialProveedor | null
  showPrecioFields: boolean
  precio_compra: number
  moq_proveedor: number
}

interface NuevaOrdenFormProps {
  onSuccess?: () => void
  standalone?: boolean
}

export default function NuevaOrdenForm({ onSuccess, standalone }: NuevaOrdenFormProps) {
  const [open, setOpen] = useState(false)
  
  // Estados de datos
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [categoriasMaterial, setCategoriasMaterial] = useState<any[]>([])
  const [materialesPorCategoria, setMaterialesPorCategoria] = useState<Material[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("")
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    proveedor_id: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    fecha_entrega: "",
    observaciones: "",
  })
  
  const [items, setItems] = useState<OrderItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    material_id: "",
    cantidad: "",
    precio_unitario: "",
  })
  const [currentMaterialInfo, setCurrentMaterialInfo] = useState<{
    moq: number | null
    material: Material | null
  }>({
    moq: null,
    material: null
  })

  // Estados de la lógica de material-proveedor
  const [materialEnCreacion, setMaterialEnCreacion] = useState<MaterialEnCreacion | null>(null)
  const [showMaterialProveedorDialog, setShowMaterialProveedorDialog] = useState(false)

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [loadingMateriales, setLoadingMateriales] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [fechaError, setFechaError] = useState("")
  const [verificandoMaterial, setVerificandoMaterial] = useState(false)

  // Cargar proveedores y categorías al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [proveedoresData, categoriasData, unidadesData] = await Promise.all([
          proveedoresApi.getAll(),
          categoriasMaterialApi.getAll(),
          unidadesMedidaApi.getAll()
        ])
        
        setProveedores(proveedoresData.filter(p => p.estado)) // Solo proveedores activos
        setCategoriasMaterial(categoriasData.filter((c: any) => c.estado))
        setUnidadesMedida(unidadesData.filter(u => u.estado)) // Solo unidades activas
      } catch (err: any) {
        console.error("Error al cargar datos:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos iniciales",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    // Cargar datos cuando el modal se abre (standalone=true) o cuando es contenido de modal (standalone=false)
    if (open || standalone === false) {
      loadData()
    }
  }, [open, standalone])

  // Helper para obtener la unidad de medida de un material
  const getUnidadMedidaMaterial = (material: Material) => {
    console.log("🔍 Debug getUnidadMedidaMaterial:")
    console.log("Material:", material)
    console.log("material.unidad_medida_id:", material.unidad_medida_id)
    console.log("material.cfg_unidades_medida:", material.cfg_unidades_medida)
    console.log("unidadesMedida array:", unidadesMedida)
    
    // Primero intentar obtener de cfg_unidades_medida (relación incluida)
    if (material.cfg_unidades_medida?.nombre_unidad) {
      console.log("✅ Encontrado en cfg_unidades_medida:", material.cfg_unidades_medida.nombre_unidad)
      return material.cfg_unidades_medida.nombre_unidad
    }
    
    // Si no está disponible, buscar en el array de unidades por unidad_medida_id
    const unidadEncontrada = unidadesMedida.find(u => u.unidad_medida_id === material.unidad_medida_id)
    console.log("Unidad encontrada en array:", unidadEncontrada)
    
    if (unidadEncontrada?.nombre_unidad) {
      console.log("✅ Encontrado en array unidadesMedida:", unidadEncontrada.nombre_unidad)
      return unidadEncontrada.nombre_unidad
    }
    
    console.log("❌ No se encontró unidad, devolviendo 'Sin especificar'")
    return "Sin especificar"
  }

  // Cargar materiales por categoría
  const loadMaterialesPorCategoria = async (categoriaId: number) => {
    setLoadingMateriales(true)
    try {
      const materialesCategoria = await materialesApi.getByCategoria(categoriaId)
      console.log("🔍 Debug loadMaterialesPorCategoria:")
      console.log("API endpoint:", `/materiales/categoria/${categoriaId}`)
      console.log("Respuesta completa:", materialesCategoria)
      console.log("Primer material (ejemplo):", materialesCategoria[0])
      
      setMaterialesPorCategoria(materialesCategoria.filter((m: Material) => m.estado))
    } catch (err: any) {
      console.error("Error al cargar materiales por categoría:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales de la categoría",
        variant: "destructive"
      })
    } finally {
      setLoadingMateriales(false)
    }
  }

  // Validación de fechas
  const validateFechas = (fechaEmision: string, fechaEntrega: string) => {
    const hoy = new Date().toISOString().split("T")[0]
    const fechaEmi = new Date(fechaEmision)
    const fechaEnt = new Date(fechaEntrega)

    if (fechaEntrega < hoy) {
      return "La fecha de entrega no puede ser anterior al día actual"
    }

    if (fechaEnt <= fechaEmi) {
      return "La fecha de entrega debe ser posterior a la fecha de emisión"
    }

    return ""
  }

  // Manejar cambios en campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Validar fechas cuando cambien
    if (name === "fecha_emision" || name === "fecha_entrega") {
      const nuevaFechaEmision = name === "fecha_emision" ? value : formData.fecha_emision
      const nuevaFechaEntrega = name === "fecha_entrega" ? value : formData.fecha_entrega

      if (nuevaFechaEmision && nuevaFechaEntrega) {
        const error = validateFechas(nuevaFechaEmision, nuevaFechaEntrega)
        setFechaError(error)
      }
    }
  }

  // Manejar cambio de proveedor
  const handleProveedorChange = async (value: string) => {
    setFormData(prev => ({ ...prev, proveedor_id: value }))
    
    // Limpiar selecciones previas
    setCategoriaSeleccionada("")
    setMaterialesPorCategoria([])
    setItems([])
    setCurrentItem({ material_id: "", cantidad: "", precio_unitario: "" })
  }

  // Manejar cambio de categoría
  const handleCategoriaChange = async (value: string) => {
    setCategoriaSeleccionada(value)
    
    if (value) {
      await loadMaterialesPorCategoria(parseInt(value))
    } else {
      setMaterialesPorCategoria([])
    }
    
    // Limpiar material actual
    setCurrentItem({ material_id: "", cantidad: "", precio_unitario: "" })
    setCurrentMaterialInfo({ moq: null, material: null })
  }

  // Manejar selección de material con verificación de relación proveedor
  const handleMaterialChange = async (value: string) => {
    if (!formData.proveedor_id) return

    const material = materialesPorCategoria.find(m => m.material_id.toString() === value)
    if (!material) return

    setVerificandoMaterial(true)
    try {
      // Verificar si existe relación material-proveedor
      const params = {
        materialId: material.material_id,
        proveedorId: parseInt(formData.proveedor_id)
      }
      console.log('🚀 Enviando petición al backend:', {
        endpoint: `/materiales/${params.materialId}/verificar-proveedor/${params.proveedorId}`,
        params
      })

      const relacionExistente = await materialesApi.verificarRelacionProveedor(
        params.materialId, 
        params.proveedorId
      )

      console.log('📊 Respuesta del backend (raw):', relacionExistente)
      console.log('📊 Tipo de datos recibidos:', {
        precio_compra: {
          valor: relacionExistente?.precio_compra,
          tipo: typeof relacionExistente?.precio_compra
        },
        moq_proveedor: {
          valor: relacionExistente?.moq_proveedor,
          tipo: typeof relacionExistente?.moq_proveedor
        }
      })

      if (relacionExistente) {
        // Ya existe relación, usar valores existentes
        console.log('✅ Relación existente encontrada, usando valores:', relacionExistente)
        
        const precio = Number(relacionExistente.precio_compra) || 0
        const moq = Number(relacionExistente.moq_proveedor) || 1
        
        console.log('✅ Relación existente encontrada, usando valores:', {
          moq: moq,
          precio: precio
        })
        
        setCurrentItem({
          material_id: value,
          cantidad: moq.toString(),
          precio_unitario: precio.toString(),
        })
        
        // Guardar información del material y MOQ para mostrar
        setCurrentMaterialInfo({
          moq: moq,
          material: material
        })
        
        toast({
          title: "Material cargado",
          description: `MOQ: ${moq} | Precio: S/ ${precio.toFixed(2)}`,
        })
      } else {
        // No existe relación, mostrar modal para crear
        console.log('❌ No existe relación, mostrando modal para crear nueva')
        setMaterialEnCreacion({
          material,
          relacionExistente: null,
          showPrecioFields: true,
          precio_compra: 0,
          moq_proveedor: 1
        })
        setShowMaterialProveedorDialog(true)
        
        // Limpiar información del material anterior
        setCurrentMaterialInfo({
          moq: null,
          material: material
        })
      }
    } catch (error: any) {
      console.error("⚠️ Error al verificar relación material-proveedor:", error)
      
      // Si es un error 404 o de "no encontrado", es válido - no existe la relación
      if (error.response?.status === 404 || error.message?.includes('no encontrado')) {
        console.log('❌ Confirmado: No existe relación (error 404), mostrando modal para crear nueva')
        setMaterialEnCreacion({
          material,
          relacionExistente: null,
          showPrecioFields: true,
          precio_compra: 0,
          moq_proveedor: 1
        })
        setShowMaterialProveedorDialog(true)
        
        setCurrentMaterialInfo({
          moq: null,
          material: material
        })
      } else {
        // Error real del servidor, mostrar mensaje de error
        console.error('🔥 Error real del servidor:', error)
        toast({
          title: "Error",
          description: "Error al verificar el material. Intente nuevamente.",
          variant: "destructive"
        })
        
        // Limpiar selección
        setCurrentItem({ material_id: "", cantidad: "", precio_unitario: "" })
        setCurrentMaterialInfo({ moq: null, material: null })
      }
    } finally {
      setVerificandoMaterial(false)
    }
  }

  // Crear relación material-proveedor
  const handleCrearRelacionMaterialProveedor = async () => {
    if (!materialEnCreacion || !formData.proveedor_id) return

    try {
      const datosRelacion: AsociarProveedorDto = {
        proveedor_id: parseInt(formData.proveedor_id),
        precio_compra: materialEnCreacion.precio_compra,
        moq_proveedor: materialEnCreacion.moq_proveedor,
      }

      console.log('🔨 Creando nueva relación material-proveedor:', {
        material_id: materialEnCreacion.material.material_id,
        ...datosRelacion
      })

      // Verificar una vez más antes de crear para evitar duplicados
      const verificacionFinal = await materialesApi.verificarRelacionProveedor(
        materialEnCreacion.material.material_id,
        parseInt(formData.proveedor_id)
      )

      if (verificacionFinal) {
        // Ya existe, usar la relación existente
        console.log('⚠️ Relación creada por otro proceso, usando existente:', verificacionFinal)
        setCurrentItem({
          material_id: materialEnCreacion.material.material_id.toString(),
          cantidad: verificacionFinal.moq_proveedor?.toString() || "1",
          precio_unitario: verificacionFinal.precio_compra?.toString() || "0",
        })
        
        setCurrentMaterialInfo({
          moq: verificacionFinal.moq_proveedor || null,
          material: materialEnCreacion.material
        })
        
        toast({
          title: "Material cargado",
          description: "Se encontró una relación existente y se cargó correctamente",
        })
      } else {
        // No existe, crear nueva
        await materialesApi.asociarProveedor(materialEnCreacion.material.material_id, datosRelacion)

        // Establecer valores en el formulario
        setCurrentItem({
          material_id: materialEnCreacion.material.material_id.toString(),
          cantidad: materialEnCreacion.moq_proveedor.toString(),
          precio_unitario: materialEnCreacion.precio_compra.toString(),
        })

        // Guardar información del MOQ
        setCurrentMaterialInfo({
          moq: materialEnCreacion.moq_proveedor,
          material: materialEnCreacion.material
        })

        toast({
          title: "Éxito",
          description: "Relación material-proveedor creada correctamente",
        })
      }

      setShowMaterialProveedorDialog(false)
      setMaterialEnCreacion(null)

    } catch (error: any) {
      console.error("Error al crear relación material-proveedor:", error)
      
      // Si el error es porque ya existe la relación, verificar y usar la existente
      if (error.message?.includes('ya existe') || error.response?.status === 409) {
        try {
          const relacionExistente = await materialesApi.verificarRelacionProveedor(
            materialEnCreacion.material.material_id,
            parseInt(formData.proveedor_id)
          )
          
          if (relacionExistente) {
            console.log('✅ Usando relación existente después de 409:', relacionExistente)
            setCurrentItem({
              material_id: materialEnCreacion.material.material_id.toString(),
              cantidad: relacionExistente.moq_proveedor?.toString() || "1",
              precio_unitario: relacionExistente.precio_compra?.toString() || "0",
            })
            
            setCurrentMaterialInfo({
              moq: relacionExistente.moq_proveedor || null,
              material: materialEnCreacion.material
            })
            
            setShowMaterialProveedorDialog(false)
            setMaterialEnCreacion(null)
            
            toast({
              title: "Material cargado",
              description: "Se cargó la relación existente",
            })
            return
          }
        } catch (verifyError) {
          console.error("Error al verificar relación después de 409:", verifyError)
        }
      }
      
      toast({
        title: "Error",
        description: "No se pudo crear la relación material-proveedor",
        variant: "destructive"
      })
    }
  }

  // Manejar cambios en los campos del item actual
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentItem(prev => ({ ...prev, [name]: value }))
  }

  // Agregar item a la lista
  const addItem = () => {
    if (currentItem.material_id && currentItem.cantidad && currentItem.precio_unitario) {
      const material = materialesPorCategoria.find(m => m.material_id.toString() === currentItem.material_id)
      if (material) {
        const cantidad = parseFloat(currentItem.cantidad)
        const precio = parseFloat(currentItem.precio_unitario)
        
        // Verificar que no se agregue el mismo material dos veces
        const materialYaAgregado = items.some(item => item.material_id.toString() === currentItem.material_id)
        if (materialYaAgregado) {
          setError("Este material ya ha sido agregado")
          return
        }

        const newItem: OrderItem = {
          material_id: parseInt(currentItem.material_id),
          codigo_material: material.codigo_material || "",
          descripcion_material: material.descripcion_material || "",
          cantidad: cantidad,
          precio_unitario: precio,
          unidad: material.cfg_unidades_medida?.abreviatura || "ud",
          subtotal: cantidad * precio,
        }
        
        setItems([...items, newItem])
        setCurrentItem({ material_id: "", cantidad: "", precio_unitario: "" })
        setCurrentMaterialInfo({ moq: null, material: null })
        setError("")
      }
    } else {
      setError("Complete todos los campos para agregar el material")
    }
  }

  // Remover item de la lista
  const removeItem = (index: number) => {
    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    setItems(updatedItems)
  }

  // Calcular total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (fechaError) {
      setError("Por favor corrija los errores de fecha antes de guardar")
      return
    }

    if (!formData.proveedor_id) {
      setError("Debe seleccionar un proveedor")
      return
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un material")
      return
    }

    // Validar que las fechas no estén vacías
    if (!formData.fecha_emision || !formData.fecha_entrega) {
      setError("Las fechas de emisión y entrega son obligatorias")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      console.log('📝 Datos del formulario:', {
        formData,
        items: items.map(item => ({
          material_id: item.material_id,
          cantidad: item.cantidad.toString(),
          precio_unitario: item.precio_unitario.toString()
        }))
      })

      const ordenData = {
        proveedor_id: parseInt(formData.proveedor_id),
        numero_oc: `OC-${Date.now()}`, // Temporal, debería ser generado por el backend
        fecha_emision_oc: new Date(formData.fecha_emision + 'T00:00:00.000Z').toISOString(),
        fecha_esperada: new Date(formData.fecha_entrega + 'T00:00:00.000Z').toISOString(),
        nota: formData.observaciones || undefined,
        items: items.map(item => ({
          material_id: item.material_id,
          cantidad: item.cantidad.toString(),
          precio_unitario: item.precio_unitario.toString()
        }))
      }

      console.log('🚀 Datos preparados para enviar:', ordenData)

      const ordenCreada = await createOrdenCompra(ordenData)
      console.log('✅ Orden creada:', ordenCreada)

      toast({
        title: "Éxito",
        description: "Orden de compra creada correctamente"
      })

      handleClose()
      onSuccess?.()

    } catch (err: any) {
      console.error('💥 Error al crear orden:', err)
      const errorMessage = err.response?.data?.message || err.message || "Error al crear la orden de compra"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      proveedor_id: "",
      fecha_emision: new Date().toISOString().split("T")[0],
      fecha_entrega: "",
      observaciones: "",
    })
    setItems([])
    setCurrentItem({ material_id: "", cantidad: "", precio_unitario: "" })
    setCurrentMaterialInfo({ moq: null, material: null })
    setMaterialesPorCategoria([])
    setError("")
    setFechaError("")
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <>
      {standalone !== false ? (
        // Versión como modal independiente (comportamiento original)
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) {
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <FormContent />
          </DialogContent>
        </Dialog>
      ) : (
        // Versión como contenido de modal (sin Dialog wrapper)
        <FormContent />
      )}

      {/* Modal para crear relación material-proveedor */}
      <Dialog open={showMaterialProveedorDialog} onOpenChange={setShowMaterialProveedorDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Material para Proveedor</DialogTitle>
            <DialogDescription>
              El material seleccionado no tiene relación con este proveedor. Configure los datos de compra.
            </DialogDescription>
          </DialogHeader>
          
          {materialEnCreacion && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Material Seleccionado</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-medium">{materialEnCreacion.material.codigo_material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descripción:</span>
                    <span className="font-medium">{materialEnCreacion.material.descripcion_material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-medium">
                      {materialEnCreacion.material.cfg_categorias_material?.nombre_categoria || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidad de Compra:</span>
                    <span className="font-medium">
                      {getUnidadMedidaMaterial(materialEnCreacion.material)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio_compra">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Precio de Compra *
                  </Label>
                  <Input
                    id="precio_compra"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={materialEnCreacion.precio_compra}
                    onChange={(e) => setMaterialEnCreacion(prev => prev ? {
                      ...prev,
                      precio_compra: parseFloat(e.target.value) || 0
                    } : null)}
                  />
                  <p className="text-xs text-muted-foreground">Precio en soles (S/)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="moq_proveedor">
                    <Package className="inline w-4 h-4 mr-1" />
                    MOQ (Cantidad Mínima) *
                  </Label>
                  <Input
                    id="moq_proveedor"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={materialEnCreacion.moq_proveedor}
                    onChange={(e) => setMaterialEnCreacion(prev => prev ? {
                      ...prev,
                      moq_proveedor: parseInt(e.target.value) || 1
                    } : null)}
                  />
                  <p className="text-xs text-muted-foreground">Cantidad mínima de pedido</p>
                </div>
              </div>

              {materialEnCreacion.precio_compra > 0 && materialEnCreacion.moq_proveedor > 0 && (
                <div className="border rounded-lg p-3 bg-green-50">
                  <div className="text-sm font-medium text-green-800 mb-1">Vista Previa del Pedido</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cantidad inicial:</span>
                      <br />
                      <span className="font-medium">{materialEnCreacion.moq_proveedor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Precio unitario:</span>
                      <br />
                      <span className="font-medium">S/ {materialEnCreacion.precio_compra.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subtotal:</span>
                      <br />
                      <span className="font-medium text-green-700">
                        S/ {(materialEnCreacion.precio_compra * materialEnCreacion.moq_proveedor).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowMaterialProveedorDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCrearRelacionMaterialProveedor}
              disabled={!materialEnCreacion || materialEnCreacion.precio_compra <= 0 || materialEnCreacion.moq_proveedor <= 0}
            >
              Crear Relación y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  function FormContent() {
    return (
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Crear Nueva Orden de Compra</DialogTitle>
          <DialogDescription>
            Complete la información de la orden de compra y agregue los materiales a solicitar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proveedor_id">Proveedor *</Label>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando proveedores...</span>
                </div>
              ) : (
                <Select
                  value={formData.proveedor_id}
                  onValueChange={handleProveedorChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                        {proveedor.razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_emision">Fecha de Emisión *</Label>
              <Input
                id="fecha_emision"
                name="fecha_emision"
                type="date"
                value={formData.fecha_emision}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_entrega">Fecha de Entrega *</Label>
              <Input
                id="fecha_entrega"
                name="fecha_entrega"
                type="date"
                value={formData.fecha_entrega}
                onChange={handleChange}
                className={fechaError ? "border-destructive" : ""}
                required
              />
              {fechaError && (
                <p className="text-sm text-destructive">{fechaError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Instrucciones adicionales para el proveedor"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Sección de materiales */}
          {formData.proveedor_id && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Agregar Materiales</h4>
              
              {/* Selector de categoría */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Categoría de Material</Label>
                <Select
                  value={categoriaSeleccionada}
                  onValueChange={handleCategoriaChange}
                  disabled={!formData.proveedor_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.proveedor_id 
                        ? "Primero selecciona un proveedor" 
                        : "Seleccionar categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasMaterial.map((categoria) => (
                      <SelectItem key={categoria.categoria_material_id} value={categoria.categoria_material_id.toString()}>
                        {categoria.nombre_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mostrar loader cuando se están cargando materiales */}
              {loadingMateriales && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando materiales de la categoría...</span>
                </div>
              )}

              {/* Mostrar selector de materiales y formulario solo si hay una categoría seleccionada */}
              {categoriaSeleccionada && !loadingMateriales && (
                <>
                  <div className="space-y-4">
                    {/* Selector de material */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Material</Label>
                      <Select 
                        value={currentItem.material_id} 
                        onValueChange={handleMaterialChange}
                        disabled={verificandoMaterial || !categoriaSeleccionada || materialesPorCategoria.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !categoriaSeleccionada 
                              ? "Primero selecciona una categoría" 
                              : materialesPorCategoria.length === 0
                              ? "No hay materiales en esta categoría"
                              : "Seleccionar material"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {materialesPorCategoria.map((material) => (
                            <SelectItem 
                              key={material.material_id} 
                              value={material.material_id.toString()}
                            >
                              {material.codigo_material} - {material.descripcion_material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {verificandoMaterial && (
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Verificando material...
                        </div>
                      )}
                    </div>

                    {/* Información del material y campos de cantidad/precio */}
                    {currentItem.material_id && (
                      <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                        {/* Información del material */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Código:</span>
                            <span className="ml-2 font-medium">{currentMaterialInfo.material?.codigo_material}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Unidad:</span>
                            <span className="ml-2 font-medium">
                              {currentMaterialInfo.material?.cfg_unidades_medida?.abreviatura || 'ud'}
                            </span>
                          </div>
                          {currentMaterialInfo.moq && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">MOQ (Cantidad Mínima):</span>
                              <span className="ml-2 font-medium text-blue-600">
                                {currentMaterialInfo.moq}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Campos de entrada */}
                        <div className="grid grid-cols-5 gap-3">
                          <div className="col-span-2">
                            <Label className="text-sm font-medium mb-2 block">
                              Cantidad a Solicitar *
                            </Label>
                            <Input
                              name="cantidad"
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Cantidad"
                              value={currentItem.cantidad}
                              onChange={handleItemChange}
                            />
                            {currentMaterialInfo.moq && parseFloat(currentItem.cantidad) < currentMaterialInfo.moq && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ Menor al MOQ ({currentMaterialInfo.moq})
                              </p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-medium mb-2 block">
                              Precio Unitario *
                            </Label>
                            <Input
                              name="precio_unitario"
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Precio unitario"
                              value={currentItem.precio_unitario}
                              onChange={handleItemChange}
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button 
                              type="button" 
                              onClick={addItem} 
                              className="w-full"
                              disabled={!currentItem.material_id || !currentItem.cantidad || !currentItem.precio_unitario}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Cálculo del subtotal */}
                        {currentItem.cantidad && currentItem.precio_unitario && (
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Subtotal: </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(parseFloat(currentItem.cantidad) * parseFloat(currentItem.precio_unitario))}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {items.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-center">Unidad</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.codigo_material}</TableCell>
                              <TableCell>{item.descripcion_material}</TableCell>
                              <TableCell className="text-right">{item.cantidad}</TableCell>
                              <TableCell className="text-center">{item.unidad}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.precio_unitario)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2">
                            <TableCell colSpan={5} className="text-right font-medium">
                              TOTAL:
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(calculateTotal())}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground border rounded-md">
                      No hay materiales agregados. Agregue al menos un material.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || !!fechaError || items.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Orden"
            )}
          </Button>
        </DialogFooter>
      </form>
    )
  }
}
