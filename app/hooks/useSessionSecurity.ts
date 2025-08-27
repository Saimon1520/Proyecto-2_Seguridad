'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useSessionSecurity() {
  const { data: session, status } = useSession()
  const [timeRemaining, setTimeRemaining] = useState(3600) // 1 hora por defecto
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Simular tiempo de sesión (en una implementación real, esto vendría del token JWT)
  useEffect(() => {
    if (session) {
      // Simular que la sesión expira en 1 hora
      setTimeRemaining(3600)
      setLastRefreshTime(new Date())
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session])

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isAuthenticated = status === 'authenticated'

  return {
    timeRemaining,
    lastRefreshTime,
    formatTimeRemaining,
    isAuthenticated
  }
}
