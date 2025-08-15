'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

    const openCreateForm = () => {
        resetForm()
        setShowCreateForm(true)
        setEditingUser(null)
    }

    const openEditForm = (user: User) => {
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            username: user.username,
            roleId: user.role?.id || ''
        })
        setFormErrors({})
        setEditingUser(user)
        setShowCreateForm(false)
    }

    const closeForms = () => {
        setShowCreateForm(false)
        setEditingUser(null)
        resetForm()
    }

    const validateForm = () => {
        const errors: { [key: string]: string } = {}

        if (!formData.email) errors.email = 'El email es requerido'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'El email no es válido'

        if (!editingUser && !formData.password) errors.password = 'La contraseña es requerida'
        else if (formData.password && formData.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres'

        if (!formData.name) errors.name = 'El nombre es requerido'
        else if (formData.name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres'

        if (!formData.username) errors.username = 'El username es requerido'
        else if (formData.username.length < 3) errors.username = 'El username debe tener al menos 3 caracteres'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
            const method = editingUser ? 'PUT' : 'POST'

            // Si estamos editando y no hay contraseña, no la enviamos
            const dataToSend = editingUser && !formData.password
                ? { ...formData, password: undefined }
                : formData

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            })

            if (response.ok) {
                const result = await response.json()
                alert(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
                closeForms()
                fetchUsers() // Recargar la lista
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Error al procesar la solicitud')
            }
        } catch (error) {
            alert('Error al procesar la solicitud')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
            return
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setUsers(users.filter(user => user.id !== userId))
                alert('Usuario eliminado exitosamente')
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Error al eliminar usuario')
            }
        } catch (error) {
            alert('Error al eliminar usuario')
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getPermissionBadges = (permissions: string[]) => {
        const permissionColors: { [key: string]: string } = {
            crear: 'bg-green-100 text-green-800',
            editar: 'bg-blue-100 text-blue-800',
            borrar: 'bg-red-100 text-red-800',
            ver_reportes: 'bg-purple-100 text-purple-800'
        }

        return permissions.map(permission => (
            <span
                key={permission}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1 ${permissionColors[permission] || 'bg-gray-100 text-gray-800'}`}
            >
                {permission.replace('_', ' ')}
            </span>
        ))
    }

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
                                href="/dashboard"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </Link>
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
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Gestión de Usuarios
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Administre los usuarios del sistema, sus roles y permisos
                                    </p>
                                </div>
                                {session.user.role?.permissions.includes('crear') && (
                                    <button
                                        onClick={openCreateForm}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Crear Usuario
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Usuario
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Identificación
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Rol
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Permisos
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Último Login
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name || 'Sin nombre'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <strong>ID:</strong> {user.id}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            <strong>Username:</strong> {user.username}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {user.role ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {user.role.name}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Sin rol
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap">
                                                            {user.role ? (
                                                                getPermissionBadges(user.role.permissions)
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Sin permisos</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(user.lastLoginAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            {session.user.role?.permissions.includes('editar') && (
                                                                <button
                                                                    onClick={() => openEditForm(user)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Editar
                                                                </button>
                                                            )}
                                                            {session.user.role?.permissions.includes('borrar') && user.id !== session.user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {users.length === 0 && !loading && (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Comience creando un nuevo usuario.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal para Crear/Editar Usuario */}
            {(showCreateForm || editingUser) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                                </h3>
                                <button
                                    onClick={closeForms}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        autoComplete="off"
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="ejemplo@correo.com"
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Contraseña {editingUser ? '(dejar en blanco para no cambiar)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        autoComplete="new-password"
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${formErrors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    {formErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        autoComplete="off"
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Nombre completo"
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        autoComplete="off"
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 ${formErrors.username ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Nombre de usuario"
                                    />
                                    {formErrors.username && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Rol
                                    </label>
                                    <select
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                        autoComplete="off"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                    >
                                        <option value="">Sin rol</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeForms}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Procesando...' : (editingUser ? 'Actualizar' : 'Crear')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

