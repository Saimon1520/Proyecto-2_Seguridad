'use client'

import { useState } from 'react'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

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

interface RoleCardProps {
  role: Role
  permissions: Permission[]
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  canEdit: boolean
  canDelete: boolean
}

export default function RoleCard({ role, permissions, onEdit, onDelete, canEdit, canDelete }: RoleCardProps) {
  const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false)

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'superadmin':
        return 'bg-gradient-to-r from-purple-600 to-blue-600'
      case 'auditor':
        return 'bg-gradient-to-r from-green-600 to-emerald-600'
      case 'registrador':
        return 'bg-gradient-to-r from-orange-600 to-red-600'
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700'
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'superadmin':
        return '👑'
      case 'auditor':
        return '🔍'
      case 'registrador':
        return '📝'
      default:
        return '👤'
    }
  }

  const groupPermissions = (permissionNames: string[]) => {
    const groups: { [key: string]: string[] } = {
      'Productos': [],
      'Usuarios': [],
      'Roles': [],
      'Reportes': []
    }

    permissionNames.forEach(permissionName => {
      if (permissionName.startsWith('productos_')) {
        groups['Productos'].push(permissionName.replace('productos_', ''))
      } else if (permissionName.startsWith('usuarios_')) {
        groups['Usuarios'].push(permissionName.replace('usuarios_', ''))
      } else if (permissionName.startsWith('roles_')) {
        groups['Roles'].push(permissionName.replace('roles_', ''))
      } else if (permissionName.startsWith('reportes_')) {
        groups['Reportes'].push(permissionName.replace('reportes_', ''))
      }
    })

    return groups
  }

  const permissionGroups = groupPermissions(role.permissions)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      {/* Header del Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Icono del rol */}
          <div className={`w-16 h-16 ${getRoleColor(role.name)} rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-2xl">{getRoleIcon(role.name)}</span>
          </div>
          
          {/* Información principal */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {role.permissions.length} permisos
              </span>
            </div>
            <p className="text-gray-600">
              {role.description}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit(role)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar rol"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(role)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar rol"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Información del rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Tipo de rol */}
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Tipo de Rol</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(role.name)}`}>
              {role.name}
            </span>
          </div>
        </div>

        {/* Total de permisos */}
        <div className="flex items-center space-x-3">
          <KeyIcon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total Permisos</p>
            <p className="text-lg font-bold text-blue-600">{role.permissions.length}</p>
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
              Ver Permisos ({role.permissions.length})
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
