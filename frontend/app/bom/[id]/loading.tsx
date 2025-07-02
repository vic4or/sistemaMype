export default function BOMLoading() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Cargando BOM...</p>
      </div>
    </div>
  )
} 