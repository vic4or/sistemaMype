"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Zap, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface Material {
  id: number
  codigo: string
  nombre: string
  unidad: string
  categoria: string
}

interface MaterialBOM {
  id: string
  materialId: number
  material: Material
  cantidad: number
  variaPorTalla: boolean
  variaPorColor: boolean
}

interface Combinacion {
  id: string
  tallaId: number
  colorId: number
  tallaNombre: string
  colorNombre: string
  colorHex: string
}

interface BOMMatrizMaterialProps {
  material: MaterialBOM
  combinaciones: Combinacion[]
  valores: Record<string, number>
  onValorChange: (talla: string, color: string, valor: number) => void
  onEliminar: () => void
}

export default function BOMMatrizMaterial({
  material,
  combinaciones,
  valores,
  onValorChange,
  onEliminar,
}: BOMMatrizMaterialProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHerramientas, setShowHerramientas] = useState(false)

  // Estados para herramientas
  const [valorLlenarTodo, setValorLlenarTodo] = useState("")
  const [valorBase, setValorBase] = useState("")
  const [incremento, setIncremento] = useState("")
  const [filaSeleccionada, setFilaSeleccionada] = useState("")
  const [valorFila, setValorFila] = useState("")
  const [columnaSeleccionada, setColumnaSeleccionada] = useState("")
  const [valorColumna, setValorColumna] = useState("")

  // Obtener tallas y colores únicos
  const tallasUnicas = Array.from(new Set(combinaciones.map((c) => c.tallaNombre))).sort()
  const coloresUnicos = Array.from(new Set(combinaciones.map((c) => c.colorNombre))).map((colorNombre) => {
    const combinacion = combinaciones.find((c) => c.colorNombre === colorNombre)
    return {
      nombre: colorNombre,
      hex: combinacion?.colorHex || "#000000",
    }
  })

  // Obtener valor de una celda específica
  const getValor = (talla: string, color: string): number => {
    const key = `${talla}-${color}`
    return valores[key] || material.cantidad
  }

  // Contar celdas completadas
  const celdasCompletadas = Object.keys(valores).length
  const totalCeldas = tallasUnicas.length * coloresUnicos.length

  // Herramientas de llenado
  const handleLlenarTodo = () => {
    const valor = Number.parseFloat(valorLlenarTodo)
    if (isNaN(valor) || valor <= 0) {
      toast.error("Ingrese un valor válido")
      return
    }

    tallasUnicas.forEach((talla) => {
      coloresUnicos.forEach((color) => {
        onValorChange(talla, color.nombre, valor)
      })
    })

    setValorLlenarTodo("")
    toast.success("Matriz llenada completamente")
  }

  const handlePatronIncremental = () => {
    const base = Number.parseFloat(valorBase)
    const inc = Number.parseFloat(incremento)

    if (isNaN(base) || isNaN(inc) || base <= 0) {
      toast.error("Ingrese valores válidos para base e incremento")
      return
    }

    tallasUnicas.forEach((talla, index) => {
      const valorTalla = base + inc * index
      coloresUnicos.forEach((color) => {
        onValorChange(talla, color.nombre, valorTalla)
      })
    })

    setValorBase("")
    setIncremento("")
    toast.success("Patrón incremental aplicado")
  }

  const handleLlenarFila = () => {
    const valor = Number.parseFloat(valorFila)
    if (isNaN(valor) || valor <= 0 || !filaSeleccionada) {
      toast.error("Seleccione un color e ingrese un valor válido")
      return
    }

    tallasUnicas.forEach((talla) => {
      onValorChange(talla, filaSeleccionada, valor)
    })

    setValorFila("")
    toast.success(`Fila ${filaSeleccionada} llenada`)
  }

  const handleLlenarColumna = () => {
    const valor = Number.parseFloat(valorColumna)
    if (isNaN(valor) || valor <= 0 || !columnaSeleccionada) {
      toast.error("Seleccione una talla e ingrese un valor válido")
      return
    }

    coloresUnicos.forEach((color) => {
      onValorChange(columnaSeleccionada, color.nombre, valor)
    })

    setValorColumna("")
    toast.success(`Columna ${columnaSeleccionada} llenada`)
  }

  const handleLimpiarMatriz = () => {
    tallasUnicas.forEach((talla) => {
      coloresUnicos.forEach((color) => {
        onValorChange(talla, color.nombre, material.cantidad)
      })
    })
    toast.success("Matriz reiniciada con valor base")
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <CardTitle className="text-base">{material.material.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">{material.material.codigo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {celdasCompletadas}/{totalCeldas} celdas
                </Badge>
                <Badge variant="outline">{material.material.categoria}</Badge>
                <Badge variant="outline">
                  Base: {material.cantidad} {material.material.unidad}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Herramientas de llenado */}
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setShowHerramientas(!showHerramientas)}>
                <Zap className="mr-2 h-4 w-4" />
                {showHerramientas ? "Ocultar" : "Mostrar"} Herramientas
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLimpiarMatriz}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reiniciar
                </Button>
                <Button variant="destructive" size="sm" onClick={onEliminar}>
                  Eliminar Material
                </Button>
              </div>
            </div>

            {/* Panel de herramientas */}
            {showHerramientas && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">🔧 Herramientas de Llenado Rápido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Llenar todo */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">📋 Llenar Todo</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          value={valorLlenarTodo}
                          onChange={(e) => setValorLlenarTodo(e.target.value)}
                          className="text-xs"
                        />
                        <Button size="sm" onClick={handleLlenarTodo}>
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    {/* Patrón incremental */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">📈 Patrón por Talla</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Base"
                          value={valorBase}
                          onChange={(e) => setValorBase(e.target.value)}
                          className="text-xs"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="+Inc"
                          value={incremento}
                          onChange={(e) => setIncremento(e.target.value)}
                          className="text-xs"
                        />
                        <Button size="sm" onClick={handlePatronIncremental}>
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    {/* Llenar fila */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">🎨 Llenar por Color</Label>
                      <div className="flex gap-1">
                        <Select value={filaSeleccionada} onValueChange={setFilaSeleccionada}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {coloresUnicos.map((color) => (
                              <SelectItem key={color.nombre} value={color.nombre}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded border" style={{ backgroundColor: color.hex }} />
                                  {color.nombre}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          value={valorFila}
                          onChange={(e) => setValorFila(e.target.value)}
                          className="text-xs"
                        />
                        <Button size="sm" onClick={handleLlenarFila}>
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    {/* Llenar columna */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">📏 Llenar por Talla</Label>
                      <div className="flex gap-1">
                        <Select value={columnaSeleccionada} onValueChange={setColumnaSeleccionada}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Talla" />
                          </SelectTrigger>
                          <SelectContent>
                            {tallasUnicas.map((talla) => (
                              <SelectItem key={talla} value={talla}>
                                {talla}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          value={valorColumna}
                          onChange={(e) => setValorColumna(e.target.value)}
                          className="text-xs"
                        />
                        <Button size="sm" onClick={handleLlenarColumna}>
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Matriz de valores */}
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 bg-muted/50">Color / Talla</TableHead>
                    {tallasUnicas.map((talla) => (
                      <TableHead key={talla} className="text-center min-w-20 bg-muted/50">
                        <Badge variant="outline">{talla}</Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coloresUnicos.map((color) => (
                    <TableRow key={color.nombre}>
                      <TableCell className="bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.hex }} />
                          <Badge variant="outline" className="text-xs">
                            {color.nombre}
                          </Badge>
                        </div>
                      </TableCell>
                      {tallasUnicas.map((talla) => (
                        <TableCell key={`${talla}-${color.nombre}`} className="p-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={getValor(talla, color.nombre)}
                            onChange={(e) => onValorChange(talla, color.nombre, Number.parseFloat(e.target.value) || 0)}
                            className="w-full text-center text-sm h-8"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumen */}
            <div className="text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Unidad:</span> {material.material.unidad} •
                <span className="font-medium"> Valor base:</span> {material.cantidad} •
                <span className="font-medium"> Completado:</span> {celdasCompletadas}/{totalCeldas} celdas
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
