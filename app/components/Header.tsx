'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { 
  Bars3Icon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export default function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Toggle del sidebar y breadcrumb */}
        <div className="flex items-center space-x-4">
          {/* Botón para toggle del sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            title="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Sistema</span>
          </nav>
        </div>

        {/* Lado derecho - Notificaciones y usuario */}
        <div className="flex items-center space-x-4">
          {/* Botón de notificaciones */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600" />
            {/* Indicador de notificaciones */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Separador vertical */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Menú del usuario */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Avatar del usuario */}
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>

              {/* Información del usuario */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.role?.name || 'Sin rol'}
                </p>
              </div>

              {/* Icono de flecha */}
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown del usuario */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Usuario'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session?.user?.email || 'usuario@ejemplo.com'}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
