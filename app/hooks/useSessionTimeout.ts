'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const TIMEOUT_DURATION = 60 * 1000 // 1 minuto en milisegundos

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

    timeoutRef.current = setTimeout(() => {
      // Verificar si ha pasado 1 minuto desde la última actividad
      if (Date.now() - lastActivityRef.current >= TIMEOUT_DURATION) {
        signOut({ 
          callbackUrl: '/login?error=Sesión expirada por inactividad' 
        })
      }
    }, TIMEOUT_DURATION)
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

      // Iniciar el timeout
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

  // Verificar inactividad cada 10 segundos
  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        if (Date.now() - lastActivityRef.current >= TIMEOUT_DURATION) {
          signOut({ 
            callbackUrl: '/login?error=Sesión expirada por inactividad' 
          })
        }
      }, 10000) // Verificar cada 10 segundos

      return () => clearInterval(interval)
    }
  }, [session])

  return {
    lastActivity: lastActivityRef.current,
    timeUntilTimeout: Math.max(0, TIMEOUT_DURATION - (Date.now() - lastActivityRef.current))
  }
}
