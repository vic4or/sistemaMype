"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Tizado } from "@/types/tizado"

interface VerTizadoFormProps {
  tizado: Tizado
  onOpenChange: (open: boolean) => void
}

export default function VerTizadoForm({ tizado, onOpenChange }: VerTizadoFormProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Tizado #{tizado.definicion_tizado_id}</DialogTitle>
          <DialogDescription>
            Información completa del tizado y sus tallas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Cliente</h4>
              <p className="text-lg">{tizado.ped_pedidos_cliente?.cli_clientes?.nombre || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Producto</h4>
              <p className="text-lg">{tizado.ped_pedidos_cliente?.prd_productos?.nombre || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Ancho de Tela</h4>
              <p className="text-lg">{tizado.ancho_tela_ref_metros} m</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Largo</h4>
              <p className="text-lg">{tizado.longitud_tela_metros} m</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Fecha de Creación</h4>
              <p className="text-lg">{tizado.fecha_creacion.split('T')[0]}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Estado</h4>
              <Badge variant={tizado.estado ? "default" : "secondary"}>
                {tizado.estado ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          {tizado.descripcion_tizado && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Descripción</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{tizado.descripcion_tizado}</p>
            </div>
          )}

          {/* Tabla de tallas */}
          <div>
            <h4 className="font-semibold mb-3">Tallas y Cantidades</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talla</TableHead>
                    <TableHead>Cantidad de Prendas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tizado.ped_def_tizado_tallas && tizado.ped_def_tizado_tallas.length > 0 ? (
                    tizado.ped_def_tizado_tallas
                      .filter(talla => talla.estado)
                      .map((talla) => (
                      <TableRow key={talla.def_tizado_talla_id}>
                        <TableCell className="font-medium">
                          {talla.cfg_tallas?.valor_talla || "N/A"}
                        </TableCell>
                        <TableCell>{talla.cant_prendas_tendida}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No hay tallas registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 