// Tipos para productos

export interface Product {
  producto_id: number
  codigo?: string
  nombre?: string
  estacion?: string
  linea?: string
  imagen?: string
  categoria?: string
  estado?: boolean
  precio?: number
  fecha_creacion?: string
  usuario_creacion?: string
  fecha_modificacion?: string
  usuario_modificacion?: string
}

export interface ProductoTallaColor {
  producto_tal_col_id: number
  producto_id?: number
  color_id?: number
  talla_id?: number
  codigo?: string
  precio_venta?: string
  estado?: boolean
  fecha_creacion?: string
  usuario_creacion?: string | null
  fecha_modificacion?: string
  usuario_modificacion?: string | null
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

export interface Material {
  id: number
  code: string
  name: string
  category: string
  stock: number
  minimum: number
  unit: string
}

export interface BOM {
  id: number
  productId: number
  productCode: string
  productName: string
  materials: BOMItem[]
}

export interface BOMItem {
  id: number
  materialId: number
  code: string
  name: string
  quantity: number
  unit: string
}

// Para el MRP
export interface MRPDemand {
  week: number
  product: string
  quantity: number
}

export interface MRPMaterial {
  week: number
  material: string
  quantity: number
  unit: string
  orderBy: string
}

export interface MRPProduction {
  week: number
  product: string
  quantity: number
  startDate: string
  endDate: string
}

export interface MRPPlan {
  demand: MRPDemand[]
  materialsNeeded: MRPMaterial[]
  production: MRPProduction[]
}
