"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, PenSquare, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { pedidosApi } from "@/services/api/pedidos"
import { clientesApi } from "@/services/api/clientes"
import type { Pedido } from "@/types/order"
import type { Cliente } from "@/types/api"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pedidoToDelete, setPedidoToDelete] = useState<Pedido | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [pedidosData, clientesData] = await Promise.all([
        pedidosApi.getAll(),
        clientesApi.getAll()
      ])
      setPedidos(pedidosData)
      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async () => {
    if (!pedidoToDelete) return
    try {
      await pedidosApi.delete(pedidoToDelete.pedido_cliente_id)
      toast.success("Pedido eliminado correctamente")
      setPedidoToDelete(null)
      loadData()
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
      toast.error("Error al eliminar el pedido")
    }
  }

  const getNombreCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.cliente_id === clienteId)
    return cliente?.nombre || "Cliente no encontrado"
  }

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "EN_PROCESO": { variant: "default", label: "En Proceso", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      "COMPLETADO": { variant: "outline", label: "Completado", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      "ANULADO": { variant: "destructive", label: "Anulado", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  const formatTotal = (total: any): string => {
    const totalNumerico = typeof total === 'string' ? parseFloat(total) : Number(total)
    return isNaN(totalNumerico) ? "0.00" : totalNumerico.toFixed(2)
  }

  const formatFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Fecha inválida"
    }
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase()
    return (
      pedido.pedido_cliente_id.toString().includes(searchLower) ||
      getNombreCliente(pedido.cliente_id).toLowerCase().includes(searchLower) ||
      pedido.estado_pedido.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <Button onClick={() => router.push("/pedidos/nuevo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Visualiza y gestiona todos los pedidos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, cliente o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Pedido</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.pedido_cliente_id}>
                  <TableCell>#{pedido.pedido_cliente_id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>{getNombreCliente(pedido.cliente_id)}</TableCell>
                  <TableCell>{pedido.fecha_pedido.split('T')[0]}</TableCell>
                  <TableCell>{pedido.fecha_entrega.split('T')[0]}</TableCell>
                  <TableCell>S/ {formatTotal(pedido.total)}</TableCell>
                  <TableCell>{getEstadoBadge(pedido.estado_pedido)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/pedidos/${pedido.pedido_cliente_id}`)}><Eye className="h-4 w-4" /></Button>
                      
                      {pedido.estado_pedido.toUpperCase() !== "COMPLETADO" && pedido.estado_pedido.toUpperCase() !== "ANULADO" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/pedidos/${pedido.pedido_cliente_id}/editar`)}><PenSquare className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setPedidoToDelete(pedido)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!pedidoToDelete} onOpenChange={() => setPedidoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro que desea eliminar el pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el pedido #{pedidoToDelete?.pedido_cliente_id}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
