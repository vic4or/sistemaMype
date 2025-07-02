"use client"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  useDropdown?: boolean
  viewLabel?: string
  editLabel?: string
  deleteLabel?: string
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  useDropdown = false,
  viewLabel = "Ver detalles",
  editLabel = "Editar",
  deleteLabel = "Eliminar",
}: ActionButtonsProps) {
  // Versión con botones directos
  if (!useDropdown) {
    return (
      <div className="flex items-center justify-center gap-2">
        {onView && (
          <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8" title={viewLabel}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title={editLabel}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
            title={deleteLabel}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  // Versión con menú desplegable
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            {viewLabel}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
