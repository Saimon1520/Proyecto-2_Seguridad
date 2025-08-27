'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number // Tiempo en minutos (por defecto 1 minuto)
  warningMinutes?: number // Tiempo de advertencia (por defecto 30 segundos)
}

export function useInactivityTimeout({
  timeoutMinutes = 1,
  warningMinutes = 0.5
}: UseInactivityTimeoutOptions = {}) {
  const { data: session } = useSession()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now

    // Limpiar timers existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    // Timer de advertencia (opcional)
    if (warningMinutes > 0) {
      warningRef.current = setTimeout(() => {
        console.log(`⚠️ Advertencia: Sesión por expirar por inactividad en ${(timeoutMinutes - warningMinutes) * 60} segundos`)
      }, warningMinutes * 60 * 1000)
    }

    // Timer principal de cierre de sesión
    timeoutRef.current = setTimeout(() => {
      console.log('🔄 Sesión cerrada por inactividad')
      // Redirigir de forma limpia
      signOut({ redirect: true, callbackUrl: '/login' })
    }, timeoutMinutes * 60 * 1000)
  }, [timeoutMinutes, warningMinutes])

  // Función para manejar actividad del usuario
  const handleUserActivity = useCallback(() => {
    resetInactivityTimer()
  }, [resetInactivityTimer])

  useEffect(() => {
    if (!session) return

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ]

    // Agregar listeners para cada evento
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Iniciar el timer de inactividad
    resetInactivityTimer()

    // Cleanup: remover listeners y limpiar timers
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [session, handleUserActivity, resetInactivityTimer])

  // Función para obtener tiempo restante (útil para debugging)
  const getTimeRemaining = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const timeRemaining = (timeoutMinutes * 60 * 1000) - timeSinceLastActivity
    return Math.max(0, Math.floor(timeRemaining / 1000))
  }, [timeoutMinutes])

  return {
    resetInactivityTimer,
    getTimeRemaining,
    lastActivity: lastActivityRef.current
  }
}
