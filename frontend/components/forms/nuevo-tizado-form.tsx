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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Pedido } from "@/types/tizado"
import type { Cliente, Talla } from "@/types/api"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { clientesApi } from "@/services/api/clientes"
import { pedidosApi } from "@/services/api/pedidos"
import { configuracionApi } from "@/services/api/configuracion"
import { tizadosApi } from "@/services/api/tizados"

interface NuevoTizadoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NuevoTizadoForm({ open, onOpenChange, onSuccess }: NuevoTizadoFormProps) {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])

  const [openCliente, setOpenCliente] = useState(false)
  const [openPedido, setOpenPedido] = useState(false)
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<{ talla_id: number; cantidad: number }[]>([])
  const [selectedTalla, setSelectedTalla] = useState<string>("")

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ancho_tela: "",
    largo: "",
    observaciones: ""
  })

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, tallasData] = await Promise.all([
          clientesApi.getAll(),
          configuracionApi.getTallas()
        ])
        setClientes(clientesData)
        setTallas(tallasData.filter(t => t.estado))
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los datos iniciales.", variant: "destructive" })
      }
    }
    fetchData()
  }, [toast])

  // Cargar pedidos cuando cambia el cliente
  useEffect(() => {
    if (selectedCliente) {
      const fetchPedidos = async () => {
        try {
          const pedidosData = await pedidosApi.getPedidosPorCliente(selectedCliente.cliente_id)
          setPedidos(pedidosData)
        } catch (error) {
          toast({ title: "Error", description: `No se pudieron cargar los pedidos para ${selectedCliente.nombre}.`, variant: "destructive" })
        }
      }
      fetchPedidos()
    } else {
      setPedidos([])
    }
  }, [selectedCliente, toast])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setSelectedCliente(null)
    setSelectedPedido(null)
    setTallasSeleccionadas([])
    setFormData({ ancho_tela: "", largo: "", observaciones: "" })
    setSelectedTalla("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPedido || tallasSeleccionadas.length === 0) {
      toast({ title: "Datos incompletos", description: "Debe seleccionar un pedido y agregar al menos una talla.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await tizadosApi.create({
        pedido_cliente_id: selectedPedido.pedido_cliente_id,
        ancho_tela_ref_metros: formData.ancho_tela,
        longitud_tela_metros: formData.largo,
        descripcion_tizado: formData.observaciones,
        tallas: tallasSeleccionadas.map(t => ({
          talla_id: t.talla_id,
          cant_prendas_tendida: t.cantidad
        }))
      })
      toast({ title: "Éxito", description: "Tizado creado correctamente" })
      resetForm()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el tizado", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTalla = () => {
    if (!selectedTalla) return
    const tallaId = Number(selectedTalla)
    if (tallasSeleccionadas.some(t => t.talla_id === tallaId)) {
      toast({ title: "Error", description: "Esta talla ya ha sido agregada", variant: "destructive" })
      return
    }
    setTallasSeleccionadas(prev => [...prev, { talla_id: tallaId, cantidad: 1 }])
    setSelectedTalla("")
  }

  const handleRemoveTalla = (index: number) => {
    setTallasSeleccionadas(prev => prev.filter((_, i) => i !== index))
  }

  const handleTallaChange = (index: number, cantidad: number) => {
    setTallasSeleccionadas(prev => {
      const newTallas = [...prev]
      newTallas[index].cantidad = cantidad
      return newTallas
    })
  }

  const getTallaNombre = (tallaId: number) => {
    return tallas.find(t => t.talla_id === tallaId)?.valor_talla || "Desconocida"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nuevo Tizado</DialogTitle>
          <DialogDescription>Define un nuevo tizado para un pedido específico.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Popover open={openCliente} onOpenChange={setOpenCliente}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCliente}
                    className="w-full justify-between"
                  >
                    {selectedCliente ? selectedCliente.nombre : "Seleccionar cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                    <CommandGroup>
                      {clientes.map((cliente) => (
                        <CommandItem
                          key={cliente.cliente_id}
                          onSelect={() => {
                            setSelectedCliente(cliente)
                            setSelectedPedido(null) // Reset pedido on new client
                            setOpenCliente(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedCliente?.cliente_id === cliente.cliente_id ? "opacity-100" : "opacity-0")} />
                          {cliente.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Pedido</Label>
              <Popover open={openPedido} onOpenChange={setOpenPedido}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPedido}
                    className="w-full justify-between"
                    disabled={!selectedCliente}
                  >
                    {selectedPedido ? `Pedido #${selectedPedido.pedido_cliente_id} - ${selectedPedido.prd_productos?.nombre}` : "Seleccionar pedido..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar pedido..." />
                    <CommandEmpty>No se encontraron pedidos.</CommandEmpty>
                    <CommandGroup>
                      {pedidos.map((pedido) => (
                        <CommandItem
                          key={pedido.pedido_cliente_id}
                          onSelect={() => {
                            setSelectedPedido(pedido)
                            setOpenPedido(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedPedido?.pedido_cliente_id === pedido.pedido_cliente_id ? "opacity-100" : "opacity-0")} />
                          {`#${pedido.pedido_cliente_id} - ${pedido.prd_productos?.nombre}`}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ancho_tela">Ancho de Tela (m)</Label>
              <Input id="ancho_tela" name="ancho_tela" type="number" value={formData.ancho_tela} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="largo">Largo (m)</Label>
              <Input id="largo" name="largo" type="number" value={formData.largo} onChange={handleChange} required />
            </div>
          </div>
          
          <div>
            <Label>Tallas y Cantidades</Label>
            <div className="mt-2 p-4 border rounded-lg space-y-4">
              <div className="flex gap-2">
                <Select value={selectedTalla} onValueChange={setSelectedTalla}>
                  <SelectTrigger>
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
                <Button type="button" onClick={handleAddTalla}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talla</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tallasSeleccionadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          Aún no se han agregado tallas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tallasSeleccionadas.map((talla, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{getTallaNombre(talla.talla_id)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={talla.cantidad}
                              onChange={(e) => handleTallaChange(index, Number(e.target.value))}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTalla(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear Tizado"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
