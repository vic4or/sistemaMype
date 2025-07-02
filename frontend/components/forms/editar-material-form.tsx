"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Material, CategoriaMaterial, UnidadMedida, Color, Talla } from "@/types/api"
import { materialesApi } from "@/services/api/materiales"
import { categoriasMaterialApi, coloresApi, tallasApi, unidadesMedidaApi } from "@/services/api/configuracion"
import { useToast } from "@/hooks/use-toast"

interface EditarMaterialFormProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (material: Material) => void
}

export default function EditarMaterialForm({ material, open, onOpenChange, onUpdate }: EditarMaterialFormProps) {
  const [formData, setFormData] = useState({
    codigo_material: "",
    descripcion_material: "",
    categoria_material_id: 0,
    unidad_medida_id: 0,
    unidad_consumo_id: 0,
    stock_actual: 0,
    color_id: 0,
    talla_id: 0,
    ancho_tela_metros: 0,
    rendimiento_tela: 0,
    tipo_tejido_tela: "",
    factor_conversion_compra: 1,
  })

  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoriaMaterial | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar catálogos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadCatalogos()
    }
  }, [open])

  // Cargar datos del material cuando se abre el modal
  useEffect(() => {
    if (material && open) {
      setFormData({
        codigo_material: material.codigo_material || "",
        descripcion_material: material.descripcion_material || "",
        categoria_material_id: material.categoria_material_id || 0,
        unidad_medida_id: material.unidad_medida_id || 0,
        unidad_consumo_id: material.unidad_consumo_id || 0,
        stock_actual: material.stock_actual || 0,
        color_id: material.color_id || 0,
        talla_id: material.talla_id || 0,
        ancho_tela_metros: material.ancho_tela_metros || 0,
        rendimiento_tela: material.rendimiento_tela || 0,
        tipo_tejido_tela: material.tipo_tejido_tela || "",
        factor_conversion_compra: material.factor_conversion_compra || 1,
      })
      
      // Encontrar la categoría seleccionada
      const categoria = categorias.find(c => c.categoria_material_id === material.categoria_material_id)
      setSelectedCategory(categoria || null)
      setError(null)
    }
  }, [material, open, categorias])

  const loadCatalogos = async () => {
    try {
      const [categoriasData, unidadesData, coloresData, tallasData] = await Promise.all([
        categoriasMaterialApi.getAll(),
        unidadesMedidaApi.getAll(),
        coloresApi.getAll(),
        tallasApi.getAll()
      ])
      
      setCategorias(categoriasData.filter(c => c.estado))
      setUnidades(unidadesData.filter(u => u.estado))
      setColores(coloresData.filter(c => c.estado))
      setTallas(tallasData.filter(t => t.estado))
    } catch (error) {
      console.error("Error al cargar catálogos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los catálogos",
        variant: "destructive"
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericFields = ['stock_actual', 'ancho_tela_metros', 'rendimiento_tela', 'factor_conversion_compra']
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: numericFields.includes(name) ? (value ? parseFloat(value) : 0) : value 
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    const numericValue = parseInt(value)
    
    if (field === 'categoria_material_id') {
      const categoria = categorias.find(c => c.categoria_material_id === numericValue)
      setSelectedCategory(categoria || null)
    }
    
    setFormData((prev) => ({ ...prev, [field]: numericValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!material) return

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData = {
        codigo_material: formData.codigo_material,
        descripcion_material: formData.descripcion_material,
        categoria_material_id: formData.categoria_material_id,
        unidad_medida_id: formData.unidad_medida_id,
        unidad_consumo_id: formData.unidad_consumo_id,
        // Solo incluir factor de conversión si NO es tela
        ...(!isTela && { factor_conversion_compra: formData.factor_conversion_compra }),
        ...(selectedCategory?.tiene_color && formData.color_id && { color_id: formData.color_id }),
        ...(selectedCategory?.tiene_talla && formData.talla_id && { talla_id: formData.talla_id }),
        ...(isTela && {
          ancho_tela_metros: formData.ancho_tela_metros,
          rendimiento_tela: formData.rendimiento_tela,
          tipo_tejido_tela: formData.tipo_tejido_tela,
        }),
      }

      const updatedMaterial = await materialesApi.update(material.material_id, updateData)
      onUpdate(updatedMaterial)
      onOpenChange(false)
      
      toast({
        title: "Éxito",
        description: "Material actualizado correctamente"
      })
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "No se pudo actualizar el material",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setError(null)
  }

  if (!material) return null

  const isTela = selectedCategory?.nombre_categoria?.toLowerCase().includes("tela")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>
              Modifique la información del material. Los cambios se aplicarán inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo_material" className="text-right">
                Código
              </Label>
              <Input
                id="codigo_material"
                name="codigo_material"
                value={formData.codigo_material}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descripcion_material" className="text-right">
                Descripción
              </Label>
              <Input
                id="descripcion_material"
                name="descripcion_material"
                value={formData.descripcion_material}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoria" className="text-right">
                Categoría
              </Label>
              <Select
                value={formData.categoria_material_id.toString()}
                onValueChange={(value) => handleSelectChange("categoria_material_id", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.categoria_material_id} value={categoria.categoria_material_id.toString()}>
                      {categoria.nombre_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unidad_compra" className="text-right col-span-2">
                  Unidad Compra
                </Label>
                <Select
                  value={formData.unidad_medida_id.toString()}
                  onValueChange={(value) => handleSelectChange("unidad_medida_id", value)}
                  required
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidad) => (
                      <SelectItem key={unidad.unidad_medida_id} value={unidad.unidad_medida_id.toString()}>
                        {unidad.abreviatura}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unidad_consumo" className="text-right col-span-2">
                  Unidad Consumo
                </Label>
                <Select
                  value={formData.unidad_consumo_id.toString()}
                  onValueChange={(value) => handleSelectChange("unidad_consumo_id", value)}
                  required
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidad) => (
                      <SelectItem key={unidad.unidad_medida_id} value={unidad.unidad_medida_id.toString()}>
                        {unidad.abreviatura}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Factor de conversión solo para no-telas */}
            {!isTela && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="factor_conversion_compra" className="text-right">
                  Factor Conversión
                </Label>
                <Input
                  id="factor_conversion_compra"
                  name="factor_conversion_compra"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={formData.factor_conversion_compra}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
            )}

            {selectedCategory?.tiene_color && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Select
                  value={formData.color_id.toString()}
                  onValueChange={(value) => handleSelectChange("color_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colores.map((color) => (
                      <SelectItem key={color.color_id} value={color.color_id.toString()}>
                        {color.nombre_color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCategory?.tiene_talla && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="talla" className="text-right">
                  Talla
                </Label>
                <Select
                  value={formData.talla_id.toString()}
                  onValueChange={(value) => handleSelectChange("talla_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {tallas.map((talla) => (
                      <SelectItem key={talla.talla_id} value={talla.talla_id.toString()}>
                        {talla.valor_talla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isTela && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ancho_tela_metros" className="text-right">
                    Ancho (m)
                  </Label>
                  <Input
                    id="ancho_tela_metros"
                    name="ancho_tela_metros"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ancho_tela_metros}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rendimiento_tela" className="text-right">
                    Rendimiento
                  </Label>
                  <Input
                    id="rendimiento_tela"
                    name="rendimiento_tela"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rendimiento_tela}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo_tejido_tela" className="text-right">
                    Tipo Tejido
                  </Label>
                  <Select
                    value={formData.tipo_tejido_tela}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_tejido_tela: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar tipo de tejido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gamuza">Gamuza</SelectItem>
                      <SelectItem value="Jersey">Jersey</SelectItem>
                      <SelectItem value="Franela">Franela</SelectItem>
                      <SelectItem value="French Terry">French Terry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
