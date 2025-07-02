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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { Tizado, TizadoTalla, UpdateTizadoDto, UpdateTizadoTallaDto } from "@/types/tizado"
import type { Talla } from "@/types/api"
import { useToast } from "@/components/ui/use-toast"
import { tizadosApi } from "@/services/api/tizados"
import { tallasApi } from "@/services/api/configuracion"

interface EditarTizadoFormProps {
  open: boolean
  tizado: Tizado
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function EditarTizadoForm({ open, tizado, onOpenChange, onSuccess }: EditarTizadoFormProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<UpdateTizadoDto>({})
  const [loading, setLoading] = useState(false)

  const [initialTallas, setInitialTallas] = useState<TizadoTalla[]>([])
  const [currentTallas, setCurrentTallas] = useState<TizadoTalla[]>([])
  const [tallasDisponibles, setTallasDisponibles] = useState<Talla[]>([])
  const [nuevaTalla, setNuevaTalla] = useState<{ talla_id?: number, cant_prendas_tendida: number }>({ cant_prendas_tendida: 1 })

  useEffect(() => {
    if (open && tizado) {
      setFormData({
        ancho_tela_ref_metros: tizado.ancho_tela_ref_metros,
        longitud_tela_metros: tizado.longitud_tela_metros,
        descripcion_tizado: tizado.descripcion_tizado || "",
      })
      const tallasOriginales = tizado.ped_def_tizado_tallas ? JSON.parse(JSON.stringify(tizado.ped_def_tizado_tallas)) : []
      setInitialTallas(tallasOriginales)
      setCurrentTallas(tallasOriginales)
    }

    const cargarTallasDisponibles = async () => {
      try {
        const data = await tallasApi.getAll()
        setTallasDisponibles(data.filter(t => t.estado))
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar las tallas", variant: "destructive" })
      }
    }
    if(open) cargarTallasDisponibles()
  }, [open, tizado, toast])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleTallaQuantityChange = (id: number, cantidad: number) => {
    setCurrentTallas(prev => prev.map(t => t.def_tizado_talla_id === id ? { ...t, cant_prendas_tendida: cantidad } : t))
  }

  const handleTallaStatusChange = (id: number, status: boolean) => {
    setCurrentTallas(prev => prev.map(t => t.def_tizado_talla_id === id ? { ...t, estado: status } : t))
  }
  
  const handleAddTalla = () => {
    const tallaInfo = tallasDisponibles.find(t => t.talla_id === nuevaTalla.talla_id)
    if (!tallaInfo) {
      toast({ title: "Seleccione una talla válida", variant: "destructive" })
      return
    }
      const nuevaTallaCompleta: TizadoTalla = {
        def_tizado_talla_id: Date.now() * -1, // ID temporal negativo
        definicion_tizado_id: tizado.definicion_tizado_id,
        talla_id: tallaInfo.talla_id,
        cant_prendas_tendida: nuevaTalla.cant_prendas_tendida,
        estado: true,
        fecha_creacion: new Date().toISOString(),
        fecha_modificacion: new Date().toISOString(),
        cfg_tallas: {
          talla_id: tallaInfo.talla_id,
          valor_talla: tallaInfo.valor_talla || '',
          estado: tallaInfo.estado,
          fecha_creacion: tallaInfo.fecha_creacion || '',
          fecha_modificacion: tallaInfo.fecha_modificacion || '',
        }
      }
      setCurrentTallas(prev => [...prev, nuevaTallaCompleta])
      setNuevaTalla({ cant_prendas_tendida: 1 })
  }

  const handleRemoveNewTalla = (id: number) => {
    setCurrentTallas(prev => prev.filter(t => t.def_tizado_talla_id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await tizadosApi.update(tizado.definicion_tizado_id, formData)

      const tallasToAdd = currentTallas.filter(ct => ct.def_tizado_talla_id < 0)
      const tallasToUpdate = currentTallas.filter(ct => {
        const initial = initialTallas.find(it => it.def_tizado_talla_id === ct.def_tizado_talla_id)
        return initial && (initial.cant_prendas_tendida !== ct.cant_prendas_tendida || initial.estado !== ct.estado)
      })

      const addPromises = tallasToAdd.map(t => tizadosApi.addTalla(tizado.definicion_tizado_id, { talla_id: t.talla_id, cant_prendas_tendida: t.cant_prendas_tendida }))
      const updatePromises = tallasToUpdate.map(t => {
        const payload: UpdateTizadoTallaDto = {}
        const initial = initialTallas.find(it => it.def_tizado_talla_id === t.def_tizado_talla_id)
        if(initial?.cant_prendas_tendida !== t.cant_prendas_tendida) payload.cant_prendas_tendida = t.cant_prendas_tendida
        if(initial?.estado !== t.estado) payload.estado = t.estado
        return tizadosApi.updateTalla(tizado.definicion_tizado_id, t.def_tizado_talla_id, payload)
      })
      
      const results = await Promise.allSettled([...addPromises, ...updatePromises])
      
      const failedOps = results.filter(r => r.status === 'rejected')
      if (failedOps.length > 0) {
        toast({
          title: `Error en ${failedOps.length} operación(es) de tallas`,
          description: "La info principal se guardó. Algunas tallas no. Revisa la consola.",
          variant: "destructive",
        })
      } else {
        toast({ title: "Éxito", description: "Tizado y tallas actualizados." })
      }

      onSuccess?.()
      onOpenChange(false)

    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la información principal del tizado.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const tallasDisponiblesParaAgregar = tallasDisponibles.filter(
    tallaDisp => !currentTallas.some(t => t.talla_id === tallaDisp.talla_id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tizado #{tizado.definicion_tizado_id}</DialogTitle>
          <DialogDescription>Modifica la información general y gestiona el estado y cantidad de las tallas.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Información del Pedido</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span><p className="font-medium">{tizado.ped_pedidos_cliente?.cli_clientes?.nombre || "N/A"}</p></div>
              <div><span className="text-muted-foreground">Producto:</span><p className="font-medium">{tizado.ped_pedidos_cliente?.prd_productos?.nombre || "N/A"}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="ancho_tela_ref_metros">Ancho Tela (m)</Label><Input id="ancho_tela_ref_metros" name="ancho_tela_ref_metros" type="number" step="0.01" value={formData.ancho_tela_ref_metros || ''} onChange={handleFormChange} /></div>
            <div className="space-y-2"><Label htmlFor="longitud_tela_metros">Largo (m)</Label><Input id="longitud_tela_metros" name="longitud_tela_metros" type="number" step="0.01" value={formData.longitud_tela_metros || ''} onChange={handleFormChange} /></div>
          </div>
          
          <div className="space-y-2"><Label htmlFor="descripcion_tizado">Descripción</Label><Textarea id="descripcion_tizado" name="descripcion_tizado" value={formData.descripcion_tizado || ''} onChange={handleFormChange} rows={3} /></div>
          
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold">Tallas y Cantidades</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talla</TableHead><TableHead>Cantidad</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTallas.map((talla) => (
                      <TableRow key={talla.def_tizado_talla_id} className={!talla.estado ? 'opacity-50' : ''}>
                        <TableCell><Badge variant="outline">{talla.cfg_tallas?.valor_talla || "N/A"}</Badge></TableCell>
                        <TableCell><Input type="number" min="0" value={talla.cant_prendas_tendida} onChange={(e) => handleTallaQuantityChange(talla.def_tizado_talla_id, Number(e.target.value))} className="w-24" disabled={!talla.estado} /></TableCell>
                        <TableCell><Switch checked={talla.estado} onCheckedChange={(checked) => handleTallaStatusChange(talla.def_tizado_talla_id, checked)} /></TableCell>
                        <TableCell className="text-right">
                          {talla.def_tizado_talla_id < 0 && (
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveNewTalla(talla.def_tizado_talla_id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {currentTallas.length === 0 && (<TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No hay tallas asignadas</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {tallasDisponiblesParaAgregar.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold">Agregar Nueva Talla</h4>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="nueva-talla">Talla</Label>
                  <Select value={nuevaTalla.talla_id?.toString() || ''} onValueChange={(value) => setNuevaTalla(prev => ({ ...prev, talla_id: Number(value) }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar talla" /></SelectTrigger>
                    <SelectContent>{tallasDisponiblesParaAgregar.map((t) => (<SelectItem key={t.talla_id} value={t.talla_id.toString()}>{t.valor_talla}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="w-32"><Label htmlFor="nueva-cantidad">Cantidad</Label><Input id="nueva-cantidad" type="number" min="1" value={nuevaTalla.cant_prendas_tendida} onChange={(e) => setNuevaTalla(prev => ({ ...prev, cant_prendas_tendida: Number(e.target.value) }))} /></div>
                <Button type="button" onClick={handleAddTalla} disabled={!nuevaTalla.talla_id}><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
