import { Badge } from "@/components/ui/badge"

type StatusType =
  // Estados generales
  | "active"
  | "inactive"
  // Estados de pedidos
  | "pending"
  | "in-process"
  | "completed"
  | "cancelled"
  // Estados de compras
  | "approved"
  | "delivered"
  | "rejected"
  // Tipos de movimientos
  | "input"
  | "output"
  | "adjustment"

interface StatusBadgeProps {
  status: StatusType | string
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  // Mapeo de estados a etiquetas en español
  const statusLabels: Record<string, string> = {
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
    "in-process": "En Proceso",
    completed: "Completado",
    cancelled: "Cancelado",
    approved: "Aprobada",
    delivered: "Entregada",
    rejected: "Rechazada",
    input: "Entrada",
    output: "Salida",
    adjustment: "Ajuste",
  }

  // Mapeo de estados a variantes de badge
  const getVariant = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "delivered":
      case "input":
        return "success"
      case "pending":
      case "approved":
        return "warning"
      case "in-process":
        return "secondary"
      case "inactive":
      case "cancelled":
      case "rejected":
      case "output":
        return "destructive"
      case "adjustment":
        return "outline"
      default:
        return "default"
    }
  }

  // Mapeo de estados a clases personalizadas
  const getCustomClass = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "delivered":
      case "input":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "pending":
      case "approved":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "in-process":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "inactive":
      case "cancelled":
      case "rejected":
      case "output":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
      case "adjustment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return ""
    }
  }

  const displayLabel = label || statusLabels[status] || status

  return (
    <Badge variant={getVariant(status) as any} className={getCustomClass(status)}>
      {displayLabel}
    </Badge>
  )
}
