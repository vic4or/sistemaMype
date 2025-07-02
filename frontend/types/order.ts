// Tipos para pedidos y compras

export interface Order {
  id: string
  customer: string
  date: string
  deliveryDate: string
  total: number
  status: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  productId: number
  productCode: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface PurchaseOrder {
  id: string
  supplier: string
  date: string
  deliveryDate: string
  total: number
  status: string
  items: PurchaseItem[]
}

export interface PurchaseItem {
  id: number
  materialId: number
  materialCode: string
  materialName: string
  quantity: number
  price: number
  subtotal: number
  unit: string
}

export interface Supplier {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  category: string
  status: string
}

export interface Customer {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  address: string
  status: string
}

export interface Pedido {
  pedido_cliente_id: number
  cliente_id: number
  producto_id: number
  fecha_pedido: string
  fecha_entrega: string
  direccion_envio: string
  observaciones?: string
  estado_pedido: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ANULADO'
  cantidad: number
  total: number
  fecha_creacion: string
  fecha_modificacion: string
  estado: boolean
  cli_clientes?: {
    cliente_id: number
    nombre: string
    ruc: string
    direccion: string
    telefono: string
    email: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
  }
  prd_productos?: {
    producto_id: number
    nombre: string
    codigo: string
    estacion: string
    linea: string
    imagen: string | null
    categoria: string
    estado: boolean
    precio: string
    cfg_tallas?: {
      talla_id: number
      valor_talla: string
      estado: boolean
      fecha_creacion: string
      usuario_creacion: string | null
      fecha_modificacion: string
      usuario_modificacion: string | null
    }[]
  }
  ped_pedidos_cliente_det?: PedidoDetalle[]
}

export interface PedidoDetalle {
  ped_cliente_det_id: number
  pedido_cliente_id: number
  producto_tal_col_id: number
  cantidad_solicitada: number
  precio: string
  subtotal: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string
  prd_producto_talla_color?: {
    producto_tal_col_id: number
    producto_id: number
    color_id: number
    talla_id: number
    codigo: string
    precio_venta: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion: string | null
    fecha_modificacion: string
    usuario_modificacion: string | null
    cfg_colores?: {
      color_id: number
      nombre_color: string
      codigo_color: string
      estado: boolean
      fecha_creacion: string
      usuario_creacion: string | null
      fecha_modificacion: string
      usuario_modificacion: string | null
    }
    cfg_tallas?: {
      talla_id: number
      valor_talla: string
      estado: boolean
      fecha_creacion: string
      usuario_creacion: string | null
      fecha_modificacion: string
      usuario_modificacion: string | null
    }
  }
}
