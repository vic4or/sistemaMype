import api from '@/lib/api'
import type { 
  OrdenCompra, 
  OrdenCompraDetalle, 
  CreateOrdenCompraDto, 
  UpdateOrdenCompraDto, 
  CreateOrdenCompraDetalleDto,
  MaterialPorProveedor 
} from '@/types/ordenes-compra'
import type { Proveedor } from '@/types/material-proveedor'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => { previous: { finalY: number } };
  }
}

// Interfaz para la respuesta del backend
interface OrdenCompraBackend {
  orden_compra_id: number
  proveedor_id: number
  numero_oc: string
  fecha_emision_oc: string
  fecha_esperada: string
  estado_oc: string
  monto_total_oc: string
  nota: string | null
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  pro_proveedores: {
    proveedor_id: number
    razon_social: string
    ruc: string
  }
  cmp_ordenes_compra_det: Array<{
    oc_detalle_id: number
    orden_compra_id: number
    material_id: number
    cantidad_pedida: string
    precio_unitario: string
    subtotal: string
    cantidad_recibida: string
    estado_linea_oc: string
    nota_discrepancia: string | null
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
    mat_materiales: {
      codigo_material: string
      descripcion_material: string
    }
  }>
}

// Funciones auxiliares
const mapOrdenFromBackend = (orden: OrdenCompraBackend): OrdenCompra => ({
  orden_compra_id: orden.orden_compra_id,
  numero_oc: orden.numero_oc,
  proveedor_id: orden.proveedor_id,
  fecha_emision_oc: orden.fecha_emision_oc,
  fecha_esperada: orden.fecha_esperada,
  estado_oc: orden.estado_oc,
  nota: orden.nota,
  monto_total_oc: orden.monto_total_oc,
  estado: orden.estado ? "ACTIVO" : "INACTIVO",
  fecha_creacion: orden.fecha_creacion,
  usuario_creacion: orden.usuario_creacion,
  fecha_modificacion: orden.fecha_modificacion,
  usuario_modificacion: orden.usuario_modificacion,
  pro_proveedores: {
    proveedor_id: orden.pro_proveedores.proveedor_id,
    razon_social: orden.pro_proveedores.razon_social,
    ruc: orden.pro_proveedores.ruc,
    direccion: "",
    telefono: "",
    email: "",
    estado: true,
    fecha_creacion: orden.fecha_creacion,
    usuario_creacion: null,
    fecha_modificacion: orden.fecha_modificacion,
    usuario_modificacion: null,
    lead_time_dias: 0
  },
  cmp_ordenes_compra_det: orden.cmp_ordenes_compra_det.map(item => ({
    oc_detalle_id: item.oc_detalle_id,
    orden_compra_id: item.orden_compra_id,
    material_id: item.material_id,
    cantidad_pedida: item.cantidad_pedida,
    precio_unitario: item.precio_unitario,
    subtotal: item.subtotal,
    cantidad_recibida: item.cantidad_recibida,
    estado_linea_oc: item.estado_linea_oc,
    nota_discrepancia: item.nota_discrepancia,
    estado: item.estado,
    fecha_creacion: item.fecha_creacion,
    usuario_creacion: item.usuario_creacion,
    fecha_modificacion: item.fecha_modificacion,
    usuario_modificacion: item.usuario_modificacion,
    mat_materiales: {
      material_id: item.material_id,
      categoria_material_id: 0,
      unidad_medida_id: 0,
      talla_id: null,
      color_id: null,
      codigo_material: item.mat_materiales.codigo_material,
      stock_actual: "0",
      descripcion_material: item.mat_materiales.descripcion_material,
      ancho_tela_metros: null,
      rendimiento_tela: null,
      tipo_tejido_tela: null,
      estado: true,
      fecha_creacion: item.fecha_creacion,
      usuario_creacion: "",
      fecha_modificacion: item.fecha_modificacion,
      usuario_modificacion: null,
      unidad_consumo_id: 0,
      factor_conversion_compra: "1"
    }
  }))
})

