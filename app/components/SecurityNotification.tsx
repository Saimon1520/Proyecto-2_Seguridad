'use client'

import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { useState, useEffect } from 'react'

export default function SecurityNotification() {
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
        const nextRefreshIn = 300 - timeSinceLastRefresh // 5 minutos
        setTimeUntilNextRefresh(Math.max(0, nextRefreshIn))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefreshTime])

  if (!isAuthenticated) {
    return null
  }

  const isExpiringSoon = timeRemaining <= 300 // 5 minutos o menos
  const isCritical = timeRemaining <= 60 // 1 minuto o menos

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Icono de estado */}
          <div className={`w-3 h-3 rounded-full ${
            isCritical ? 'bg-red-500' : 
            isExpiringSoon ? 'bg-yellow-500' : 
            'bg-green-500'
          }`} />
          
          {/* Información de seguridad */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium">Sesión:</span>
              <span className={`font-mono font-bold ${
                isCritical ? 'text-red-600' : 
                isExpiringSoon ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium">Token:</span>
              <span className="font-mono font-medium text-blue-600">
                {timeUntilNextRefresh}s
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {isCritical ? '🔄 Crítico' : isExpiringSoon ? '⚠️ Advertencia' : '✅ Seguro'}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="hidden md:flex items-center space-x-1 text-xs text-gray-500">
          <span>🔄</span>
          <span>Auto-refresh cada 5 min</span>
        </div>
      </div>
    </div>
  )
}
