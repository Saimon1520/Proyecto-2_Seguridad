'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSessionTimeout } from '../hooks/useSessionTimeout'
import PermissionGuard from '../components/PermissionGuard'
import UserDropdownMenu from '../components/UserDropdownMenu'
import SecurityIndicator from '../components/SecurityIndicator'
import SessionExpiryNotification from '../components/SessionExpiryNotification'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { timeUntilTimeout } = useSessionTimeout()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?error=Debe iniciar sesión para acceder a esta página')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Login Seguro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <PermissionGuard requiredPermissions={['crear', 'editar', 'borrar']}>
                <Link
                  href="/users"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Gestión de Usuarios
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermissions={['crear', 'editar', 'borrar']}>
                <Link
                  href="/products"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Gestión de Productos
                </Link>
              </PermissionGuard>
              {/* Reemplazado con UserDropdownMenu */}
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  ¡Usuario logueado satisfactoriamente!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Has accedido exitosamente al sistema de autenticación seguro.
                </p>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Funcionalidades Disponibles
                  </h4>
                  <div className="text-sm text-gray-500">
                    Sistema de Login Seguro • Dashboard
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <PermissionGuard requiredPermissions={['crear', 'editar', 'borrar']}>
                    <Link
                      href="/users"
                      className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                    >
                      <h5 className="font-medium text-purple-900">Gestión de Usuarios</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Crear, editar, eliminar y listar usuarios
                      </p>
                    </Link>
                  </PermissionGuard>
                  <PermissionGuard requiredPermissions={['crear', 'editar', 'borrar']}>
                    <Link
                      href="/products"
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                    >
                      <h5 className="font-medium text-blue-900">Gestión de Productos</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Crear, editar, eliminar y listar productos
                      </p>
                    </Link>
                  </PermissionGuard>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900">Autenticación Segura</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Sistema de login con medidas de seguridad
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de permisos del usuario */}
              {session.user.role && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Permisos del Usuario
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {session.user.role.permissions.map((permission) => {
                      const permissionColors: { [key: string]: string } = {
                        crear: 'bg-green-100 text-green-800',
                        editar: 'bg-blue-100 text-blue-800',
                        borrar: 'bg-red-100 text-red-800',
                        ver_reportes: 'bg-purple-100 text-purple-800'
                      }

                      return (
                        <span
                          key={permission}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${permissionColors[permission] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Medidas de Seguridad Implementadas
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900">Protección SQL Injection</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Uso de Prisma ORM con prepared statements
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900">Encriptación BCrypt</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Contraseñas hasheadas con salt
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900">Límite de Intentos</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Bloqueo temporal tras 5 intentos fallidos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Solo mantener las notificaciones de expiración */}
      <SessionExpiryNotification />
    </div>
  )
} 