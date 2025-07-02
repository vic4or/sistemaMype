import { create } from 'zustand'
import type { BOMStore, BOMComun, BOMVariacion } from '@/types/bom'
import type { CategoriaMaterial } from '@/types/api'

// Interfaz para categorías configuradas en el paso 2
export interface CategoriaConfigurada {
  categoria: CategoriaMaterial
  esMaterialComun: boolean
  esVariable: boolean
  materialesAsignados: number[] // IDs de materiales asignados
  mapeoColores?: Record<string, any> // Mapeo de materiales por color (para variables)
  consumoPorTalla?: Record<string, number> // Cantidades por talla del Paso 3
}

const initialState = {
  productoId: null,
  materialesComunes: [] as BOMComun[],
  materialesVariaciones: [] as BOMVariacion[],
  categoriasConfiguradas: [] as CategoriaConfigurada[],
  isLoadingComunes: false,
  isLoadingVariaciones: false,
  error: null,
}

export const useBOMStore = create<BOMStore>()((set) => ({
  ...initialState,

  setProductoId: (id: number) => set({ productoId: id }),
  
  setMaterialesComunes: (materiales: BOMComun[]) => set({ materialesComunes: materiales }),
  
  setMaterialesVariaciones: (materiales: BOMVariacion[]) => set({ materialesVariaciones: materiales }),
  
  setCategoriasConfiguradas: (categorias: CategoriaConfigurada[]) => set({ categoriasConfiguradas: categorias }),
  
  // Actualizar cantidades por talla para una categoría específica
  actualizarConsumoTalla: (categoriaId: number, consumoPorTalla: Record<string, number>) => 
    set((state) => ({
      categoriasConfiguradas: state.categoriasConfiguradas.map(cat =>
        cat.categoria.categoria_material_id === categoriaId
          ? { ...cat, consumoPorTalla }
          : cat
      )
    })),
  
  setIsLoadingComunes: (loading: boolean) => set({ isLoadingComunes: loading }),
  
  setIsLoadingVariaciones: (loading: boolean) => set({ isLoadingVariaciones: loading }),
  
  setError: (error: string | null) => set({ error }),
  
  reset: () => set(initialState),
})) 