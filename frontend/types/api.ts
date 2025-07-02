// ===================================================================
// TIPOS TYPESCRIPT PARA APIS - COMENTADO PARA FUTURO USO
// ===================================================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/*
// Tipos base


// Entidades principales
export interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  estacion: string
  linea: string
  descripcion?: string
  precio?: number
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
  combinaciones?: ProductoCombinacion[]
}

export interface ProductoCombinacion {
  id: number
  productoId: number
  colorId: number
  tallaId: number
  colorNombre: string
  tallaNombre: string
  sku: string
  activo: boolean
}

export interface Material {
  id: number
  codigo: string
  nombre: string
  categoriaId: number
  categoria?: Categoria
  stock: number
  stockMinimo: number
  unidadMedida: string
  costo?: number
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
  proveedores?: MaterialProveedor[]
}

export interface MaterialProveedor {
  id: number
  materialId: number
  proveedorId: number
  proveedor?: Proveedor
  precio: number
  moq: number
  leadTime: number
  preferido: boolean
  activo: boolean
}

export interface Proveedor {
  id: number
  ruc: string
  razonSocial: string
  telefono?: string
  email?: string
  direccion?: string
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
}

export interface Cliente {
  id: number
  ruc: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
}

export interface Pedido {
  id: number
  codigo: string
  clienteId: number
  cliente?: Cliente
  fechaPedido: string
  fechaEntrega: string
  direccionEnvio?: string
  estado: "pending" | "in-process" | "completed" | "cancelled"
  total: number
  observaciones?: string
  detalles?: PedidoDetalle[]
}

export interface PedidoDetalle {
  id: number
  pedidoId: number
  productoId: number
  producto?: Producto
  colorId: number
  tallaId: number
  cantidad: number
  precio: number
  subtotal: number
}

export interface OrdenCompra {
  id: number
  codigo: string
  proveedorId: number
  proveedor?: Proveedor
  fechaEmision: string
  fechaEntrega: string
  estado: "pending" | "approved" | "delivered" | "rejected"
  total: number
  observaciones?: string
  items?: OrdenCompraItem[]
}

export interface OrdenCompraItem {
  id: number
  ordenCompraId: number
  materialId: number
  material?: Material
  cantidad: number
  precio: number
  subtotal: number
}

export interface Categoria {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
  // Configuración BOM
  tiene_color: boolean
  tiene_talla: boolean
  varia_cantidad_por_talla: boolean
  varia_insumo_por_color: boolean
}



// BOM
export interface BOM {
  id: number
  productoId: number
  producto?: Producto
  version: string
  activo: boolean
  fechaCreacion: string
  fechaModificacion?: string
  itemsBase?: BOMItemBase[]
  variaciones?: BOMVariacion[]
}

export interface BOMItemBase {
  id: number
  bomId: number
  materialId: number
  material?: Material
  cantidad: number
  tipo: "base" | "variable"
}

export interface BOMVariacion {
  id: number
  bomId: number
  productoTallaColorId: string
  materialId: number
  material?: Material
  cantidadConsumoEspecifica: number
}

// MRP
export interface PlanificacionMRP {
  id: number
  codigo: string
  fechaInicio: string
  fechaFin: string
  estado: "configuracion" | "ejecutando" | "completado" | "error"
  usuarioId: number
  pedidosIncluidos: number[]
  fechaEjecucion?: string
  sugerencias?: SugerenciaCompra[]
}

export interface SugerenciaCompra {
  id: number
  planificacionId: number
  proveedorId: number
  proveedor?: Proveedor
  materialId: number
  material?: Material
  cantidadSugerida: number
  precioUnitario: number
  total: number
  estado: "pendiente" | "modificada" | "aprobada" | "rechazada"
  cantidadModificada?: number
  precioModificado?: number
  observaciones?: string
}
*/


export interface CategoriaMaterial {
  categoria_material_id: number
  nombre_categoria: string
  tiene_color: boolean
  tiene_talla: boolean
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface Color {
  color_id: number
  nombre_color: string
  codigo_hex: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface UnidadMedida {
  unidad_medida_id: number
  nombre_unidad: string
  abreviatura: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface Talla {
  talla_id: number
  valor_talla: string
  orden: number
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface Cliente {
  cliente_id: number
  nombre: string
  ruc: string
  telefono: string
  email: string
  direccion: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

// Interfaces basadas en los modelos Prisma para materiales
export interface Material {
  material_id: number
  codigo_material: string
  descripcion_material: string
  categoria_material_id: number
  unidad_medida_id: number
  color_id?: number | null
  talla_id?: number | null
  ancho_tela_metros?: number | null
  rendimiento_tela?: number | null
  tipo_tejido_tela?: string | null
  stock_actual?: string | number | null
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
  cfg_categorias_material?: {
    categoria_material_id: number
    nombre_categoria: string
    tiene_color: boolean
    tiene_talla: boolean
    estado: boolean
  }
  cfg_unidades_medida?: {
    unidad_medida_id: number
    nombre_unidad: string
    abreviatura: string
    estado: boolean
  }
  cfg_colores?: {
    color_id: number
    nombre_color: string
    codigo_hex: string
    estado: boolean
  }
  cfg_tallas?: {
    talla_id: number
    valor_talla: string
    orden: number
    estado: boolean
  }
  cfg_presentaciones?: {
    presentacion_id: number
    nombre_presentacion: string
    abreviatura_compra?: string
    abreviatura_consumo?: string
    factor_conversion?: number
    estado: boolean
  }
}

export interface MaterialProveedor {
  mat_prov_id: number
  material_id: number
  proveedor_id: number
  precio_compra: number
  moq_proveedor: number
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
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
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

// DTOs para las APIs
export interface CreateMaterialDto {
  codigo_material: string
  descripcion_material: string
  categoria_material_id: number
  talla_id?: number
  color_id?: number
  ancho_tela_metros?: number
  rendimiento_tela?: number
  tipo_tejido_tela?: string
  factor_conversion_compra?: number
}

export interface AsociarProveedorDto {
  proveedor_id: number
  precio_compra: number
  moq_proveedor: number
}

// Eliminada MaterialWithProveedores - usar Material directamente

// Placeholder para evitar errores de importación
export type PlaceholderType = {}
