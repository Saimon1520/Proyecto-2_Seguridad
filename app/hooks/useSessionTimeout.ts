'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// IMPORTANTE: NO cerrar sesión por inactividad después de 60 segundos
// Solo detectar inactividad para mostrar advertencias
// La sesión se cierra solo después de 1 hora completa (manejado por useSessionSecurity)

const INACTIVITY_WARNING_DURATION = 60 * 1000 // 1 minuto en milisegundos (solo para advertencias)

export function useSessionTimeout() {
  const { data: session } = useSession()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now()
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // IMPORTANTE: NO cerrar sesión después de 60 segundos
    // Solo configurar para detectar inactividad
    timeoutRef.current = setTimeout(() => {
      // Solo mostrar advertencia, NO cerrar sesión
      console.log('⚠️ Usuario inactivo por más de 1 minuto (solo advertencia)')
      // La sesión continúa activa hasta completar 1 hora
    }, INACTIVITY_WARNING_DURATION)
  }, [])

  const handleUserActivity = useCallback(() => {
    resetTimeout()
  }, [resetTimeout])

  useEffect(() => {
    if (session) {
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

      // Agregar event listeners para detectar actividad
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true)
      })

      // Iniciar el timeout (solo para detectar inactividad)
      resetTimeout()

      // Cleanup function
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true)
        })
      }
    }
  }, [session, handleUserActivity, resetTimeout])

  // IMPORTANTE: NO verificar inactividad para cerrar sesión
  // Solo para detectar si el usuario está activo
  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        // Solo detectar inactividad, NO cerrar sesión
        const timeSinceLastActivity = Date.now() - lastActivityRef.current
        if (timeSinceLastActivity >= INACTIVITY_WARNING_DURATION) {
          console.log('⚠️ Usuario inactivo por más de 1 minuto (solo advertencia)')
          // La sesión continúa activa hasta completar 1 hora
        }
      }, 10000) // Verificar cada 10 segundos

      return () => clearInterval(interval)
    }
  }, [session])

  return {
    lastActivity: lastActivityRef.current,
    timeUntilTimeout: Math.max(0, INACTIVITY_WARNING_DURATION - (Date.now() - lastActivityRef.current)),
    isInactive: (Date.now() - lastActivityRef.current) >= INACTIVITY_WARNING_DURATION
  }
}
