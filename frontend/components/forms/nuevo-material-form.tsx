"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { materialesApi } from "@/services/api/materiales"
import { categoriasMaterialApi, coloresApi, tallasApi } from "@/services/api/configuracion"
import { CreateMaterialDto, CategoriaMaterial, Color, Talla } from "@/types/api"

// Schema dinámico basado en los requerimientos del backend
const createFormSchema = (categoria: CategoriaMaterial | null) => {
  const isTela = categoria?.nombre_categoria?.toLowerCase().includes("tela")
  
  return z.object({
    codigo_material: z.string().min(2, "El código debe tener al menos 2 caracteres."),
    descripcion_material: z.string().min(2, "La descripción debe tener al menos 2 caracteres."),
    categoria_material_id: z.number().min(1, "Debe seleccionar una categoría."),
    // Campos opcionales según categoría
    color_id: categoria?.tiene_color ? z.number().min(1, "El color es requerido para esta categoría.") : z.number().optional(),
    talla_id: categoria?.tiene_talla ? z.number().min(1, "La talla es requerida para esta categoría.") : z.number().optional(),
    // Campos específicos para tela (requeridos si es tela)
    ancho_tela_metros: isTela ? z.number().min(0.01, "El ancho debe ser mayor a 0.") : z.number().optional(),
    rendimiento_tela: isTela ? z.number().min(0.01, "El rendimiento debe ser mayor a 0.") : z.number().optional(),
    tipo_tejido_tela: isTela ? z.string().min(1, "El tipo de tejido es requerido.") : z.string().optional(),
  })
}

type FormData = z.infer<ReturnType<typeof createFormSchema>>

interface NuevoMaterialFormProps {
  onMaterialCreated?: () => void
}

export default function NuevoMaterialForm({ onMaterialCreated }: NuevoMaterialFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoriaMaterial | null>(null)
  const { toast } = useToast()

  const formSchema = createFormSchema(selectedCategory)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_material: "",
      descripcion_material: "",
      categoria_material_id: 0,
      color_id: undefined,
      talla_id: undefined,
      ancho_tela_metros: undefined,
      rendimiento_tela: undefined,
      tipo_tejido_tela: "",
    },
  })

  // Cargar datos de catálogos
  useEffect(() => {
    if (open) {
      loadCatalogos()
    }
  }, [open])

  // Actualizar validaciones cuando cambia la categoría
  useEffect(() => {
    if (selectedCategory) {
      // Reset campos opcionales cuando cambia categoría
      form.setValue("color_id", undefined)
      form.setValue("talla_id", undefined)
      form.setValue("ancho_tela_metros", undefined)
      form.setValue("rendimiento_tela", undefined)
      form.setValue("tipo_tejido_tela", "")
      
      // Forzar actualización del resolver con el nuevo schema
      const newSchema = createFormSchema(selectedCategory)
      form.clearErrors()
    }
  }, [selectedCategory, form])

  const loadCatalogos = async () => {
    try {
      const [categoriasData, coloresData, tallasData] = await Promise.all([
        categoriasMaterialApi.getAll(),
        coloresApi.getAll(),
        tallasApi.getAll()
      ])
      
      setCategorias(categoriasData.filter((c: CategoriaMaterial) => c.estado))
      setColores(coloresData.filter((c: Color) => c.estado))
      setTallas(tallasData.filter((t: Talla) => t.estado))
    } catch (error) {
      console.error("Error al cargar catálogos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los catálogos",
        variant: "destructive"
      })
    }
  }

  async function onSubmit(values: FormData) {
    setLoading(true)
    try {
      const isTela = selectedCategory?.nombre_categoria?.toLowerCase().includes("tela")
      
      const materialData: CreateMaterialDto = {
        codigo_material: values.codigo_material,
        descripcion_material: values.descripcion_material,
        categoria_material_id: values.categoria_material_id,
        ...(selectedCategory?.tiene_color && values.color_id && { color_id: values.color_id }),
        ...(selectedCategory?.tiene_talla && values.talla_id && { talla_id: values.talla_id }),
        ...(isTela && {
          ancho_tela_metros: values.ancho_tela_metros,
          rendimiento_tela: values.rendimiento_tela,
          tipo_tejido_tela: values.tipo_tejido_tela,
        }),
      }

      await materialesApi.create(materialData)
      
      toast({
        title: "Éxito",
        description: "Material creado correctamente"
      })
      
      handleClose()
      onMaterialCreated?.()
    } catch (error) {
      console.error("Error al crear material:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el material",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    form.reset()
    setSelectedCategory(null)
  }

  const handleCategoryChange = (categoryId: string) => {
    const categoria = categorias.find(c => c.categoria_material_id.toString() === categoryId)
    setSelectedCategory(categoria || null)
    form.setValue("categoria_material_id", parseInt(categoryId))
  }

  const isTela = selectedCategory?.nombre_categoria?.toLowerCase().includes("tela")
  const hasCaracteristicasEspecificas = selectedCategory && (
    selectedCategory.tiene_color || 
    selectedCategory.tiene_talla || 
    isTela
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Material</DialogTitle>
          <DialogDescription>
            Complete la información básica del material
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo_material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Material *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: MAT001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion_material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción del material" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categoría */}
            <FormField
              control={form.control}
              name="categoria_material_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select
                    onValueChange={handleCategoryChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.categoria_material_id} value={categoria.categoria_material_id.toString()}>
                          {categoria.nombre_categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Características específicas según categoría */}
            {hasCaracteristicasEspecificas && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Características Específicas</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Color */}
                  {selectedCategory?.tiene_color && (
                    <FormField
                      control={form.control}
                      name="color_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colores.map((color) => (
                                <SelectItem key={color.color_id} value={color.color_id.toString()}>
                                  {color.nombre_color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Talla */}
                  {selectedCategory?.tiene_talla && (
                    <FormField
                      control={form.control}
                      name="talla_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Talla *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar talla" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tallas.map((talla) => (
                                <SelectItem key={talla.talla_id} value={talla.talla_id.toString()}>
                                  {talla.valor_talla}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Características específicas de tela */}
                {isTela && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium mb-4">Características de Tela</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="ancho_tela_metros"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ancho (metros) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1.50"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rendimiento_tela"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rendimiento *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1.25"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tipo_tejido_tela"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Tejido *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo de tejido" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Gamuza">Gamuza</SelectItem>
                                <SelectItem value="Jersey">Jersey</SelectItem>
                                <SelectItem value="Franela">Franela</SelectItem>
                                <SelectItem value="French Terry">French Terry</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Material"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
