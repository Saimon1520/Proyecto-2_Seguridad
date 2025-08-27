"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PermissionGuard from '../components/PermissionGuard'

// Configuración para hacer la página dinámica
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?error=Debe iniciar sesión para acceder a esta página')
    }
  }, [status, router])

  // Ocultar el mensaje de bienvenida después de 5 segundos
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false)
      }, 5000) // 5 segundos

      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Helper function to check if the user has a specific permission
  const hasPermission = (permissionName: string) => {
    return session.user.role?.permissions.includes(permissionName);
  };

  return (
    <div className="space-y-8">
      {/* Mensaje de Bienvenida Temporal */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2 duration-500">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4 shadow-lg">
              <svg
                className="h-8 w-8 text-white"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido al Sistema!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Has accedido exitosamente al sistema de autenticación seguro.
            </p>

          </div>
        </div>
      )}

      {/* Dashboard Principal (solo visible después de ocultar bienvenida) */}
      {!showWelcome && (
        <>
          {/* Header del Dashboard */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard del Sistema
            </h1>
            <p className="text-lg text-gray-600">
              Panel de control y gestión del sistema
            </p>
          </div>

          {/* Funcionalidades Disponibles - Solo mostrar si tiene permisos */}
          {(hasPermission('usuarios_ver') || hasPermission('productos_ver') || hasPermission('roles_ver')) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Funcionalidades Disponibles
              </h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hasPermission('usuarios_ver') && (
                  <Link
                    href="/users"
                    className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900">Gestión de Usuarios</h3>
                    </div>
                    <p className="text-purple-700">
                      Crear, editar, eliminar y listar usuarios del sistema
                    </p>
                  </Link>
                )}

                {hasPermission('productos_ver') && (
                  <Link
                    href="/products"
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Gestión de Productos</h3>
                    </div>
                    <p className="text-blue-700">
                      Crear, editar, eliminar y listar productos del inventario
                    </p>
                  </Link>
                )}

                {hasPermission('roles_ver') && (
                  <Link
                    href="/roles"
                    className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-900">Gestión de Roles</h3>
                    </div>
                    <p className="text-green-700">
                      Crear, editar, eliminar roles y asignar permisos
                    </p>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Mensaje cuando no tiene funcionalidades disponibles */}
          {!(hasPermission('usuarios_ver') || hasPermission('productos_ver') || hasPermission('roles_ver')) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Acceso Limitado
              </h3>
              <p className="text-gray-600">
                Tu rol actual no tiene acceso a las funcionalidades de gestión del sistema. 
                Solo puedes acceder a los reportes disponibles según tus permisos.
              </p>
            </div>
          )}

          {/* Información del Usuario */}
          {session.user.role && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información de tu Sesión
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles del Usuario</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nombre:</span> {session.user.name}</p>
                    <p><span className="font-medium">Email:</span> {session.user.email}</p>
                    <p><span className="font-medium">Rol:</span> {session.user.role.name}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Permisos Asignados</h3>
                  <div className="flex flex-wrap gap-2">
                    {session.user.role.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 