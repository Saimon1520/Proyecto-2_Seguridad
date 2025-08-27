'use client'

import { useState } from 'react'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

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

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  canEdit: boolean
  canDelete: boolean
}

export default function UserCard({ user, onEdit, onDelete, canEdit, canDelete }: UserCardProps) {
  const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupPermissions = (permissions: string[]) => {
    const groups: { [key: string]: string[] } = {
      'Productos': [],
      'Usuarios': [],
      'Roles': [],
      'Reportes': []
    }

    permissions.forEach(permission => {
      if (permission.startsWith('productos_')) {
        groups['Productos'].push(permission.replace('productos_', ''))
      } else if (permission.startsWith('usuarios_')) {
        groups['Usuarios'].push(permission.replace('usuarios_', ''))
      } else if (permission.startsWith('roles_')) {
        groups['Roles'].push(permission.replace('roles_', ''))
      } else if (permission.startsWith('reportes_')) {
        groups['Reportes'].push(permission.replace('reportes_', ''))
      }
    })

    return groups
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'superadmin':
        return 'bg-gradient-to-r from-purple-600 to-blue-600'
      case 'auditor':
        return 'bg-gradient-to-r from-green-600 to-emerald-600'
      case 'registrador':
        return 'bg-gradient-to-r from-orange-600 to-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const permissionGroups = groupPermissions(user.role?.permissions || [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      {/* Header del Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Avatar del usuario */}
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          
          {/* Información principal */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar usuario"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar usuario"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Información del rol y último login */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Rol */}
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Rol asignado</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(user.role?.name || '')}`}>
              {user.role?.name || 'Sin rol'}
            </span>
          </div>
        </div>

        {/* Último login */}
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Último login</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(user.lastLoginAt)}</p>
          </div>
        </div>
      </div>

      {/* Permisos */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => setIsPermissionsExpanded(!isPermissionsExpanded)}
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-3 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <EyeIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">
              Permisos ({user.role?.permissions?.length || 0})
            </span>
          </div>
          {isPermissionsExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Permisos expandidos */}
        {isPermissionsExpanded && (
          <div className="mt-4 space-y-4">
            {Object.entries(permissionGroups).map(([groupName, permissions]) => {
              if (permissions.length === 0) return null
              
              return (
                <div key={groupName} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{groupName}</h4>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-200"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
