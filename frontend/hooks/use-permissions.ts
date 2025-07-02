import { useAuthContext } from '@/contexts/auth-context'

export const usePermissions = () => {
  const { canAccess, hasRole, hasAnyRole } = useAuthContext()

  return {
    // Permisos de productos
    canViewProducts: () => canAccess('productos:view'),
    canCreateProducts: () => canAccess('productos:create'),
    canEditProducts: () => canAccess('productos:edit'),
    canDeleteProducts: () => canAccess('productos:delete'),

    // Permisos de clientes
    canViewClients: () => canAccess('clientes:view'),
    canCreateClients: () => canAccess('clientes:create'),
    canEditClients: () => canAccess('clientes:edit'),
    canDeleteClients: () => canAccess('clientes:delete'),

    // Permisos de proveedores
    canViewSuppliers: () => canAccess('proveedores:view'),
    canCreateSuppliers: () => canAccess('proveedores:create'),
    canEditSuppliers: () => canAccess('proveedores:edit'),
    canDeleteSuppliers: () => canAccess('proveedores:delete'),

    // Permisos de pedidos
    canViewOrders: () => canAccess('pedidos:view'),
    canCreateOrders: () => canAccess('pedidos:create'),
    canEditOrders: () => canAccess('pedidos:edit'),
    canDeleteOrders: () => canAccess('pedidos:delete'),

    // Permisos de compras
    canViewPurchases: () => canAccess('compras:view'),
    canCreatePurchases: () => canAccess('compras:create'),
    canEditPurchases: () => canAccess('compras:edit'),
    canDeletePurchases: () => canAccess('compras:delete'),

    // Permisos de inventario
    canViewInventory: () => canAccess('inventario:view'),
    canCreateInventory: () => canAccess('inventario:create'),
    canEditInventory: () => canAccess('inventario:edit'),
    canDeleteInventory: () => canAccess('inventario:delete'),

    // Permisos de BOM
    canViewBOM: () => canAccess('bom:view'),
    canCreateBOM: () => canAccess('bom:create'),
    canEditBOM: () => canAccess('bom:edit'),
    canDeleteBOM: () => canAccess('bom:delete'),

    // Permisos de MRP
    canViewMRP: () => canAccess('mrp:view'),
    canCreateMRP: () => canAccess('mrp:create'),
    canEditMRP: () => canAccess('mrp:edit'),
    canDeleteMRP: () => canAccess('mrp:delete'),

    // Permisos de tizados
    canViewTizados: () => canAccess('tizados:view'),
    canCreateTizados: () => canAccess('tizados:create'),
    canEditTizados: () => canAccess('tizados:edit'),
    canDeleteTizados: () => canAccess('tizados:delete'),

    // Permisos de configuración
    canViewConfig: () => canAccess('configuracion:view'),
    canEditConfig: () => canAccess('configuracion:edit'),

    // Verificaciones de rol
    isAdmin: () => hasRole('administrador'),
    isAlmacen: () => hasRole('almacen'),
    isAdminOrAlmacen: () => hasAnyRole(['administrador', 'almacen']),

    // Función genérica para cualquier permiso
    canAccess,
    hasRole,
    hasAnyRole,
  }
} 