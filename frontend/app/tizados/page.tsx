"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Edit, UserX, UserCheck, Eye, Trash2 } from "lucide-react"
import { Tizado } from "@/types/tizado"
import { useToast } from "@/components/ui/use-toast"
import { NuevoTizadoForm } from "@/components/forms/nuevo-tizado-form"
import EditarTizadoForm from "@/components/forms/editar-tizado-form"
import VerTizadoForm from "@/components/forms/ver-tizado-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { tizadosApi } from "@/services/api/tizados"

export default function TizadosPage() {
  const [tizados, setTizados] = useState<Tizado[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTizado, setSelectedTizado] = useState<Tizado | null>(null)
  const [tizadoToView, setTizadoToView] = useState<Tizado | null>(null)
  const [tizadoToToggle, setTizadoToToggle] = useState<Tizado | null>(null)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const cargarTizados = async () => {
    setIsLoading(true)
    try {
      const response = await tizadosApi.getAll()
      setTizados(response)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tizados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarTizados()
  }, [])

  const handleToggleStatus = async () => {
    if (!tizadoToToggle) return
    try {
      if (tizadoToToggle.estado) {
        // Inactivar (borrado lógico)
        await tizadosApi.remove(tizadoToToggle.definicion_tizado_id)
        toast({ title: "Éxito", description: "Tizado inactivado correctamente" })
      } else {
        // Activar
        await tizadosApi.update(tizadoToToggle.definicion_tizado_id, { estado: true })
        toast({ title: "Éxito", description: "Tizado activado correctamente" })
      }
      cargarTizados()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del tizado", variant: "destructive" })
    } finally {
      setTizadoToToggle(null)
    }
  }

  const filteredTizados = tizados.filter((tizado) => {
    const matchesSearch =
      (tizado.ped_pedidos_cliente?.cli_clientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (tizado.ped_pedidos_cliente?.prd_productos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    let matchesEstado = true
    if (filterEstado === "active") matchesEstado = tizado.estado === true
    else if (filterEstado === "inactive") matchesEstado = tizado.estado === false
    return matchesSearch && matchesEstado
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tizados</h1>
          <p className="text-muted-foreground">Define y gestiona los tizados para producción</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tizado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Tizados</CardTitle>
          <CardDescription>{filteredTizados.length} tizados encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o producto..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Largo (m)</TableHead>
                  <TableHead>Ancho Tela (m)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredTizados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No se encontraron tizados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTizados.map((tizado) => (
                    <TableRow key={tizado.definicion_tizado_id}>
                      <TableCell className="font-medium">{tizado.ped_pedidos_cliente?.cli_clientes?.nombre ?? "N/A"}</TableCell>
                      <TableCell>{tizado.ped_pedidos_cliente?.prd_productos?.nombre ?? "N/A"}</TableCell>
                      <TableCell>{tizado.fecha_creacion.split('T')[0]}</TableCell>
                      <TableCell>{tizado.longitud_tela_metros}</TableCell>
                      <TableCell>{tizado.ancho_tela_ref_metros}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tizado.estado ? "default" : "secondary"}
                          className={
                            tizado.estado
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                              : ""
                          }
                        >
                          {tizado.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTizadoToView(tizado)}
                            className="h-8 px-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTizado(tizado)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTizadoToToggle(tizado)}
                            className={`h-8 px-2 ${
                              tizado.estado
                                ? "text-destructive hover:text-destructive"
                                : "text-green-600 hover:text-green-600"
                            }`}
                          >
                            {tizado.estado ? <Trash2 className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <NuevoTizadoForm open={open} onOpenChange={setOpen} onSuccess={cargarTizados} />

      {selectedTizado && (
        <EditarTizadoForm
          open={!!selectedTizado}
          tizado={selectedTizado}
          onOpenChange={() => setSelectedTizado(null)}
          onSuccess={() => {
            setSelectedTizado(null)
            cargarTizados()
          }}
        />
      )}

      {tizadoToView && (
        <VerTizadoForm
          tizado={tizadoToView}
          onOpenChange={() => setTizadoToView(null)}
        />
      )}

      <AlertDialog open={!!tizadoToToggle} onOpenChange={() => setTizadoToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tizadoToToggle?.estado ? "Inactivar" : "Activar"} Tizado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea {tizadoToToggle?.estado ? "inactivar" : "activar"} el tizado del cliente{" "}
              <strong>{tizadoToToggle?.ped_pedidos_cliente?.cli_clientes?.nombre}</strong>?
              {tizadoToToggle?.estado && (
                <span className="block mt-2 text-sm">
                  El tizado no aparecerá en las listas activas pero se mantendrá el historial.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={tizadoToToggle?.estado ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {tizadoToToggle?.estado ? "Inactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
