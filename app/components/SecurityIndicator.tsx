'use client'

import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { useState, useEffect } from 'react'

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

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isAuthenticated || !session?.user) {
    return null
  }

  const user = session.user as any
  const isExpiringSoon = timeRemaining <= 300 // 5 minutos o menos
  const isCritical = timeRemaining <= 60 // 1 minuto o menos

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Indicador principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
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

        {/* Tiempo restante */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Tiempo restante:
            </span>
            <span className={`text-lg font-mono font-bold ${
              isCritical ? 'text-red-600' : 
              isExpiringSoon ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCritical ? 'bg-red-500' : 
                isExpiringSoon ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ 
                width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` 
              }}
            />
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
          </div>
        )}
        {isExpiringSoon && !isCritical && (
          <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-xs text-center font-medium">
              ⏰ Sesión expirando en menos de 5 minutos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
