"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { productosApi } from "@/services/api/productos"
import { useToast } from "@/components/ui/use-toast"
import BOMPaso1MaterialesComunes from "@/components/bom/bom-paso1-materiales-comunes"
import BOMPaso2InsumosVariables from "@/components/bom/bom-paso2-insumos-variables"
import BOMPaso3ConsumoPorTalla from "@/components/bom/bom-paso3-consumo-por-talla"
import type { Product, ProductoTallaColor } from "@/types/product"
import { useBOMStore } from "@/stores/bom-store"
import { bomApi } from "@/services/api/bom"
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react"

type Paso = 1 | 2 | 3

interface EstadoPaso {
  numero: Paso
  titulo: string
  descripcion: string
  completado: boolean
}

export default function BOMPage() {
  const params = useParams()
  const { toast } = useToast()
  const [producto, setProducto] = useState<Product | null>(null)
  const [combinaciones, setCombinaciones] = useState<ProductoTallaColor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pasoActual, setPasoActual] = useState<Paso>(1)
  const [guardandoTodo, setGuardandoTodo] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(true)
  
  const { 
    setProductoId, 
    materialesComunes, 
    materialesVariaciones,
    categoriasConfiguradas,
    setMaterialesComunes,
    setMaterialesVariaciones,
    setCategoriasConfiguradas,
    reset 
  } = useBOMStore()

  // Definir estados de los pasos
  const pasos: EstadoPaso[] = [
    {
      numero: 1,
      titulo: "Materiales Comunes",
      descripcion: "Seleccione materiales base por categoría",
      completado: materialesComunes.length > 0
    },
    {
      numero: 2,
      titulo: "Insumos Variables", 
      descripcion: "Configure mapeo por color del producto",
      completado: categoriasConfiguradas.length > 0
    },
    {
      numero: 3,
      titulo: "Consumo por Talla",
      descripcion: "Defina cantidades por talla del producto",
      completado: false // Se podría implementar validación específica
    }
  ]

  // Reconstruir categorías configuradas de forma simplificada
  const reconstruirCategoriasSimple = async (variacionesExistentes: any[], combinacionesProducto: ProductoTallaColor[]) => {
    try {
      console.log('🔧 [ReconstruirSimple] Iniciando con', variacionesExistentes.length, 'variaciones')
      
      if (variacionesExistentes.length === 0) {
        console.log('🔧 [ReconstruirSimple] No hay variaciones para procesar')
        return
      }

      // Importar APIs necesarias
      const { categoriasMaterialApi } = await import('@/services/api/configuracion')
      const { materialesApi } = await import('@/services/api/materiales')
      
      // Cargar todas las categorías y materiales
      const [todasCategorias, todosMateriales] = await Promise.all([
        categoriasMaterialApi.getAll(),
        materialesApi.getAll()
      ])
      
      console.log('🔧 [ReconstruirSimple] Datos cargados - categorías:', todasCategorias.length, 'materiales:', todosMateriales.length)
      
      // Agrupar variaciones por categoría
      const variacionesPorCategoria = new Map<number, any[]>()
      
      for (const variacion of variacionesExistentes) {
        const material = todosMateriales.find(m => m.material_id === variacion.material_id)
        if (material?.categoria_material_id) {
          const categoriaId = material.categoria_material_id
          if (!variacionesPorCategoria.has(categoriaId)) {
            variacionesPorCategoria.set(categoriaId, [])
          }
          variacionesPorCategoria.get(categoriaId)?.push({
            ...variacion,
            material: material
          })
        }
      }
      
      console.log('🔧 [ReconstruirSimple] Agrupadas en', variacionesPorCategoria.size, 'categorías')
      
      // Reconstruir categorías configuradas
      const categoriasReconstruidas: any[] = []
      
      for (const [categoriaId, variacionesCategoria] of variacionesPorCategoria) {
        const categoria = todasCategorias.find(c => c.categoria_material_id === categoriaId)
        if (!categoria) continue
        
        console.log(`🔧 [ReconstruirSimple] Procesando categoría: ${categoria.nombre_categoria}`)
        
        // Reconstruir mapeo por colores
        const mapeoColores: Record<string, any> = {}
        const consumoPorTalla: Record<string, number> = {}
        
        for (const variacion of variacionesCategoria) {
          const combinacion = combinacionesProducto.find(c => 
            c.producto_tal_col_id === variacion.producto_tal_col_id
          )
          
          if (combinacion) {
            const colorNombre = combinacion.cfg_colores?.nombre_color
            const tallaNombre = combinacion.cfg_tallas?.valor_talla
            
            if (colorNombre && !mapeoColores[colorNombre]) {
              mapeoColores[colorNombre] = variacion.material
            }
            
            if (tallaNombre && !consumoPorTalla[tallaNombre]) {
              consumoPorTalla[tallaNombre] = parseFloat(variacion.cantidad_consumo_especifica) || 0
            }
          }
        }
        
        // Solo añadir si tiene datos válidos
        if (Object.keys(mapeoColores).length > 0) {
          const categoriaConfigurada = {
            categoria,
            esMaterialComun: false,
            esVariable: true,
            materialesAsignados: Object.values(mapeoColores).map((m: any) => m.material_id),
            mapeoColores,
            consumoPorTalla
          }
          
          categoriasReconstruidas.push(categoriaConfigurada)
          console.log(`✅ [ReconstruirSimple] ${categoria.nombre_categoria}: ${Object.keys(mapeoColores).length} colores, ${Object.keys(consumoPorTalla).length} tallas`)
        }
      }
      
      // Actualizar store
      if (categoriasReconstruidas.length > 0) {
        setCategoriasConfiguradas(categoriasReconstruidas)
        console.log(`✅ [ReconstruirSimple] ${categoriasReconstruidas.length} categorías cargadas`)
        
        toast({
          title: "Categorías Cargadas",
          description: `Se reconstruyeron ${categoriasReconstruidas.length} categorías desde los datos existentes.`
        })
      }
      
    } catch (error) {
      console.error('❌ [ReconstruirSimple] Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron reconstruir las categorías."
      })
    }
  }

  useEffect(() => {
    const cargarDatos = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const productoId = parseInt(params.id as string)
        
        // Cargar producto
        const productoData = await productosApi.getById(productoId)
        setProducto(productoData)
        
        // Cargar combinaciones
        const combinacionesData = await productosApi.getCombinaciones(productoId)
        setCombinaciones(combinacionesData)
        
        // Inicializar store
        setProductoId(productoId)
        
        // Intentar cargar datos existentes del BOM
        try {
          console.log('📋 [BOM] Intentando cargar datos existentes...')
          
          // Cargar materiales comunes existentes
          const materialesComunesExistentes = await bomApi.obtenerMaterialesComunes(productoId)
          console.log(`📋 [BOM] Materiales comunes encontrados: ${materialesComunesExistentes.length}`)
          
          // Cargar materiales por variación existentes
          const materialesVariacionesExistentes = await bomApi.obtenerMaterialesVariacion(productoId)
          console.log(`📋 [BOM] Materiales por variación encontrados: ${materialesVariacionesExistentes.length}`)
          
          if (materialesComunesExistentes.length > 0 || materialesVariacionesExistentes.length > 0) {
            setIsEditMode(true)
            console.log('✅ [BOM] Modo EDICIÓN activado - BOM existente encontrado')
            
            // Cargar materiales comunes al store
            if (materialesComunesExistentes.length > 0) {
              setMaterialesComunes(materialesComunesExistentes)
              console.log('✅ [BOM] Materiales comunes cargados en el store')
            }
            
            // Cargar materiales por variación al store
                          if (materialesVariacionesExistentes.length > 0) {
                setMaterialesVariaciones(materialesVariacionesExistentes)
                console.log('✅ [BOM] Materiales por variación cargados en el store')
                
                // Reconstruir categorías configuradas para los pasos 2 y 3
                console.log('🔧 [BOM] Iniciando reconstrucción de categorías...')
                await reconstruirCategoriasSimple(materialesVariacionesExistentes, combinacionesData)
              }
              
              toast({
                title: "BOM Existente Cargado",
                description: `Se cargó el BOM existente con ${materialesComunesExistentes.length} materiales comunes y ${materialesVariacionesExistentes.length} variaciones.`
              })
          } else {
            setIsEditMode(false)
            console.log('📋 [BOM] Modo CREACIÓN activado - No hay BOM existente')
            // Limpiar categorías configuradas para modo creación
            setCategoriasConfiguradas([])
          }
          
        } catch (errorExistentes) {
          // Si no hay datos existentes, esto es normal para un BOM nuevo
          console.log('📋 [BOM] No hay datos existentes (BOM nuevo) - esto es normal')
          setIsEditMode(false)
          setCategoriasConfiguradas([])
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del producto. Por favor, intente de nuevo."
        })
      } finally {
        setIsLoading(false)
        setIsLoadingExistingData(false)
      }
    }

    cargarDatos()
    
    // Limpiar store al montar el componente
    return () => {
      reset()
    }
  }, [params.id, toast, setProductoId, reset])

  // Navegar al siguiente paso
  const siguientePaso = () => {
    if (pasoActual < 3) {
      setPasoActual((prev) => (prev + 1) as Paso)
    }
  }

  // Navegar al paso anterior
  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual((prev) => (prev - 1) as Paso)
    }
  }

  // Finalizar y guardar todo el BOM usando las APIs
  const finalizarBOM = async () => {
    try {
      setGuardandoTodo(true)
      
      let materialesComunesGuardados = 0
      let materialesVariablesGuardados = 0

      // 1. GUARDAR MATERIALES COMUNES (si hay)
      if (materialesComunes.length > 0) {
        console.log("🔧 Guardando materiales comunes...")
        
        const dtoComunes: import('@/types/bom').CrearBOMComunDto = {
          usuario: "Usuario", // TODO: Obtener del contexto de auth
          items: materialesComunes.map(material => {
            const unidadConsumo = (material as any).unidad_consumo_id || material.unidad_medida_id
            console.log(`🔧 [Material Común] ${(material as any).mat_materiales?.descripcion_material}: unidad_consumo_id=${(material as any).unidad_consumo_id}, unidad_medida_id=${material.unidad_medida_id}, usando=${unidadConsumo}`)
            return {
              producto_id: material.producto_id,
              material_id: material.material_id,
              unidad_medida_id: unidadConsumo,
              cantidad_consumo_base: material.cantidad_consumo_base
            }
          })
        }

        console.log("📤 [JSON MATERIALES COMUNES] Payload que se envía al backend:")
        console.log(JSON.stringify(dtoComunes, null, 2))

        await bomApi.guardarMaterialesComunes(dtoComunes)
        materialesComunesGuardados = materialesComunes.length
        console.log(`✅ ${materialesComunesGuardados} materiales comunes guardados`)
      }

      // 2. GUARDAR MATERIALES VARIABLES (si hay)
      const itemsVariables: import('@/types/bom').CrearBOMVariacionDto['items'] = []

      console.log("🔧 [FinalizarBOM] === INICIO PROCESAMIENTO MATERIALES VARIABLES ===")
      console.log("🔧 [FinalizarBOM] Categorías configuradas del store:", categoriasConfiguradas)
      console.log("🔧 [FinalizarBOM] Total combinaciones disponibles:", combinaciones.length)
      console.log("🔧 [FinalizarBOM] Combinaciones (primeras 3):", combinaciones.slice(0, 3).map(c => ({
        id: c.producto_tal_col_id,
        talla: c.cfg_tallas?.valor_talla,
        color: c.cfg_colores?.nombre_color
      })))

      // PASO 2A: Construir items usando el mapeo del Paso 2 + cantidades del Paso 3
      console.log("🔧 [FinalizarBOM] === PROCESANDO CATEGORÍAS CONFIGURADAS ===")
      for (const categoriaConfig of categoriasConfiguradas) {
        console.log(`🔧 [FinalizarBOM] Procesando categoría: ${categoriaConfig.categoria.nombre_categoria}`)
        console.log(`🔧 [FinalizarBOM] Mapeo colores:`, categoriaConfig.mapeoColores)
        console.log(`🔧 [FinalizarBOM] Consumo por talla:`, categoriaConfig.consumoPorTalla)
        
        if (!categoriaConfig.mapeoColores || !categoriaConfig.consumoPorTalla) {
          console.log(`⚠️ [FinalizarBOM] Saltando categoría ${categoriaConfig.categoria.nombre_categoria} - faltan datos`)
          continue
        }

        // Para cada color asignado en el Paso 2
        for (const [colorNombre, materialEspecifico] of Object.entries(categoriaConfig.mapeoColores)) {
          if (!materialEspecifico) continue

          // Para cada talla con cantidad del Paso 3
          for (const [talla, cantidadConsumo] of Object.entries(categoriaConfig.consumoPorTalla)) {
            console.log(`🔧 [FinalizarBOM] Procesando ${colorNombre} - ${talla}: cantidad ${cantidadConsumo}`)
            
            if (!cantidadConsumo || cantidadConsumo <= 0) {
              console.log(`⚠️ [FinalizarBOM] Saltando ${colorNombre} - ${talla} - cantidad inválida: ${cantidadConsumo}`)
              continue
            }

            // Buscar la combinación específica (producto_tal_col_id)
            const combinacion = combinaciones.find(c => 
              c.cfg_colores?.nombre_color === colorNombre && 
              c.cfg_tallas?.valor_talla === talla
            )

            if (!combinacion) {
              console.warn(`⚠️ No se encontró combinación para color ${colorNombre} y talla ${talla}`)
              continue
            }

            const unidadConsumo = (materialEspecifico as any).unidad_consumo_id || (materialEspecifico as any).unidad_medida_id
            console.log(`🔧 [Material Variable] ${(materialEspecifico as any).descripcion_material}: unidad_consumo_id=${(materialEspecifico as any).unidad_consumo_id}, unidad_medida_id=${(materialEspecifico as any).unidad_medida_id}, usando=${unidadConsumo}`)
            
            const itemVariable = {
              producto_tal_col_id: combinacion.producto_tal_col_id,
              material_id: (materialEspecifico as any).material_id,
              unidad_medida_id: unidadConsumo,
              cantidad_consumo_especifica: cantidadConsumo
            }
            
            console.log(`✅ [FinalizarBOM] Agregando item variable desde categorías:`, itemVariable)
            itemsVariables.push(itemVariable)
          }
        }
      }

      // PASO 2B: Añadir materiales adicionales (como etiquetas de talla)
      console.log("🔧 [FinalizarBOM] === PROCESANDO MATERIALES ADICIONALES (ETIQUETAS) ===")
      console.log("🔧 [FinalizarBOM] Materiales en variaciones del store:", materialesVariaciones.length)
      
      for (const materialVariacion of materialesVariaciones) {
        console.log(`🏷️ [FinalizarBOM] Evaluando material adicional: ${materialVariacion.mat_materiales?.descripcion_material}`)
        console.log(`🏷️ [FinalizarBOM] - producto_tal_col_id: ${materialVariacion.producto_tal_col_id}`)
        console.log(`🏷️ [FinalizarBOM] - material_id: ${materialVariacion.material_id}`)
        console.log(`🏷️ [FinalizarBOM] - cantidad: ${materialVariacion.cantidad_consumo_especifica}`)
        
        // Verificar que no esté ya incluido en los items de categorías
        const yaExiste = itemsVariables.find(item => 
          item.producto_tal_col_id === materialVariacion.producto_tal_col_id &&
          item.material_id === materialVariacion.material_id
        )

                 if (!yaExiste) {
           // Para etiquetas/materiales adicionales, usar la misma lógica que otros materiales
           // El materialVariacion ya debería tener la unidad_medida_id correcta del Paso 3
           const unidadConsumo = materialVariacion.unidad_medida_id
           
           console.log(`🏷️ [FinalizarBOM] Etiqueta ${materialVariacion.mat_materiales?.descripcion_material}: usando unidad_medida_id=${unidadConsumo} (ya calculada en Paso 3)`)
           
           const itemEtiqueta = {
             producto_tal_col_id: materialVariacion.producto_tal_col_id,
             material_id: materialVariacion.material_id,
             unidad_medida_id: unidadConsumo,
             cantidad_consumo_especifica: materialVariacion.cantidad_consumo_especifica
           }
           
           console.log(`✅ [FinalizarBOM] Agregando etiqueta/material adicional:`, itemEtiqueta)
           itemsVariables.push(itemEtiqueta)
         } else {
           console.log(`⚠️ [FinalizarBOM] Material ya existe, omitiendo: ${materialVariacion.mat_materiales?.descripcion_material}`)
         }
      }

      console.log(`🔧 [FinalizarBOM] === RESUMEN ITEMS VARIABLES ===`)
      console.log(`🔧 [FinalizarBOM] Total items a enviar: ${itemsVariables.length}`)
      console.log(`🔧 [FinalizarBOM] Items de categorías configuradas: ${itemsVariables.length - materialesVariaciones.length}`)
      console.log(`🔧 [FinalizarBOM] Items de etiquetas/adicionales: ${materialesVariaciones.filter((mv: any) => !itemsVariables.slice(0, itemsVariables.length - materialesVariaciones.length).find(iv => iv.producto_tal_col_id === mv.producto_tal_col_id && iv.material_id === mv.material_id)).length}`)

      if (itemsVariables.length > 0) {
        console.log("🎨 Guardando materiales variables...")
        
        const dtoVariables: import('@/types/bom').CrearBOMVariacionDto = {
          usuario: "Usuario", // TODO: Obtener del contexto de auth
          items: itemsVariables
        }

        console.log("📤 [JSON MATERIALES VARIABLES] Payload que se envía al backend:")
        console.log(JSON.stringify(dtoVariables, null, 2))
        console.log(`📊 [RESUMEN VARIABLES] Total items: ${itemsVariables.length}`)
        
        // Log de resumen por categoría y tipo
        const resumenPorCategoria = itemsVariables.reduce((acc, item) => {
          const key = `Material ${item.material_id}`
          if (!acc[key]) acc[key] = 0
          acc[key]++
          return acc
        }, {} as Record<string, number>)
        console.log("📊 [RESUMEN POR MATERIAL]:", resumenPorCategoria)
        
        // Mostrar detalle de etiquetas incluidas
        const etiquetasEnItems = itemsVariables.filter(item => 
          materialesVariaciones.find(mv => 
            mv.producto_tal_col_id === item.producto_tal_col_id && 
            mv.material_id === item.material_id
          )
        )
        console.log(`🏷️ [ETIQUETAS INCLUIDAS] ${etiquetasEnItems.length} etiqueta(s) de talla en el payload final:`)
        etiquetasEnItems.forEach(etiqueta => {
          const comb = combinaciones.find(c => c.producto_tal_col_id === etiqueta.producto_tal_col_id)
          const materialInfo = materialesVariaciones.find(mv => 
            mv.producto_tal_col_id === etiqueta.producto_tal_col_id && 
            mv.material_id === etiqueta.material_id
          )
          console.log(`  - ${materialInfo?.mat_materiales?.descripcion_material || `Material ${etiqueta.material_id}`} para ${comb?.cfg_tallas?.valor_talla || 'N/A'}-${comb?.cfg_colores?.nombre_color || 'N/A'}`)
        })

        await bomApi.guardarMaterialesVariacion(dtoVariables)
        materialesVariablesGuardados = itemsVariables.length
        console.log(`✅ ${materialesVariablesGuardados} materiales variables guardados`)
      }

      // 3. MOSTRAR RESULTADO
      console.log("🎉 === BOM FINALIZADO EXITOSAMENTE ===")
      console.log(`📊 Materiales comunes enviados: ${materialesComunesGuardados}`)
      console.log(`📊 Materiales variables enviados: ${materialesVariablesGuardados}`)
      console.log(`📊 Total items enviados al backend: ${materialesComunesGuardados + materialesVariablesGuardados}`)
      console.log("🌐 Endpoints utilizados:")
      if (materialesComunesGuardados > 0) {
        console.log("  - POST /bom/comunes (materiales comunes)")
      }
      if (materialesVariablesGuardados > 0) {
        console.log("  - POST /bom/variaciones (materiales variables)")
      }
      console.log("🎉 =======================================")
      
      // Mostrar estructura final enviada
      console.log("📋 [RESUMEN FINAL] Estructura de datos enviada al backend:")
      console.log({
        materialesComunes: {
          cantidad: materialesComunesGuardados,
          endpoint: "/bom/comunes"
        },
        materialesVariables: {
          cantidad: materialesVariablesGuardados,
          endpoint: "/bom/variaciones"
        },
        totalEnviado: materialesComunesGuardados + materialesVariablesGuardados
      })

      toast({
        title: "🎉 BOM Finalizado",
        description: `Se guardaron ${materialesComunesGuardados} materiales comunes y ${materialesVariablesGuardados} materiales variables. Redirigiendo...`
      })

      // 4. REGRESAR AL LISTADO PRINCIPAL
      setTimeout(() => {
        window.location.href = '/bom'
      }, 2000) // Esperar 2 segundos para que el usuario vea el mensaje
      
    } catch (error) {
      console.error('❌ Error al finalizar BOM:', error)
      toast({
        variant: "destructive",
        title: "Error al Finalizar BOM",
        description: "No se pudo guardar el BOM. Verifique los datos e intente de nuevo."
      })
    } finally {
      setGuardandoTodo(false)
    }
  }

  // Preparar estructura completa de datos para el backend
  const prepararDatosParaBackend = () => {
    const productoId = parseInt(params.id as string)
    
    // 1. Resumen general
    const resumen = {
      productoId: productoId,
      productoNombre: producto?.nombre,
      productoCodigo: producto?.codigo,
      totalCombinaciones: combinaciones.length,
      totalMaterialesComunes: materialesComunes.length,
      totalCategoriasVariables: categoriasConfiguradas.length,
      totalMateriales: materialesComunes.length + categoriasConfiguradas.reduce((acc, cat) => acc + cat.materialesAsignados.length, 0),
      fechaCreacion: new Date().toISOString()
    }

    // 2. Materiales Comunes (Paso 1)
    const materialesComunesEstructurados = materialesComunes.map(material => ({
      materialId: material.material_id,
      unidadMedidaId: material.unidad_medida_id,
      cantidadConsumoBase: material.cantidad_consumo_base,
      tipoMaterial: "comun",
      aplicaATodas: true,
      detalles: {
        codigoMaterial: material.mat_materiales?.codigo_material,
        descripcionMaterial: material.mat_materiales?.descripcion_material,
        unidadMedida: material.cfg_unidades_medida?.abreviatura
      }
    }))

    // 3. Categorías Variables (Paso 2)
    const categoriasVariablesEstructuradas = categoriasConfiguradas.map(categoria => ({
      categoriaId: categoria.categoria.categoria_material_id,
      categoriaNombre: categoria.categoria.nombre_categoria,
      tieneColor: categoria.categoria.tiene_color,
      tieneTalla: categoria.categoria.tiene_talla,
      materialesAsignados: categoria.materialesAsignados,
      mapeoColores: categoria.mapeoColores ? Object.entries(categoria.mapeoColores).map(([color, material]: [string, any]) => ({
        colorNombre: color,
        materialId: material.material_id,
        materialCodigo: material.codigo_material,
        materialDescripcion: material.descripcion_material,
        unidadMedidaId: material.unidad_medida_id
      })) : []
    }))

    // 4. Cantidades por Talla (Paso 3) - Datos reales del store
    const cantidadesPorTalla = categoriasConfiguradas.map(categoria => ({
      categoriaId: categoria.categoria.categoria_material_id,
      categoriaNombre: categoria.categoria.nombre_categoria,
      consumoPorTalla: categoria.consumoPorTalla || {},
      totalCantidades: Object.keys(categoria.consumoPorTalla || {}).length
    }))

    // 5. Payload para las APIs del backend
    const payloadApi = {
      // Para materiales comunes
      materialesComunes: {
        endpoint: "/api/bom/materiales-comunes",
        method: "POST",
        body: {
          productoId: productoId,
          usuario: "Usuario",
          materiales: materialesComunesEstructurados.map(m => ({
            material_id: m.materialId,
            unidad_medida_id: m.unidadMedidaId,
            cantidad_consumo_base: m.cantidadConsumoBase
          }))
        }
      },

      // Para materiales variables
      materialesVariables: {
        endpoint: "/api/bom/materiales-variables",
        method: "POST", 
        body: {
          usuario: "Usuario",
          items: [] as Array<{
            producto_tal_col_id: number
            material_id: number
            unidad_medida_id: number
            cantidad_consumo_especifica: number
          }>
        }
      },

      // Para debug solamente
      debug: {
        cantidadesPorTalla: cantidadesPorTalla,
        totalCategoriasConCantidades: cantidadesPorTalla.filter(c => c.totalCantidades > 0).length
      }
    }

    // NOTA: La generación de items se maneja en el Paso 3, no aquí
    // Este es solo un resumen para debug, no se usa para enviar al backend

    return {
      resumen,
      materialesComunes: materialesComunesEstructurados,
      categoriasVariables: categoriasVariablesEstructuradas,
      cantidadesPorTalla: cantidadesPorTalla,
      payloadApi
    }
  }

  // Validar si se puede avanzar al siguiente paso
  const puedeAvanzar = () => {
    switch (pasoActual) {
      case 1:
        return materialesComunes.length > 0
      case 2:
        return true // Paso 2 es opcional
      case 3:
        return true
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando datos del producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontró el producto
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lista de Materiales (BOM)</h1>
        <p className="text-muted-foreground">
          Define los materiales y cantidades necesarias para la fabricación del producto
        </p>
      </div>

      {/* Header del producto */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {producto.nombre}
                {isLoadingExistingData ? (
                  <Badge variant="outline" className="animate-pulse">Detectando...</Badge>
                ) : isEditMode ? (
                  <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                    ✏️ Editando BOM
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    ➕ Creando BOM
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Código: {producto.codigo} | {combinaciones.length} combinaciones de talla y color
              </CardDescription>
            </div>
            
            {isEditMode && (
              <div className="text-right">
                <div className="text-sm font-medium text-orange-800">Datos existentes cargados</div>
                <div className="text-xs text-muted-foreground">
                  {materialesComunes.length} comunes • {materialesVariaciones.length} variaciones
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Indicador de progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del BOM</CardTitle>
          <CardDescription>Paso {pasoActual} de 3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {pasos.map((paso, index) => (
              <div key={paso.numero} className="flex items-center">
                {/* Círculo del paso */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      paso.numero === pasoActual
                        ? "bg-blue-600 border-blue-600 text-white"
                        : paso.completado
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {paso.completado ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{paso.numero}</span>
                    )}
                  </div>
                  
                  {/* Información del paso */}
                  <div className="mt-2 text-center max-w-[200px]">
                    <div className="font-medium text-sm">{paso.titulo}</div>
                    <div className="text-xs text-muted-foreground">{paso.descripcion}</div>
                    {paso.completado && (
                      <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                        ✓ Completado
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Línea conectora */}
                {index < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pasos[index + 1].completado || pasos[index + 1].numero <= pasoActual
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido del paso actual */}
      <Card>
        <CardContent className="pt-6">
          {pasoActual === 1 && <BOMPaso1MaterialesComunes />}
          {pasoActual === 2 && <BOMPaso2InsumosVariables />}
          {pasoActual === 3 && <BOMPaso3ConsumoPorTalla />}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={pasoAnterior}
          disabled={pasoActual === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Paso {pasoActual} de {pasos.length}
          </div>
        </div>

        {pasoActual < 3 ? (
          <Button
            onClick={siguientePaso}
            disabled={!puedeAvanzar()}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={finalizarBOM}
            disabled={guardandoTodo}
            className={`flex items-center gap-2 ${
              isEditMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {guardandoTodo ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {isEditMode ? "Actualizando BOM..." : "Guardando BOM..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? "Actualizar BOM" : "Finalizar BOM"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
} 