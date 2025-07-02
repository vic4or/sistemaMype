"use client"

import { useState } from "react"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuthContext } from "@/contexts/auth-context"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthContext()

  if (!user) {
    return null // No mostrar navbar si no hay usuario
  }

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1">
        <div className="md:hidden text-center font-semibold text-blue-600 dark:text-blue-400">ConfecMRP</div>
      </div>
      
      <div className="flex items-center gap-3">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-auto p-1.5 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.rol}</p>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt={user.nombre} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {user.iniciales}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.nombre} />
                <AvatarFallback className="bg-blue-100 text-blue-600">{user.iniciales}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{user.nombre}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">{/* Aquí iría un sidebar móvil */}</div>
      )}
    </nav>
  )
}
