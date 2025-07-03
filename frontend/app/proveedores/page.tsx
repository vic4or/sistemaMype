"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Search, Edit, UserX, UserCheck, Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProveedorForm from "@/components/forms/proveedor-form"
import { useToast } from "@/components/ui/use-toast"
import { proveedoresApi } from "@/services/api/proveedores"
import type { Proveedor } from "@/types/material-proveedor"
import { useAuthContext } from "@/contexts/auth-context"

export default function ProveedoresPage() {
  const { toast } = useToast()
  const { hasRole } = useAuthContext()
  const isAlmacen = hasRole('almacen')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("activos")
  const [proveedorToToggle, setProveedorToToggle] = useState<Proveedor | null>(null)
  const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadProveedores = async () => {
    try {
      setIsLoading(true)
      const data = await proveedoresApi.getAll()
      setProveedores(data)
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProveedores()
  }, [])

  const filteredProveedores = proveedores.filter((proveedor) => {
    const matchesSearch =
      proveedor.ruc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "activos" && proveedor.estado) ||
      (statusFilter === "inactivos" && !proveedor.estado)

    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = async (proveedor: Proveedor) => {
    try {
      setIsLoading(true)
      await proveedoresApi.toggleStatus(proveedor.proveedor_id)
      await loadProveedores()
      toast({
        title: "Éxito",
        description: `Proveedor ${proveedor.estado ? "desactivado" : "activado"} correctamente`,
      })
      setProveedorToToggle(null)
    } catch (error) {
      console.error("Error al cambiar estado del proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del proveedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProveedor = async (proveedorData: Partial<Proveedor>) => {
    try {
      setIsLoading(true)
      await proveedoresApi.create(proveedorData)
      await loadProveedores()
      toast({
        title: "Éxito",
        description: "Proveedor creado correctamente",
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error al crear proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el proveedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProveedor = async (proveedorData: Partial<Proveedor>) => {
    if (!proveedorToEdit) return

    try {
      setIsLoading(true)
      await proveedoresApi.update(proveedorToEdit.proveedor_id, proveedorData)
      await loadProveedores()
      toast({
        title: "Éxito",
        description: "Proveedor actualizado correctamente",
      })
      setProveedorToEdit(null)
    } catch (error) {
      console.error("Error al actualizar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proveedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            {isAlmacen 
              ? "Consulta la información de los proveedores de materiales"
              : "Gestiona la información de tus proveedores de materiales"
            }
          </p>
        </div>
        {!isAlmacen && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Proveedores</CardTitle>
          <CardDescription>
            {filteredProveedores.length} proveedor{filteredProveedores.length !== 1 ? "es" : ""}
            {statusFilter !== "todos" && ` ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por razón social, RUC, email o categoría..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activos">Solo Activos</SelectItem>
                <SelectItem value="inactivos">Solo Inactivos</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RUC</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Lead Time (días)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProveedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron proveedores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProveedores.map((proveedor) => (
                    <TableRow key={proveedor.proveedor_id}>
                      <TableCell className="font-medium">{proveedor.ruc}</TableCell>
                      <TableCell className="font-medium">{proveedor.razon_social}</TableCell>
                      <TableCell>{proveedor.telefono}</TableCell>
                      <TableCell>{proveedor.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{proveedor.direccion}</TableCell>
                      <TableCell className="text-center">{proveedor.lead_time_dias ?? '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={proveedor.estado ? "default" : "secondary"}
                          className={
                            proveedor.estado
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                              : ""
                          }
                        >
                          {proveedor.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!isAlmacen ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProveedorToEdit(proveedor)}
                                className="h-8 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProveedorToToggle(proveedor)}
                                className={`h-8 px-2 ${
                                  proveedor.estado
                                    ? "text-destructive hover:text-destructive"
                                    : "text-green-600 hover:text-green-600"
                                }`}
                              >
                                {proveedor.estado ? <Trash2 className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Solo consulta</span>
                          )}
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

      <AlertDialog open={!!proveedorToToggle} onOpenChange={() => setProveedorToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{proveedorToToggle?.estado ? "Inactivar" : "Activar"} Proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea {proveedorToToggle?.estado ? "inactivar" : "activar"} al proveedor{" "}
              <strong>{proveedorToToggle?.razon_social}</strong>?
              {proveedorToToggle?.estado && (
                <span className="block mt-2 text-sm">
                  El proveedor no aparecerá en las listas activas pero se mantendrá el historial.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => proveedorToToggle && handleToggleStatus(proveedorToToggle)}
              className={proveedorToToggle?.estado ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {proveedorToToggle?.estado ? "Inactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isAlmacen && (
        <>
          <ProveedorForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSubmit={handleCreateProveedor}
            title="Nuevo Proveedor"
            description="Complete la información del proveedor"
          />

          <ProveedorForm
            open={!!proveedorToEdit}
            onOpenChange={() => setProveedorToEdit(null)}
            onSubmit={handleEditProveedor}
            initialData={proveedorToEdit}
            title="Editar Proveedor"
            description="Modifique la información del proveedor"
          />
        </>
      )}
    </div>
  )
}
