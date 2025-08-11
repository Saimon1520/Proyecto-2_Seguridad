'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Gestión de Productos
              </Link>
              <span className="text-sm text-gray-700">
                Bienvenido, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
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
                  <Link
                    href="/products"
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                  >
                    <h5 className="font-medium text-blue-900">Gestión de Productos</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Crear, editar, eliminar y listar productos
                    </p>
                  </Link>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900">Autenticación Segura</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Sistema de login con medidas de seguridad
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900">Base de Datos</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      PostgreSQL con Prisma ORM
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Información de la Sesión
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ID de Usuario</dt>
                      <dd className="mt-1 text-sm text-gray-900">{session.user.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{session.user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                      <dd className="mt-1 text-sm text-gray-900">{session.user.name || 'No especificado'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Autenticado
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

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
    </div>
  )
} 