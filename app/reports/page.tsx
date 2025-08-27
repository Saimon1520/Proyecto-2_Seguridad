"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UserCard from '../components/UserCard'
import ProductCard from '../components/ProductCard'

// Configuración para hacer la página dinámica
export const dynamic = 'force-dynamic'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
  lastLogin: string | null
  lastLoginAt: string | null
  createdAt: string
}

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users')

  // Verificar permisos del usuario
  const hasPermission = (permission: string) => {
    const userPermissions = session?.user?.role?.permissions || []
    return userPermissions.includes(permission)
  }

  // Verificar si puede ver reportes de usuarios
  const canViewUserReports = hasPermission('reportes_usuarios')
  
  // Verificar si puede ver reportes de productos
  const canViewProductReports = hasPermission('reportes_productos')

  // Debug: mostrar permisos en consola
  useEffect(() => {
    console.log('Session:', session)
    console.log('User permissions:', session?.user?.role?.permissions)
    console.log('Can view user reports:', canViewUserReports)
    console.log('Can view product reports:', canViewProductReports)
  }, [session, canViewUserReports, canViewProductReports])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    // Cargar datos inmediatamente si tiene permisos
    if (canViewUserReports || canViewProductReports) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [session, status, router, canViewUserReports, canViewProductReports])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const promises: Promise<any>[] = []
      
      if (canViewUserReports) {
        promises.push(fetch('/api/users').then(res => res.ok ? res.json() : []))
      }
      
      if (canViewProductReports) {
        promises.push(fetch('/api/products').then(res => res.ok ? res.json() : []))
      }

      if (promises.length === 0) {
        setLoading(false)
        return
      }

      const results = await Promise.all(promises)
      
      if (canViewUserReports) {
        setUsers(results[0] || [])
      }
      
      if (canViewProductReports) {
        setProducts(results[1] || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Si no tiene permisos para ver ningún reporte
  if (!canViewUserReports && !canViewProductReports) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">
            No tienes permisos para ver reportes del sistema.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>Permisos disponibles: {session?.user?.role?.permissions?.join(', ') || 'Ninguno'}</p>
            <p>Rol: {session?.user?.role?.name || 'Sin rol'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
          <p className="text-sm text-gray-500 mt-2">
            Permisos: {canViewUserReports ? 'Usuarios' : ''} {canViewUserReports && canViewProductReports ? '•' : ''} {canViewProductReports ? 'Productos' : ''}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
          <p className="mt-2 text-gray-600">
            Visualización de datos según tus permisos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canViewUserReports && (
            <span className="text-sm text-gray-500">Total Usuarios: {users.length}</span>
          )}
          {canViewUserReports && canViewProductReports && (
            <span className="text-sm text-gray-500">•</span>
          )}
          {canViewProductReports && (
            <span className="text-sm text-gray-500">Total Productos: {products.length}</span>
          )}
        </div>
      </div>

      {/* Tabs de navegación - solo mostrar si hay más de un tab */}
      {canViewUserReports && canViewProductReports && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Usuarios ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🛍️ Productos ({products.length})
            </button>
          </nav>
        </div>
      )}

      {/* Contenido de los tabs */}
      {canViewUserReports && (activeTab === 'users' || !canViewProductReports) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
            <p className="text-sm text-gray-500">
              {users.length} usuario{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          {users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-500">No hay usuarios disponibles</p>
              <p className="text-sm text-gray-400">Los usuarios aparecerán aquí cuando se creen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={() => {}} // No permitir edición en reportes
                  onDelete={() => {}} // No permitir eliminación en reportes
                  canEdit={false}
                  canDelete={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {canViewProductReports && (activeTab === 'products' || !canViewUserReports) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Productos</h2>
            <p className="text-sm text-gray-500">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg font-medium text-gray-500">No hay productos disponibles</p>
              <p className="text-sm text-gray-400">Los productos aparecerán aquí cuando se creen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => {}} // No permitir edición en reportes
                  onDelete={() => {}} // No permitir eliminación en reportes
                  canEdit={false}
                  canDelete={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
