'use client'

import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { useState, useEffect } from 'react'
import { ENV_CONFIG } from '@/app/lib/env'

export default function SecurityStatusBar() {
  const { 
    timeRemaining, 
    lastRefreshTime, 
    formatTimeRemaining, 
    isAuthenticated 
  } = useSessionSecurity()
  
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(60)

  // Actualizar tiempo hasta próximo refresh cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
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

  // Reiniciar el contador cuando cambie lastRefreshTime
  useEffect(() => {
    if (!lastRefreshTime) return
    // Al detectar un nuevo refresh, reiniciar el contador a intervalo completo
    setTimeUntilNextRefresh(ENV_CONFIG.TOKEN_REFRESH_INTERVAL)
  }, [lastRefreshTime])

  if (!isAuthenticated) {
    return null
  }

  const isExpiringSoon = timeRemaining <= ENV_CONFIG.WARNING_THRESHOLD // 5 minutos o menos
  const isCritical = timeRemaining <= ENV_CONFIG.CRITICAL_THRESHOLD // 1 minuto o menos

  return (
    <div className="flex items-center space-x-4 text-sm">
      {/* Estado de sesión */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 dark:text-gray-400">Sesión:</span>
        <span className={`font-mono font-bold ${
          isCritical ? 'text-red-600' : 
          isExpiringSoon ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {formatTimeRemaining(timeRemaining)}
        </span>
      </div>

      {/* Estado de refresh de token */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 dark:text-gray-400">Token:</span>
        <span className="font-mono font-medium text-blue-600">
          {timeUntilNextRefresh}s
        </span>
      </div>

      {/* Indicador visual de estado */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${
          isCritical ? 'bg-red-500' : 
          isExpiringSoon ? 'bg-yellow-500' : 
          'bg-green-500'
        }`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isCritical ? 'Crítico' : isExpiringSoon ? 'Advertencia' : 'Seguro'}
        </span>
      </div>

      {/* Información de refresh automático */}
      <div className="hidden md:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <span>🔄</span>
        <span>Auto-refresh cada {ENV_CONFIG.TOKEN_REFRESH_INTERVAL}s</span>
      </div>
    </div>
  )
}
