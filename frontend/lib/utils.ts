import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas usando el método que funciona correctamente con la BD
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "Fecha inválida"
  
  // Si es un string de fecha ISO, usar split('T')[0] que funciona correctamente
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  
  // Si es una fecha Date, convertir a ISO y usar split
  if (dateString instanceof Date) {
    return dateString.toISOString().split('T')[0]
  }
  
  // Fallback para otros casos
  return String(dateString).split('T')[0]
}
