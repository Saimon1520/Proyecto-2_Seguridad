'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { ENV_CONFIG } from '@/app/lib/env'

export default function UserDropdownMenu() {
  const { data: session } = useSession()
  const { 
    timeRemaining, 
    lastRefreshTime, 
    formatTimeRemaining, 
    handleSignOut,
    refreshCount 
  } = useSessionSecurity()
  
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(60)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Calcular tiempo hasta el próximo refresh de token
      if (lastRefreshTime) {
        const now = Math.floor(Date.now() / 1000)
        const lastRefresh = Math.floor(lastRefreshTime.getTime() / 1000)
        const timeSinceLastRefresh = now - lastRefresh
        
        // Si han pasado más de 60 segundos desde el último refresh, 
        // significa que el token debería haberse refrescado
        if (timeSinceLastRefresh >= ENV_CONFIG.TOKEN_REFRESH_INTERVAL) {
          // El token debería haberse refrescado, mostrar 0s
          setTimeUntilNextRefresh(0)
        } else {
          // Calcular tiempo restante hasta el próximo refresh
          const nextRefreshIn = ENV_CONFIG.TOKEN_REFRESH_INTERVAL - timeSinceLastRefresh
          setTimeUntilNextRefresh(Math.max(0, nextRefreshIn))
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefreshTime])

  // Reiniciar countdown de refresh al actualizarse el token
  useEffect(() => {
    if (!lastRefreshTime) return
    setTimeUntilNextRefresh(ENV_CONFIG.TOKEN_REFRESH_INTERVAL)
  }, [lastRefreshTime])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  const user = session.user as any
  const isExpiringSoon = timeRemaining <= ENV_CONFIG.WARNING_THRESHOLD
  const isCritical = timeRemaining <= ENV_CONFIG.CRITICAL_THRESHOLD

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del usuario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{user.name || user.email}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 lg:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header del usuario */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg mx-auto sm:mx-0">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {user.email}
                </p>
                {user.role && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                    {user.role.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información de la Sesión */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              📋 Información de la Sesión
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs mb-1 sm:mb-0">ID:</span>
                <p className="font-mono text-gray-900 dark:text-gray-100 text-xs break-all">
                  {user.id}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs mb-1 sm:mb-0">Username:</span>
                <p className="font-mono text-gray-900 dark:text-gray-100 text-xs">
                  {user.username}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs mb-1 sm:mb-0">Estado:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Autenticado
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs mb-1 sm:mb-0">Refreshes:</span>
                <p className="font-mono text-gray-900 dark:text-gray-100 text-xs">
                  {refreshCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Seguridad */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              🔒 Seguridad de Sesión
            </h4>
            
            {/* Tiempo restante de sesión */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Sesión expira en:
                </span>
                <span className={`text-sm font-mono font-bold ${
                  isCritical ? 'text-red-600' : 
                  isExpiringSoon ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCritical ? 'bg-red-500' : 
                    isExpiringSoon ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (timeRemaining / ENV_CONFIG.SESSION_EXPIRY) * 100))}%` 
                  }}
                />
              </div>
            </div>

            {/* Tiempo hasta próximo refresh de token */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Token se actualiza en:
                </span>
                <span className="text-sm font-mono font-medium text-blue-600">
                  {timeUntilNextRefresh}s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (timeUntilNextRefresh / ENV_CONFIG.TOKEN_REFRESH_INTERVAL) * 100))}%` 
                  }}
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex items-center">
                <span className="mr-2">🔄</span>
                <span>Auto-refresh cada {ENV_CONFIG.TOKEN_REFRESH_INTERVAL}s</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⏰</span>
                <span>Sesión completa: {ENV_CONFIG.SESSION_EXPIRY / 60} min</span>
              </div>
            </div>
          </div>

          {/* Permisos del usuario */}
          {user.role && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                🎯 Permisos del Usuario
              </h4>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user.role.permissions.map((permission: string) => {
                  const permissionColors: { [key: string]: string } = {
                    crear: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    editar: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    borrar: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    ver_reportes: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }

                  return (
                    <span
                      key={permission}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${permissionColors[permission] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="px-4 py-3">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">🔓</span>
              Cerrar Sesión
            </button>
          </div>

          {/* Advertencias */}
          {isCritical && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700">
              <p className="text-red-800 dark:text-red-200 text-xs text-center font-medium">
                ⚠️ Sesión expirando en menos de 1 minuto
              </p>
            </div>
          )}
          {isExpiringSoon && !isCritical && (
            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-700">
              <p className="text-yellow-800 dark:text-yellow-200 text-xs text-center font-medium">
                ⏰ Sesión expirando en menos de 5 minutos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
