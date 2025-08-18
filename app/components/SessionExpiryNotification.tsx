'use client'

import { useSessionSecurity } from '@/app/hooks/useSessionSecurity'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { SECURITY_CONFIG } from '@/app/lib/security'

export default function SessionExpiryNotification() {
  const { timeRemaining, isAuthenticated } = useSessionSecurity()
  const [showWarning, setShowWarning] = useState(false)
  const [showCritical, setShowCritical] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return

    // Mostrar advertencia cuando quedan 5 minutos
    if (timeRemaining <= SECURITY_CONFIG.WARNING_THRESHOLD && timeRemaining > SECURITY_CONFIG.CRITICAL_THRESHOLD) {
      setShowWarning(true)
      setShowCritical(false)
    }
    // Mostrar advertencia crítica cuando quedan menos de 1 minuto
    else if (timeRemaining <= SECURITY_CONFIG.CRITICAL_THRESHOLD) {
      setShowWarning(false)
      setShowCritical(true)
      setCountdown(timeRemaining)
    }
    // Ocultar advertencias cuando hay suficiente tiempo
    else {
      setShowWarning(false)
      setShowCritical(false)
    }
  }, [timeRemaining, isAuthenticated])

  // Countdown para advertencia crítica
  useEffect(() => {
    if (!showCritical) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Sesión expirada, forzar logout
          signOut({ redirect: true, callbackUrl: '/login?error=session_expired' })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showCritical])

  if (!isAuthenticated) return null

  return (
    <>
      {/* Advertencia de 5 minutos */}
      {showWarning && (
        <div className="fixed top-20 right-4 z-50 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 max-w-sm shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⏰ Sesión expirando pronto
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>Tu sesión expirará en {Math.floor(timeRemaining / 60)} minutos.</p>
                <p className="mt-1">Se recomienda guardar tu trabajo.</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-sm text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-400"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertencia crítica de 1 minuto */}
      {showCritical && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 max-w-sm shadow-lg animate-pulse">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                ⚠️ Sesión expirando críticamente
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Tu sesión expirará en <span className="font-bold">{countdown}</span> segundos.</p>
                <p className="mt-1">Serás redirigido al login automáticamente.</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
                >
                  Cerrar sesión ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
