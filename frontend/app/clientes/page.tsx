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
import { Search, Edit, UserX, UserCheck, Filter, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ClienteForm from "@/components/forms/cliente-form"
import { clientesApi } from "@/services/api/clientes"
import type { Cliente } from "@/types/api"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("activos")
  const [clienteToToggle, setClienteToToggle] = useState<Cliente | null>(null)
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loadClientes = async () => {
    try {
      const data = await clientesApi.getAll();
      console.log("Clientes de la API:", data);
      setClientes(data || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  useEffect(() => { loadClientes(); }, []);

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      (cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
              (cliente.ruc?.includes(searchTerm) || false) ||
      (cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "activos" && cliente.estado) ||
      (statusFilter === "inactivos" && !cliente.estado);

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (cliente: Cliente) => {
    try {
      await clientesApi.update(cliente.cliente_id, { estado: !cliente.estado });
      await loadClientes();
    } catch (error) {
      console.error("Error al cambiar estado del cliente:", error);
    }
    setClienteToToggle(null);
  };

  const handleCreateCliente = async (clienteData: Partial<Cliente>) => {
    try {
      await clientesApi.create(clienteData as Cliente);
      await loadClientes();
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
    setShowCreateForm(false);
  };

  const handleEditCliente = async (clienteData: Partial<Cliente>) => {
    if (!clienteToEdit) return;
    try {
      await clientesApi.update(clienteToEdit.cliente_id, clienteData);
      await loadClientes();
    } catch (error) {
      console.error("Error al editar cliente:", error);
    }
    setClienteToEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>Nuevo Cliente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Clientes</CardTitle>
          <CardDescription>
            {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""}
            {statusFilter !== "todos" && ` ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, RUC o email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.cliente_id}>
                      <TableCell className="font-medium">{cliente.ruc}</TableCell>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{cliente.direccion}</TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.estado ? "default" : "secondary"}
                          className={
                            cliente.estado
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                              : ""
                          }
                        >
                          {cliente.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClienteToEdit(cliente)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClienteToToggle(cliente)}
                            className={`h-8 px-2 ${
                              cliente.estado
                                ? "text-destructive hover:text-destructive"
                                : "text-green-600 hover:text-green-600"
                            }`}
                          >
                            {cliente.estado ? <Trash2 className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
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

      <AlertDialog open={!!clienteToToggle} onOpenChange={() => setClienteToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{clienteToToggle?.estado ? "Inactivar" : "Activar"} Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea {clienteToToggle?.estado ? "inactivar" : "activar"} al cliente{" "}
              <strong>{clienteToToggle?.nombre}</strong>?
              {clienteToToggle?.estado && (
                <span className="block mt-2 text-sm">
                  El cliente no aparecerá en las listas activas pero se mantendrá el historial.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clienteToToggle && handleToggleStatus(clienteToToggle)}
              className={clienteToToggle?.estado ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {clienteToToggle?.estado ? "Inactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClienteForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateCliente}
        title="Nuevo Cliente"
        description="Complete la información del cliente"
      />

      <ClienteForm
        open={!!clienteToEdit}
        onOpenChange={() => setClienteToEdit(null)}
        onSubmit={handleEditCliente}
        initialData={clienteToEdit}
        title="Editar Cliente"
        description="Modifique la información del cliente"
      />
    </div>
  )
}
