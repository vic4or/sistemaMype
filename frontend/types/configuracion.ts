export interface CategoriaMaterial {
  id: string
  nombre: string
  tiene_color: boolean
  tiene_talla: boolean
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface UnidadMedida {
  id: string
  nombre: string
  abreviatura: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface Color {
  id: string
  nombre: string
  codigo_hex: string
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
}

export interface Talla {
  id: string
  valor: string
  orden: number
  estado: boolean
  fecha_creacion: string
  fecha_modificacion: string | null
  usuario_creacion?: string | null
  usuario_modificacion?: string | null
} 