/* ORDENES DE COMPRA */
export const ordenesCompraApi = {
  getAll: async (): Promise<OrdenCompra[]> => {
    try {
      const res = await api.get<OrdenCompraBackend[]>("/ordenes-compra")
      return (res.data || []).map(mapOrdenFromBackend)
    } catch (err: any) {
      console.error('Error al obtener órdenes de compra:', err)
      throw new Error(err.response?.data?.message || "Error al obtener las órdenes de compra")
    }
  },

  getById: async (id: number): Promise<OrdenCompra> => {
    try {
      const res = await api.get<OrdenCompraBackend>(`/ordenes-compra/${id}`)
      return mapOrdenFromBackend(res.data)
    } catch (err: any) {
      console.error(`Error al obtener orden de compra ${id}:`, err)
      throw new Error(err.response?.data?.message || "Error al obtener la orden de compra")
    }
  },

  create: async (data: CreateOrdenCompraDto): Promise<OrdenCompra> => {
    try {
      const res = await api.post<OrdenCompraBackend>("/ordenes-compra", data)
      return mapOrdenFromBackend(res.data)
    } catch (err: any) {
      console.error('Error al crear orden de compra:', err)
      throw new Error(err.response?.data?.message || "Error al crear la orden de compra")
    }
  },

  update: async (id: number, data: UpdateOrdenCompraDto): Promise<OrdenCompra> => {
    try {
      const res = await api.patch<OrdenCompraBackend>(`/ordenes-compra/${id}`, data)
      return mapOrdenFromBackend(res.data)
    } catch (err: any) {
      console.error(`Error al actualizar orden de compra ${id}:`, err)
      throw new Error(err.response?.data?.message || "Error al actualizar la orden de compra")
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/ordenes-compra/${id}`)
    } catch (err: any) {
      console.error(`Error al eliminar orden de compra ${id}:`, err)
      throw new Error(err.response?.data?.message || "Error al eliminar la orden de compra")
    }
  },

  changeStatus: async (id: number, estado: string): Promise<OrdenCompra> => {
    const res = await api.patch<OrdenCompra>(`/ordenes-compra/${id}/estado`, { estado })
    return res.data
  },

  addDetalle: async (ordenId: number, data: CreateOrdenCompraDetalleDto): Promise<OrdenCompraDetalle> => {
    const res = await api.post<OrdenCompraDetalle>(`/ordenes-compra/${ordenId}/detalles`, data)
    return res.data
  },

  updateDetalle: async (detalleId: number, data: Partial<OrdenCompraDetalle>): Promise<OrdenCompraDetalle> => {
    const res = await api.put<OrdenCompraDetalle>(`/ordenes-compra/detalles/${detalleId}`, data)
    return res.data
  },

  deleteDetalle: async (detalleId: number): Promise<void> => {
    await api.delete(`/ordenes-compra/detalles/${detalleId}`)
  },

  // Obtener detalles de una orden de compra
  getDetalles: async (ordenId: number): Promise<OrdenCompraDetalle[]> => {
    try {
      const res = await api.get<OrdenCompraDetalle[]>(`/ordenes-compra/${ordenId}/detalles`)
      return res.data || []
    } catch (err: any) {
      console.error(`Error al obtener detalles de la orden ${ordenId}:`, err)
      throw new Error(err.response?.data?.message || "Error al obtener los detalles de la orden")
    }
  },

  // Agregar detalle usando el patrón de pedidos (por orden ID)
  addDetalleByOrden: async (ordenId: number, data: {
    material_id: number
    cantidad: string
    precio_unitario: string
  }): Promise<OrdenCompraDetalle> => {
    try {
      const res = await api.post<OrdenCompraDetalle>(`/ordenes-compra/${ordenId}/detalle`, data)
      return res.data
    } catch (err: any) {
      console.error(`Error al agregar detalle a la orden ${ordenId}:`, err)
      throw new Error(err.response?.data?.message || "Error al agregar el detalle")
    }
  },

  // Actualizar detalle usando el patrón de pedidos
  updateDetalleByOrden: async (ordenId: number, detalleId: number, data: {
    material_id: number
    cantidad: string
    precio_unitario: string
  }): Promise<OrdenCompraDetalle> => {
    try {
      const res = await api.patch<OrdenCompraDetalle>(`/ordenes-compra/${ordenId}/detalle/${detalleId}`, data)
      return res.data
    } catch (err: any) {
      console.error(`Error al actualizar detalle ${detalleId} de la orden ${ordenId}:`, err)
      throw new Error(err.response?.data?.message || "Error al actualizar el detalle")
    }
  },

  // Eliminar detalle usando el patrón de pedidos
  deleteDetalleByOrden: async (ordenId: number, detalleId: number): Promise<void> => {
    try {
      await api.delete(`/ordenes-compra/${ordenId}/detalle/${detalleId}`)
    } catch (err: any) {
      console.error(`Error al eliminar detalle ${detalleId} de la orden ${ordenId}:`, err)
      throw new Error(err.response?.data?.message || "Error al eliminar el detalle")
    }
  },

  validateStock: async (id: number): Promise<{ valid: boolean; issues: any[] }> => {
    const res = await api.post<{ valid: boolean; issues: any[] }>(`/ordenes-compra/${id}/validate-stock`)
    return res.data
  },

  getProveedores: async (): Promise<Proveedor[]> => {
    try {
      const res = await api.get<Proveedor[]>("/proveedores")
      return res.data || []
    } catch (err: any) {
      console.error('Error al obtener proveedores:', err)
      throw new Error(err.response?.data?.message || "Error al obtener los proveedores")
    }
  },

  getMaterialesPorProveedor: async (proveedorId: number): Promise<MaterialPorProveedor[]> => {
    try {
      const res = await api.get<MaterialPorProveedor[]>(`/proveedores/${proveedorId}/materiales`)
      return res.data || []
    } catch (err: any) {
      console.error(`Error al obtener materiales del proveedor ${proveedorId}:`, err)
      throw new Error(err.response?.data?.message || "Error al obtener los materiales del proveedor")
    }
  },

  downloadPDF: async (ordenId: number, numeroOC: string) => {
    try {
      // Obtener los datos de la orden usando el método getById
      const orden = await ordenesCompraApi.getById(ordenId)
      
      // Importar jsPDF dinámicamente
      const jsPDF = (await import('jspdf')).default
      
      // Crear nuevo documento PDF
      const doc = new jsPDF()
      
      // Configurar fuente
      doc.setFont('helvetica')
      
      // Encabezado
      doc.setFontSize(20)
      doc.text('ORDEN DE COMPRA', 105, 20, { align: 'center' })
      
      // Línea separadora
      doc.setLineWidth(0.5)
      doc.line(20, 25, 190, 25)
      
      // Información de la orden
      doc.setFontSize(12)
      doc.text(`N° OC: ${orden.numero_oc}`, 20, 40)
      doc.text(`Fecha Emisión: ${format(new Date(orden.fecha_emision_oc), 'dd/MM/yyyy', { locale: es })}`, 20, 50)
      doc.text(`Fecha Entrega: ${format(new Date(orden.fecha_esperada), 'dd/MM/yyyy', { locale: es })}`, 20, 60)
      doc.text(`Estado: ${orden.estado_oc}`, 20, 70)
      
      // Información del proveedor
      doc.setFontSize(14)
      doc.text('DATOS DEL PROVEEDOR', 20, 90)
      doc.setFontSize(12)
      doc.text(`Razón Social: ${orden.pro_proveedores.razon_social}`, 20, 100)
      doc.text(`RUC: ${orden.pro_proveedores.ruc}`, 20, 110)
      
      // Tabla de items (manual)
      let yPosition = 130
      
      // Encabezados de tabla
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Código', 20, yPosition)
      doc.text('Descripción', 50, yPosition)
      doc.text('Cant.', 120, yPosition)
      doc.text('Precio Unit.', 140, yPosition)
      doc.text('Subtotal', 170, yPosition)
      
      // Línea bajo encabezados
      doc.line(20, yPosition + 2, 190, yPosition + 2)
      
      yPosition += 10
      doc.setFont('helvetica', 'normal')
      
      let total = 0
      
      // Items
      orden.cmp_ordenes_compra_det.forEach((item, index) => {
        if (yPosition > 250) { // Nueva página si es necesario
          doc.addPage()
          yPosition = 30
        }
        
        const codigo = item.mat_materiales?.codigo_material || '-'
        const descripcion = item.mat_materiales?.descripcion_material || '-'
        const cantidad = item.cantidad_pedida
        const precio = parseFloat(item.precio_unitario)
        const subtotal = parseFloat(item.subtotal)
        
        // Truncar descripción si es muy larga
        const descripcionCorta = descripcion.length > 30 
          ? descripcion.substring(0, 30) + '...' 
          : descripcion
        
        doc.text(codigo, 20, yPosition)
        doc.text(descripcionCorta, 50, yPosition)
        doc.text(cantidad, 120, yPosition)
        doc.text(`S/ ${precio.toFixed(2)}`, 140, yPosition)
        doc.text(`S/ ${subtotal.toFixed(2)}`, 170, yPosition)
        
        total += subtotal
        yPosition += 8
      })
      
      // Línea antes del total
      doc.line(140, yPosition + 2, 190, yPosition + 2)
      yPosition += 10
      
      // Total
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL:', 140, yPosition)
      doc.text(`S/ ${parseFloat(orden.monto_total_oc).toFixed(2)}`, 170, yPosition)
      
      // Nota si existe
      if (orden.nota) {
        yPosition += 20
        doc.setFont('helvetica', 'bold')
        doc.text('NOTA:', 20, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        // Dividir nota en líneas si es muy larga
        const notaLineas = doc.splitTextToSize(orden.nota, 170)
        doc.text(notaLineas, 20, yPosition + 10)
      }
      
      // Guardar el PDF
      doc.save(`OC-${numeroOC}.pdf`)
      
      return true
    } catch (error: any) {
      console.error('Error al generar el PDF:', error)
      throw new Error('No se pudo generar el PDF de la orden de compra: ' + (error.message || 'Error desconocido'))
    }
  }
}

// Obtener todas las órdenes de compra con filtros opcionales
export const getOrdenesCompra = async (params?: {
  proveedor_id?: number
  estado?: string
  search?: string
}) => {
  const searchParams = new URLSearchParams()
  
  if (params?.proveedor_id) searchParams.append('proveedor_id', params.proveedor_id.toString())
  if (params?.estado) searchParams.append('estado', params.estado)
  if (params?.search) searchParams.append('search', params.search)

  const url = `/ordenes-compra${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const response = await api.get<OrdenCompra[]>(url)
  return response.data
}

// Obtener una orden de compra por ID
export const getOrdenCompraById = async (id: number) => {
  const response = await api.get<OrdenCompra>(`/ordenes-compra/${id}`)
  return response.data
}

// Crear una nueva orden de compra
export const createOrdenCompra = async (data: CreateOrdenCompraDto) => {
  const response = await api.post<OrdenCompra>('/ordenes-compra', data)
  return response.data
}

// Actualizar una orden de compra
export const updateOrdenCompra = async (id: number, data: UpdateOrdenCompraDto) => {
  const response = await api.patch<OrdenCompra>(`/ordenes-compra/${id}`, data)
  return response.data
}

// Eliminar una orden de compra
export const deleteOrdenCompra = async (id: number) => {
  await api.delete(`/ordenes-compra/${id}`)
}

// Cambiar estado de una orden de compra
export const changeOrdenCompraStatus = async (id: number, estado: string) => {
  const response = await api.patch<OrdenCompra>(`/ordenes-compra/${id}/estado`, { estado })
  return response.data
}

// Agregar detalle a una orden de compra
export const addOrdenCompraDetalle = async (ordenId: number, data: CreateOrdenCompraDetalleDto) => {
  const response = await api.post<OrdenCompraDetalle>(`/ordenes-compra/${ordenId}/detalles`, data)
  return response.data
}

// Actualizar detalle de una orden de compra
export const updateOrdenCompraDetalle = async (detalleId: number, data: Partial<OrdenCompraDetalle>) => {
  const response = await api.patch<OrdenCompraDetalle>(`/ordenes-compra/detalles/${detalleId}`, data)
  return response.data
}

// Eliminar detalle de una orden de compra
export const deleteOrdenCompraDetalle = async (detalleId: number) => {
  await api.delete(`/ordenes-compra/detalles/${detalleId}`)
}

// Validar stock disponible para una orden
export const validateOrdenCompraStock = async (id: number) => {
  const response = await api.post<{ valid: boolean; issues: any[] }>(`/ordenes-compra/${id}/validate-stock`)
  return response.data
}

// Obtener materiales por proveedor
export const getMaterialesPorProveedor = async (proveedorId: number) => {
  const response = await api.get<MaterialPorProveedor[]>(`/proveedores/${proveedorId}/materiales`)
  return response.data
}
