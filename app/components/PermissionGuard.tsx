'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  children: ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  fallback?: ReactNode
}

export default function PermissionGuard({ 
  children, 
  requiredPermissions = [], 
  requiredRole,
  fallback = <div>No tienes permisos para acceder a esta funcionalidad</div>
}: PermissionGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Cargando permisos...</div>
  }

  if (!session?.user) {
    return fallback
  }

  // Verificar rol requerido
  if (requiredRole && session.user.role?.name !== requiredRole) {
    return fallback
  }

  // Verificar permisos requeridos
  if (requiredPermissions.length > 0) {
    const userPermissions = session.user.role?.permissions || []
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    )

    if (!hasAllPermissions) {
      return fallback
    }
  }

  return <>{children}</>
}

// Componentes específicos para permisos comunes
export function CreatePermissionGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredPermissions={['crear']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function EditPermissionGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredPermissions={['editar']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function DeletePermissionGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredPermissions={['borrar']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ViewReportsPermissionGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredPermissions={['ver_reportes']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function AdminRoleGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}
