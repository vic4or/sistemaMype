import { Pedido } from "./order"

export type { Pedido }

export interface Tizado {
  definicion_tizado_id: number
  pedido_cliente_id: number
  descripcion_tizado?: string
  ancho_tela_ref_metros: string
  longitud_tela_metros: string
  ref_imagen?: string
  estado: boolean
  fecha_creacion: string
  usuario_creacion?: string
  fecha_modificacion: string
  usuario_modificacion?: string
  ped_pedidos_cliente?: Pedido
  ped_def_tizado_tallas?: TizadoTalla[]
}

export interface TizadoTalla {
  def_tizado_talla_id: number
  definicion_tizado_id: number
  talla_id: number
  cant_prendas_tendida: number
  estado: boolean
  fecha_creacion: string
  usuario_creacion?: string
  fecha_modificacion: string
  usuario_modificacion?: string
  cfg_tallas?: {
    talla_id: number
    valor_talla: string
    estado: boolean
    fecha_creacion: string
    usuario_creacion?: string
    fecha_modificacion: string
    usuario_modificacion?: string
  }
}

export interface CreateTizadoDto {
  pedido_cliente_id: number
  descripcion_tizado?: string
  ancho_tela_ref_metros: string
  longitud_tela_metros: string
  ref_imagen?: string
  tallas: { talla_id: number; cant_prendas_tendida: number }[]
}

export interface UpdateTizadoDto {
  descripcion_tizado?: string
  ancho_tela_ref_metros?: string
  longitud_tela_metros?: string
  ref_imagen?: string
  estado?: boolean
}

export interface CreateTizadoTallaDto {
  talla_id: number
  cant_prendas_tendida: number
}

export interface UpdateTizadoTallaDto {
  cant_prendas_tendida?: number
  estado?: boolean
} 