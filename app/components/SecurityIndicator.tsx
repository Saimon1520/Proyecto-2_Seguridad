'use client'

import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { useState, useEffect } from 'react'
import { ENV_CONFIG } from '@/app/lib/env'

export default function SecurityIndicator() {
  const { 
    session, 
    timeRemaining, 
    lastRefreshTime, 
    formatTimeRemaining, 
    handleSignOut,
    isAuthenticated 
  } = useSessionSecurity()
  
  const [showDetails, setShowDetails] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(60)

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Calcular tiempo hasta el próximo refresh de token
      if (lastRefreshTime) {
        const now = Math.floor(Date.now() / 1000)
        const lastRefresh = Math.floor(lastRefreshTime.getTime() / 1000)
        const timeSinceLastRefresh = now - lastRefresh
        const nextRefreshIn = ENV_CONFIG.TOKEN_REFRESH_INTERVAL - timeSinceLastRefresh
        setTimeUntilNextRefresh(Math.max(0, nextRefreshIn))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefreshTime])

  // Reiniciar countdown de refresh al actualizarse el token
  useEffect(() => {
    if (!lastRefreshTime) return
    setTimeUntilNextRefresh(ENV_CONFIG.TOKEN_REFRESH_INTERVAL)
  }, [lastRefreshTime])

  if (!isAuthenticated || !session?.user) {
    return null
  }

  const user = session.user as any
  const isExpiringSoon = timeRemaining <= ENV_CONFIG.WARNING_THRESHOLD // 5 minutos o menos
  const isCritical = timeRemaining <= ENV_CONFIG.CRITICAL_THRESHOLD // 1 minuto o menos

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Indicador principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[320px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🔒 Seguridad de Sesión
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showDetails ? '−' : '+'}
          </button>
        </div>

        {/* Información principal de seguridad */}
        <div className="space-y-3 mb-4">
          {/* Tiempo restante de sesión */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Sesión expira en:
              </span>
              <span className={`text-lg font-mono font-bold ${
                isCritical ? 'text-red-600' : 
                isExpiringSoon ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            
            {/* Barra de progreso de sesión */}
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Token se actualiza en:
              </span>
              <span className="text-sm font-mono font-medium text-blue-600">
                {timeUntilNextRefresh}s
              </span>
            </div>
            
            {/* Barra de progreso de refresh de token */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (timeUntilNextRefresh / ENV_CONFIG.TOKEN_REFRESH_INTERVAL) * 100))}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Información de refresh automático */}
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
            <span className="mr-2">🔄</span>
            <span>Token se refresca automáticamente cada {ENV_CONFIG.TOKEN_REFRESH_INTERVAL}s</span>
          </div>
          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
            <span className="mr-2">⏰</span>
            <span>Sesión completa expira en 1 hora ({ENV_CONFIG.SESSION_EXPIRY / 60} min)</span>
          </div>
        </div>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t pt-3">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Rol:</span>
              <span className="font-medium">{user.role?.name || 'Sin rol'}</span>
            </div>
            <div className="flex justify-between">
              <span>Inicio de sesión:</span>
              <span className="font-medium">
                {user.sessionStart ? new Date(user.sessionStart * 1000).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Último refresh:</span>
              <span className="font-medium">
                {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Próximo refresh:</span>
              <span className="font-medium">
                {lastRefreshTime ? new Date(lastRefreshTime.getTime() + ENV_CONFIG.TOKEN_REFRESH_INTERVAL * 1000).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Refreshes realizados:</span>
              <span className="font-medium">{user.refreshCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Nonce actual:</span>
              <span className="font-mono text-xs">{user.nonce || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora actual:</span>
              <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Botón de cerrar sesión */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
          >
            🔓 Cerrar Sesión
          </button>
        </div>

        {/* Advertencias */}
        {isCritical && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-xs text-center font-medium">
              ⚠️ Sesión expirando en menos de 1 minuto
            </p>
            <p className="text-red-700 dark:text-red-300 text-xs text-center mt-1">
              Serás redirigido al login automáticamente
            </p>
          </div>
        )}
        {isExpiringSoon && !isCritical && (
          <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-xs text-center font-medium">
              ⏰ Sesión expirando en menos de 5 minutos
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs text-center mt-1">
              Guarda tu trabajo antes de que expire
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
