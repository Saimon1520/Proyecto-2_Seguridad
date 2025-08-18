'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SECURITY_CONFIG } from '@/app/lib/security'

interface SessionUser {
  id: string
  email: string
  name: string
  username: string
  role: any
  sessionStart: number
  lastRefresh: number
  refreshCount: number
  nonce: string
}

export function useSessionSecurity() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as SessionUser
      
      // Configurar refresh automático cada 60 segundos
      refreshIntervalRef.current = setInterval(() => {
        // Forzar refresh de la sesión
        window.location.reload()
      }, SECURITY_CONFIG.TOKEN_REFRESH_INTERVAL * 1000)

      // Configurar verificación de expiración cada 10 segundos
      sessionCheckIntervalRef.current = setInterval(() => {
        const now = Math.floor(Date.now() / 1000)
        const sessionAge = now - user.sessionStart
        
        if (sessionAge >= SECURITY_CONFIG.SESSION_EXPIRY) {
          // Sesión expirada, forzar logout
          console.log('Sesión expirada por tiempo, cerrando sesión...')
          signOut({ redirect: true, callbackUrl: '/login' })
          return
        }

        // Calcular tiempo restante
        const remaining = SECURITY_CONFIG.SESSION_EXPIRY - sessionAge
        setTimeRemaining(remaining)
        
        // Actualizar tiempo del último refresh
        if (user.lastRefresh) {
          setLastRefreshTime(new Date(user.lastRefresh * 1000))
        }
      }, SECURITY_CONFIG.SESSION_CHECK_INTERVAL * 1000)

      // Configurar refresh automático de la página cada 60 segundos para mantener tokens frescos
      const pageRefreshInterval = setInterval(() => {
        // Solo refrescar si la sesión sigue activa
        if (status === 'authenticated') {
          console.log('Refrescando página para mantener tokens seguros...')
          window.location.reload()
        }
      }, SECURITY_CONFIG.TOKEN_REFRESH_INTERVAL * 1000)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current)
        }
        clearInterval(pageRefreshInterval)
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
      }
    }
  }, [status, session, router])

  // Función para formatear tiempo restante
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Función para cerrar sesión manualmente
  const handleSignOut = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current)
    }
    signOut({ redirect: true, callbackUrl: '/login' })
  }

  return {
    session,
    status,
    timeRemaining,
    lastRefreshTime,
    formatTimeRemaining,
    handleSignOut,
    isAuthenticated: status === 'authenticated'
  }
}
