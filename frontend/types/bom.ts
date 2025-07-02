export interface BOMComun {
  producto_id: number
  material_id: number
  unidad_medida_id: number
  cantidad_consumo_base: number
  usuario_creacion: string
  mat_materiales?: {
    codigo_material: string
    descripcion_material: string
  }
  cfg_unidades_medida?: {
    abreviatura: string
  }
}

export interface BOMVariacion {
  producto_tal_col_id: number
  material_id: number
  unidad_medida_id: number
  cantidad_consumo_especifica: number
  mat_materiales?: {
    codigo_material: string
    descripcion_material: string
  }
  cfg_unidades_medida?: {
    abreviatura: string
  }
}

export interface CrearBOMComunDto {
  usuario: string;
  items: {
    producto_id: number;
    material_id: number;
    unidad_medida_id: number;
    cantidad_consumo_base: number;
  }[];
}

export interface CrearBOMVariacionDto {
  usuario: string
  items: {
    producto_tal_col_id: number
    material_id: number
    unidad_medida_id: number
    cantidad_consumo_especifica: number
  }[]
}

export interface ProductoTallaColor {
  id: number
  producto_id: number
  talla_id: number
  color_id: number
  tallaNombre: string
  colorNombre: string
  estado: boolean
}

export interface BOMStore {
  // Estado
  productoId: number | null
  materialesComunes: BOMComun[]
  materialesVariaciones: BOMVariacion[]
  categoriasConfiguradas: import('@/stores/bom-store').CategoriaConfigurada[]
  isLoadingComunes: boolean
  isLoadingVariaciones: boolean
  error: string | null
  
  // Acciones
  setProductoId: (id: number) => void
  setMaterialesComunes: (materiales: BOMComun[]) => void
  setMaterialesVariaciones: (materiales: BOMVariacion[]) => void
  setCategoriasConfiguradas: (categorias: import('@/stores/bom-store').CategoriaConfigurada[]) => void
  actualizarConsumoTalla: (categoriaId: number, consumoPorTalla: Record<string, number>) => void
  setIsLoadingComunes: (loading: boolean) => void
  setIsLoadingVariaciones: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
} 