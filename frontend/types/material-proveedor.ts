// Tipos para gestión Material-Proveedor

export interface MaterialConProveedores {
  id: number
  code: string
  name: string
  category: string
  stock: number
  unit: string
  activo: boolean
  proveedores: MaterialProveedorDetalle[]
}

export interface MaterialProveedorDetalle {
  id: number
  materialProveedorId: number
  proveedorId: number
  proveedorNombre: string
  proveedorRuc: string
  precio: number
  moq: number // Cantidad mínima de pedido
  leadTime: number // Tiempo de entrega en días
  preferido: boolean
  activo: boolean
}

export interface Proveedor {
  proveedor_id: number
  razon_social?: string
  ruc?: string
  direccion?: string
  telefono?: string
  email?: string
  estado?: boolean
  lead_time_dias?: number // Lead time en días
  fecha_creacion?: string
  usuario_creacion?: string
  fecha_modificacion?: string
  usuario_modificacion?: string
}

// Tipo para el formulario de material-proveedor
export interface MaterialProveedorFormData {
  proveedorId: number
  precio: number
  moq: number
  leadTime: number
  preferido: boolean
}
