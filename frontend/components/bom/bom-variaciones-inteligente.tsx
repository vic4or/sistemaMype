"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Grid3X3, Target, Layers, Search, Zap, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Material {
  id: number
  codigo: string
  nombre: string
  unidad: string
  categoria: string
  stock: number
}

interface BOMBaseItem {
  id: string
  materialId: number
  material: Material
  cantidad: number
}

interface BOMVariacionEspecifica {
  id: string
  materialId: number
  material: Material
  tipoEspecifico: "color" | "talla"
  valorEspecifico: string // "Rojo" o "M"
  cantidadPorTalla: Record<string, number> // {"S": 1.2, "M": 1.5, "L": 1.8}
}

interface Combinacion {
  id: string
  tallaId: number
  colorId: number
  tallaNombre: string
  colorNombre: string
  colorHex: string
}

interface BOMVariacionesInteligenteProps {
  bomBase: BOMBaseItem[]
  bomVariaciones: any[]
  setBomVariaciones: (variaciones: any[]) => void
  materiales: Material[]
  producto: any
}

// Función para detectar si un material es específico
function detectarMaterialEspecifico(material: Material) {
  const nombre = material.nombre.toLowerCase()

  // Detectar específico por color
  const colores = ["rojo", "azul", "verde", "blanco", "negro", "rosa", "amarillo", "gris"]
  for (const color of colores) {
    if (nombre.includes(color)) {
      return {
        esEspecifico: true,
        tipo: "color" as const,
        valor: color.charAt(0).toUpperCase() + color.slice(1), // Capitalizar
      }
    }
  }

  // Detectar específico por talla - CORREGIDO para detectar "etiqueta talla S"
  const tallas = ["xs", "s", "m", "l", "xl", "xxl"]
  for (const talla of tallas) {
    // Buscar patrones como "talla s", "talla-s", "s" en el nombre
    if (
      nombre.includes(`talla ${talla}`) ||
      nombre.includes(`talla-${talla}`) ||
      nombre.includes(`talla${talla}`) ||
      // Buscar la talla como palabra independiente
      new RegExp(`\\b${talla}\\b`).test(nombre) ||
      // Para "etiqueta s", "etiqueta-s", etc.
      (nombre.includes("etiqueta") && nombre.includes(talla))
    ) {
      return {
        esEspecifico: true,
        tipo: "talla" as const,
        valor: talla.toUpperCase(),
      }
    }
  }

  return {
    esEspecifico: false,
    tipo: null,
    valor: null,
  }
}

