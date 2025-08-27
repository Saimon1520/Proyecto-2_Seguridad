"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserCard from '../components/UserCard'
import ConfirmationModal from '../components/ConfirmationModal'

interface User {
    id: string
    email: string
    name: string
    username: string
    lastLoginAt: string | null
    createdAt: string
    role: {
        id: string
        name: string
        permissions: string[]
    } | null
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

export default function UsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        username: '',
        roleId: ''
    })
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Estados para el modal de confirmación
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?error=Debe iniciar sesión para acceder a esta página')
        }
    }, [status, router])

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsers()
            fetchRoles()
        }
    }, [status])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Error al cargar usuarios')
            }
        } catch (error) {
            setError('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles')
            if (response.ok) {
                const data = await response.json()
                setRoles(data)
            }
        } catch (error) {
            console.error('Error al cargar roles:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            username: '',
            roleId: ''
        })
        setFormErrors({})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
            const method = editingUser ? 'PUT' : 'POST'
            const body = editingUser ? { ...formData, id: editingUser.id } : formData

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (response.ok) {
                setShowCreateForm(false)
                setEditingUser(null)
                resetForm()
                fetchUsers()
                setError('')
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Error al procesar la solicitud')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            username: user.username,
            roleId: user.role?.id || ''
        })
        setShowCreateForm(true)
    }

    const handleDelete = (user: User) => {
        setUserToDelete(user)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchUsers()
                setError('')
                setShowDeleteModal(false)
                setUserToDelete(null)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Error al eliminar usuario')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCancel = () => {
        setShowCreateForm(false)
        setEditingUser(null)
        resetForm()
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Mensajes de confirmación */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Header de la página */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="mt-2 text-gray-600">
                        Administre los usuarios del sistema, sus roles y permisos
                    </p>
                </div>

                {/* Botón Crear Usuario */}
                {session?.user?.role?.permissions?.includes('usuarios_crear') && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-sm transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Crear Usuario
                    </button>
                )}
            </div>

            {/* Formulario de crear/editar */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-6">
                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña {editingUser ? '(dejar en blanco para mantener)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required={!editingUser}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rol *
                                </label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccionar rol</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name} - {role.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                {isSubmitting ? 'Procesando...' : (editingUser ? 'Actualizar' : 'Crear')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de usuarios con el nuevo diseño */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Usuarios del Sistema</h2>
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
                        <p className="text-sm text-gray-400">Comience creando un nuevo usuario</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                canEdit={session?.user?.role?.permissions?.includes('usuarios_editar') || false}
                                canDelete={session?.user?.role?.permissions?.includes('usuarios_borrar') || false}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de confirmación para eliminar usuario */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                }}
                onConfirm={confirmDelete}
                title="Confirmar eliminación"
                message={`¿Está seguro de que desea eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
                type="warning"
                confirmText="Eliminar Usuario"
                cancelText="Cancelar"
                isLoading={isDeleting}
            />
        </div>
    )
}

