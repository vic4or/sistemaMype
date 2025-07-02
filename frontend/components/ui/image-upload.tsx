"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Crear FormData
      const formData = new FormData()
      formData.append("file", file)

      // Subir a Cloudinary
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error("Error al subir imagen:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
        {value ? (
          <>
            <Image
              fill
              className="object-cover"
              alt="Imagen del producto"
              src={value}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled || isLoading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed rounded-md">
            <Button
              type="button"
              variant="ghost"
              disabled={disabled || isLoading}
              className="relative"
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
                disabled={disabled || isLoading}
              />
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 