export default function BOMVariacionesInteligente({
  bomBase,
  bomVariaciones,
  setBomVariaciones,
  materiales,
  producto,
}: BOMVariacionesInteligenteProps) {
  const [variacionesEspecificas, setVariacionesEspecificas] = useState<BOMVariacionEspecifica[]>([])
  const [ajustesComunes, setAjustesComunes] = useState<Record<number, Record<string, number>>>({})

  // Estados para agregar materiales específicos
  const [busquedaMaterial, setBusquedaMaterial] = useState("")
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)
  const [cantidadesPorTalla, setCantidadesPorTalla] = useState<Record<string, string>>({})
  const [materialesFiltrados, setMaterialesFiltrados] = useState<Material[]>([])

  // Filtrar materiales disponibles (que NO están en BOM Base)
  const materialesDisponibles = materiales.filter(
    (material) => !bomBase.find((base) => base.materialId === material.id),
  )

  // Filtrar materiales según búsqueda
  const handleBusquedaMaterial = (busqueda: string) => {
    setBusquedaMaterial(busqueda)
    if (busqueda.trim() === "") {
      setMaterialesFiltrados([])
    } else {
      const filtrados = materialesDisponibles.filter(
        (material) =>
          material.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          material.codigo.toLowerCase().includes(busqueda.toLowerCase()),
      )
      setMaterialesFiltrados(filtrados.slice(0, 5))
    }
  }

  // Seleccionar material específico
  const handleSeleccionarMaterialEspecifico = (material: Material) => {
    setMaterialSeleccionado(material)
    setBusquedaMaterial(material.nombre)
    setMaterialesFiltrados([])

    // Inicializar cantidades por talla
    const tallasUnicas = Array.from(new Set(producto.combinaciones.map((c: any) => c.tallaNombre))).sort()
    const nuevasCantidades: Record<string, string> = {}
    tallasUnicas.forEach((talla) => {
      nuevasCantidades[talla] = ""
    })
    setCantidadesPorTalla(nuevasCantidades)
  }

  // Actualizar cantidad por talla
  const handleCantidadTallaChange = (talla: string, valor: string) => {
    setCantidadesPorTalla((prev) => ({
      ...prev,
      [talla]: valor,
    }))
  }

  // Agregar material específico
  const handleAgregarMaterialEspecifico = () => {
    if (!materialSeleccionado) {
      toast.error("Seleccione un material")
      return
    }

    // Verificar que al menos una talla tenga cantidad
    const cantidadesValidas = Object.values(cantidadesPorTalla).some((cantidad) => cantidad !== "")
    if (!cantidadesValidas) {
      toast.error("Especifique al menos una cantidad para una talla")
      return
    }

    // Detectar si es específico
    const deteccion = detectarMaterialEspecifico(materialSeleccionado)

    if (!deteccion.esEspecifico) {
      toast.error("Este material no es específico. Agréguelo al BOM Base primero.")
      return
    }

    // Verificar si ya existe
    const existe = variacionesEspecificas.find(
      (v) => v.materialId === materialSeleccionado.id && v.valorEspecifico === deteccion.valor,
    )

    if (existe) {
      toast.error(`Ya existe una entrada para ${materialSeleccionado.nombre}`)
      return
    }

    // Convertir cantidades de string a number
    const cantidadesNumericas: Record<string, number> = {}
    Object.entries(cantidadesPorTalla).forEach(([talla, cantidad]) => {
      if (cantidad !== "") {
        cantidadesNumericas[talla] = Number.parseFloat(cantidad)
      }
    })

    const nuevaVariacionEspecifica: BOMVariacionEspecifica = {
      id: `esp-${Date.now()}`,
      materialId: materialSeleccionado.id,
      material: materialSeleccionado,
      tipoEspecifico: deteccion.tipo!,
      valorEspecifico: deteccion.valor!,
      cantidadPorTalla: cantidadesNumericas,
    }

    setVariacionesEspecificas((prev) => [...prev, nuevaVariacionEspecifica])
    setMaterialSeleccionado(null)
    setBusquedaMaterial("")
    setCantidadesPorTalla({})

    // Contar combinaciones afectadas
    const combinacionesAfectadas = producto.combinaciones.filter((c: any) => {
      if (deteccion.tipo === "color") {
        return c.colorNombre.toLowerCase().includes(deteccion.valor!.toLowerCase())
      } else {
        return c.tallaNombre === deteccion.valor
      }
    })

    toast.success(
      `Material específico agregado - Aplica a ${combinacionesAfectadas.length} combinaciones (${
        Object.keys(cantidadesNumericas).length
      } tallas)`,
    )
  }

  // Eliminar variación específica
  const handleEliminarVariacionEspecifica = (id: string) => {
    setVariacionesEspecificas((prev) => prev.filter((v) => v.id !== id))
    toast.success("Material específico eliminado")
  }

  // Actualizar ajuste para material común
  const handleAjusteComun = (materialId: number, talla: string, valor: string) => {
    const valorNumerico = valor === "" ? 0 : Number.parseFloat(valor)
    setAjustesComunes((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [talla]: valorNumerico,
      },
    }))
  }

  // Obtener tallas únicas
  const tallasUnicas = Array.from(new Set(producto.combinaciones.map((c: any) => c.tallaNombre))).sort()

  return (
    <div className="space-y-6">
      {/* Explicación del sistema */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Sistema Inteligente de BOM</h4>
              <div className="text-sm text-blue-800 mt-1 space-y-1">
                <p>
                  <strong>BOM Base:</strong> Materiales comunes que casi no varían (botones, cierres, etc.)
                </p>
                <p>
                  <strong>Materiales Específicos:</strong> Por color o talla (tela roja, etiqueta S, etc.)
                </p>
                <p>
                  <strong>Variación por Talla:</strong> Cada material específico puede tener cantidades diferentes por
                  talla
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materiales Comunes - Ajustes Simples */}
      {bomBase.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-green-600" />
              Materiales Comunes - Ajustes Simples
            </CardTitle>
            <CardDescription>
              Estos materiales están en el BOM Base. Aquí puede ajustar las cantidades por talla si es necesario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Cantidad Base</TableHead>
                    {tallasUnicas.map((talla) => (
                      <TableHead key={talla}>Ajuste Talla {talla}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomBase.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{material.material.nombre}</div>
                          <div className="text-xs text-muted-foreground">{material.material.codigo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {material.cantidad} {material.material.unidad}
                        </Badge>
                      </TableCell>
                      {tallasUnicas.map((talla) => (
                        <TableCell key={talla}>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="w-20"
                            value={ajustesComunes[material.materialId]?.[talla] || ""}
                            onChange={(e) => handleAjusteComun(material.materialId, talla, e.target.value)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Nota: Los ajustes son valores +/- sobre la cantidad base. Deje en blanco si no hay ajuste.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agregar Materiales Específicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Agregar Materiales Específicos
          </CardTitle>
          <CardDescription>
            Materiales que solo aplican a ciertas tallas o colores (tela roja, etiqueta S, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2 relative">
              <Label>Buscar Material Específico</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tela roja, etiqueta S..."
                  value={busquedaMaterial}
                  onChange={(e) => handleBusquedaMaterial(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Resultados de búsqueda */}
              {materialesFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {materialesFiltrados.map((material) => {
                    const deteccion = detectarMaterialEspecifico(material)
                    return (
                      <div
                        key={material.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSeleccionarMaterialEspecifico(material)}
                      >
                        <div className="font-medium">{material.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.codigo} • {material.categoria}
                          {deteccion.esEspecifico && (
                            <Badge variant="outline" className="ml-2">
                              {deteccion.tipo === "color" ? "🎨" : "📏"} {deteccion.valor}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Vista previa de detección */}
              {materialSeleccionado && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Vista Previa</h4>
                  {(() => {
                    const deteccion = detectarMaterialEspecifico(materialSeleccionado)
                    return (
                      <div className="text-sm text-blue-800">
                        <p>
                          <strong>Material:</strong> {materialSeleccionado.nombre}
                        </p>
                        {deteccion.esEspecifico ? (
                          <>
                            <p>
                              <strong>Tipo:</strong> Específico por {deteccion.tipo === "color" ? "Color" : "Talla"}
                            </p>
                            <p>
                              <strong>Aplica a:</strong> {deteccion.valor}
                            </p>
                            <p>
                              <strong>Combinaciones afectadas:</strong>{" "}
                              {
                                producto.combinaciones.filter((c: any) => {
                                  if (deteccion.tipo === "color") {
                                    return c.colorNombre.toLowerCase().includes(deteccion.valor!.toLowerCase())
                                  } else {
                                    return c.tallaNombre === deteccion.valor
                                  }
                                }).length
                              }
                            </p>
                          </>
                        ) : (
                          <p className="text-orange-700">
                            <strong>⚠️ No es específico:</strong> Agréguelo al BOM Base primero
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Cantidades por Talla</Label>
              {materialSeleccionado ? (
                <div className="space-y-3">
                  {tallasUnicas.map((talla) => (
                    <div key={talla} className="grid grid-cols-2 gap-2 items-center">
                      <Label>Talla {talla}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Cantidad para ${talla}`}
                        value={cantidadesPorTalla[talla] || ""}
                        onChange={(e) => handleCantidadTallaChange(talla, e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    className="w-full mt-2"
                    onClick={handleAgregarMaterialEspecifico}
                    disabled={!materialSeleccionado}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Material Específico
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">Seleccione un material primero</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiales Específicos */}
      {variacionesEspecificas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Materiales Específicos Configurados</CardTitle>
            <CardDescription>Cada material específico puede tener cantidades diferentes por talla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variacionesEspecificas.map((variacion) => (
                <Card key={variacion.id} className="bg-muted/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {variacion.tipoEspecifico === "color" ? (
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor: producto.combinaciones.find((c: any) =>
                                c.colorNombre.toLowerCase().includes(variacion.valorEspecifico.toLowerCase()),
                              )?.colorHex,
                            }}
                          />
                        ) : (
                          <Badge variant="outline">{variacion.valorEspecifico}</Badge>
                        )}
                        <CardTitle className="text-base">{variacion.material.nombre}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleEliminarVariacionEspecifica(variacion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {variacion.tipoEspecifico === "color"
                        ? `Específico para color ${variacion.valorEspecifico}`
                        : `Específico para talla ${variacion.valorEspecifico}`}{" "}
                      • {variacion.material.codigo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {tallasUnicas.map((talla) => (
                        <div
                          key={talla}
                          className={`p-2 border rounded-md ${
                            variacion.cantidadPorTalla[talla] ? "bg-green-50" : "bg-muted/30"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground">Talla {talla}</div>
                          <div className="font-medium">
                            {variacion.cantidadPorTalla[talla] ? (
                              <>
                                {variacion.cantidadPorTalla[talla]} {variacion.material.unidad}
                              </>
                            ) : (
                              <span className="text-muted-foreground">No aplica</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista Previa del BOM Completo */}
      {(bomBase.length > 0 || variacionesEspecificas.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange-600" />
              Vista Previa del BOM Completo
            </CardTitle>
            <CardDescription>Así quedará el BOM completo con materiales comunes y específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <p className="text-sm text-muted-foreground">
                  Esta vista previa muestra cómo se aplicarán los materiales a cada combinación
                </p>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Combinación</TableHead>
                      <TableHead>Materiales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {producto.combinaciones.map((combinacion: any) => {
                      // Materiales comunes para esta combinación
                      const materialesComunes = bomBase.map((baseItem) => {
                        const ajuste = ajustesComunes[baseItem.materialId]?.[combinacion.tallaNombre] || 0
                        const cantidadFinal = baseItem.cantidad + ajuste
                        return {
                          nombre: baseItem.material.nombre,
                          cantidad: cantidadFinal,
                          unidad: baseItem.material.unidad,
                          tipo: "común",
                        }
                      })

                      // Materiales específicos para esta combinación
                      const materialesEspecificos = variacionesEspecificas
                        .filter((variacion) => {
                          // Si es específico por color, verificar que coincida
                          if (variacion.tipoEspecifico === "color") {
                            return combinacion.colorNombre
                              .toLowerCase()
                              .includes(variacion.valorEspecifico.toLowerCase())
                          }
                          // Si es específico por talla, verificar que coincida
                          if (variacion.tipoEspecifico === "talla") {
                            return combinacion.tallaNombre === variacion.valorEspecifico
                          }
                          return false
                        })
                        .map((variacion) => {
                          // Obtener la cantidad para esta talla
                          const cantidad = variacion.cantidadPorTalla[combinacion.tallaNombre] || 0
                          if (cantidad === 0) return null

                          return {
                            nombre: variacion.material.nombre,
                            cantidad,
                            unidad: variacion.material.unidad,
                            tipo: variacion.tipoEspecifico === "color" ? "color" : "talla",
                          }
                        })
                        .filter(Boolean)

                      // Todos los materiales para esta combinación
                      const todosMateriales = [...materialesComunes, ...materialesEspecificos]

                      return (
                        <TableRow key={combinacion.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: combinacion.colorHex }}
                              />
                              <span>
                                {combinacion.tallaNombre}-{combinacion.colorNombre}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {todosMateriales.map((material, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      material.tipo === "común"
                                        ? "bg-green-50"
                                        : material.tipo === "color"
                                          ? "bg-red-50"
                                          : "bg-blue-50"
                                    }
                                  >
                                    {material.tipo === "común"
                                      ? "Común"
                                      : material.tipo === "color"
                                        ? "Color"
                                        : "Talla"}
                                  </Badge>
                                  <span>
                                    {material.nombre}: {material.cantidad} {material.unidad}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
