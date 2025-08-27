"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import RoleCard from '../components/RoleCard'
import ConfirmationModal from '../components/ConfirmationModal'

// Configuración para hacer la página dinámica
export const dynamic = 'force-dynamic'

interface Permission {
  id: string
  name: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchRoles()
    fetchPermissions()
  }, [session, status, router])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al cargar roles')
      }
    } catch (error) {
      setError('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    })
    setEditingRole(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        resetForm()
        setMessage({
          type: 'success',
          text: editingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente'
        })
        fetchRoles()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({
          type: 'error',
          text: errorData.error || 'Error al procesar la solicitud'
        })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión'
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setShowCreateForm(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/roles/${roleToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Rol eliminado exitosamente'
        })
        fetchRoles()
        setShowDeleteModal(false)
        setRoleToDelete(null)
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({
          type: 'error',
          text: errorData.error || 'Error al eliminar el rol'
        })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al eliminar el rol'
      })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionName]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permissionName)
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando roles...</p>
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
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de confirmación */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <svg className={`w-5 h-5 mr-2 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`} fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            {message.text}
          </div>
        </div>
      )}

      {/* Header de la página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
          <p className="mt-2 text-gray-600">
            Administre los roles del sistema y sus permisos asociados
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear Rol
        </button>
      </div>

      {/* Formulario de crear/editar */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">
            {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Ej: Auditor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Descripción del rol"
                />
              </div>
            </div>

            {/* Selección de permisos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Permisos del Rol
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.name)}
                      onChange={(e) => handlePermissionChange(permission.name, e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de roles con el nuevo diseño */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Roles del Sistema</h2>
          <p className="text-sm text-gray-500">
            {roles.length} rol{roles.length !== 1 ? 'es' : ''} encontrado{roles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {roles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-lg font-medium text-gray-500">No hay roles disponibles</p>
            <p className="text-sm text-gray-400">Comience creando un nuevo rol</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                permissions={permissions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={session?.user?.role?.permissions?.includes('roles_editar') || false}
                canDelete={session?.user?.role?.permissions?.includes('roles_borrar') || false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message={`¿Está seguro de que desea eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        type="warning"
        confirmText="Eliminar Rol"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  )
}
