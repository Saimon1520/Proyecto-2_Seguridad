'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SessionSecurityInfo {
  isExpiringSoon: boolean
  timeUntilExpiry: number
  warningThreshold: number
  criticalThreshold: number
  showWarning: boolean
  showCritical: boolean
}

export function useSessionSecurity() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [securityInfo, setSecurityInfo] = useState<SessionSecurityInfo>({
    isExpiringSoon: false,
    timeUntilExpiry: 0,
    warningThreshold: parseInt(process.env.NEXT_PUBLIC_WARNING_THRESHOLD || '45'),
    criticalThreshold: parseInt(process.env.NEXT_PUBLIC_CRITICAL_THRESHOLD || '60'),
    showWarning: false,
    showCritical: false
  })

  useEffect(() => {
    if (!session?.expires) return

    const checkSessionExpiry = () => {
      const now = new Date()
      const expiryTime = new Date(session.expires)
      const timeUntilExpiry = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / 1000))

      const warningThreshold = parseInt(process.env.NEXT_PUBLIC_WARNING_THRESHOLD || '45')
      const criticalThreshold = parseInt(process.env.NEXT_PUBLIC_CRITICAL_THRESHOLD || '60')

      const isExpiringSoon = timeUntilExpiry <= warningThreshold
      const showWarning = timeUntilExpiry <= warningThreshold && timeUntilExpiry > criticalThreshold
      const showCritical = timeUntilExpiry <= criticalThreshold

      setSecurityInfo({
        isExpiringSoon,
        timeUntilExpiry,
        warningThreshold,
        criticalThreshold,
        showWarning,
        showCritical
      })

      // Si la sesión ha expirado, cerrar sesión automáticamente
      if (timeUntilExpiry <= 0) {
        signOut({ redirect: true, callbackUrl: '/login' })
        return
      }

      // Si está en umbral crítico, mostrar advertencia final
      if (showCritical) {
        console.warn(`⚠️ SESIÓN EXPIRANDO EN ${timeUntilExpiry} SEGUNDOS`)
      }
    }

    // Verificar inmediatamente
    checkSessionExpiry()

    // Verificar cada segundo
    const interval = setInterval(checkSessionExpiry, 1000)

    return () => clearInterval(interval)
  }, [session, router])

  const refreshSession = async () => {
    try {
      // Intentar refrescar la sesión
      await fetch('/api/auth/session', { method: 'GET' })
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Si falla el refresh, cerrar sesión
      signOut({ redirect: true, callbackUrl: '/login' })
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return {
    session,
    status,
    securityInfo,
    refreshSession,
    formatTime,
    signOut
  }
}
