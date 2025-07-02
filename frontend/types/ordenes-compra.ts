// Tipos para órdenes de compra
export interface OrdenCompra {
  orden_compra_id: number
  proveedor_id: number
  numero_oc: string
  fecha_emision_oc: string
  fecha_esperada: string
  estado_oc: string
  monto_total_oc: string
  nota: string | null
  estado: string
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  pro_proveedores: Proveedor
  cmp_ordenes_compra_det: OrdenCompraDetalle[]
}

export interface Proveedor {
  proveedor_id: number
  razon_social: string
  ruc: string
  direccion: string
  telefono: string
  email: string
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string | null
  fecha_modificacion: string
  usuario_modificacion: string | null
  lead_time_dias: number
}

export interface OrdenCompraDetalle {
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
  mat_materiales: MaterialOrdenCompra
}

export interface MaterialOrdenCompra {
  material_id: number
  categoria_material_id: number
  unidad_medida_id: number
  talla_id: number | null
  color_id: number | null
  codigo_material: string
  stock_actual: string
  descripcion_material: string
  ancho_tela_metros: number | null
  rendimiento_tela: number | null
  tipo_tejido_tela: string | null
  estado: boolean
  fecha_creacion: string
  usuario_creacion: string
  fecha_modificacion: string
  usuario_modificacion: string | null
  unidad_consumo_id: number
  factor_conversion_compra: string
  cfg_unidades_medida?: {
    abreviatura: string
  }
}

export interface CreateOrdenCompraDto {
  proveedor_id: number
  numero_oc: string
  fecha_emision_oc: string
  fecha_esperada: string
  nota?: string | null
  estado_oc?: string
  items: CreateOrdenCompraDetalleDto[]
}

export interface UpdateOrdenCompraDto {
  numero_oc?: string
  fecha_emision_oc?: string
  fecha_esperada?: string
  nota?: string | null
  estado_oc?: string
  monto_total_oc?: string
  cmp_ordenes_compra_det?: OrdenCompraDetalle[]
}

export interface CreateOrdenCompraDetalleDto {
  material_id: number
  cantidad: string
  precio_unitario: string
}

export interface MaterialPorProveedor {
  mat_prov_id: number
  material_id: number
  proveedor_id: number
  precio_compra: number
  moq_proveedor: number
  estado: boolean
  mat_materiales?: MaterialOrdenCompra
} 