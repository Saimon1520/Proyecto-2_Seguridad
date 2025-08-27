'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isHovered, setIsHovered] = useState(false)

  // Verificar si el usuario tiene permisos para ver ciertas secciones
  const hasPermission = (permission: string) => {
    return session?.user?.role?.permissions?.includes(permission) || false
  }

  // Verificar si el usuario es SuperAdmin (tiene todos los permisos)
  const isSuperAdmin = session?.user?.role?.name === 'SuperAdmin'

  // Verificar si tiene cualquier permiso de productos
  const hasAnyProductPermission = () => {
    const productPermissions = ['productos_crear', 'productos_editar', 'productos_borrar', 'productos_ver']
    return productPermissions.some(permission => hasPermission(permission)) || isSuperAdmin
  }

  // Verificar si tiene cualquier permiso de usuarios
  const hasAnyUserPermission = () => {
    const userPermissions = ['usuarios_crear', 'usuarios_editar', 'usuarios_borrar', 'usuarios_ver']
    return userPermissions.some(permission => hasPermission(permission)) || isSuperAdmin
  }

  // Verificar si tiene cualquier permiso de roles
  const hasAnyRolePermission = () => {
    const rolePermissions = ['roles_crear', 'roles_editar', 'roles_borrar', 'roles_ver']
    return rolePermissions.some(permission => hasPermission(permission)) || isSuperAdmin
  }

  // Verificar si tiene cualquier permiso de reportes
  const hasAnyReportPermission = () => {
    const reportPermissions = ['reportes_productos', 'reportes_usuarios']
    return reportPermissions.some(permission => hasPermission(permission)) || isSuperAdmin
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true // Siempre visible
    },
    {
      name: 'Gestión de Usuarios',
      href: '/users',
      icon: UsersIcon,
      show: hasAnyUserPermission()
    },
    {
      name: 'Gestión de Productos',
      href: '/products',
      icon: CubeIcon,
      show: hasAnyProductPermission()
    },
    {
      name: 'Gestión de Roles',
      href: '/roles',
      icon: ShieldCheckIcon,
      show: hasAnyRolePermission()
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: ChartBarIcon,
      show: hasAnyReportPermission()
    }
  ].filter(item => item.show)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div 
      className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      } h-screen sticky top-0`}
      onMouseEnter={() => !collapsed && setIsHovered(true)}
      onMouseLeave={() => !collapsed && setIsHovered(false)}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Sistema</span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive(item.href) ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {!collapsed && (
                <span className="font-medium truncate">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer con información del usuario */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.role?.name || 'Sin rol'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
