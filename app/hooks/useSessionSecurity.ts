'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ENV_CONFIG } from '@/app/lib/env'

interface SessionUser {
  id: string
  email: string
  name: string
  username: string
  role: any
  sessionStart?: number
  lastRefresh?: number
  refreshCount?: number
  nonce?: string
}

// Claves para localStorage
const STORAGE_KEYS = {
  SESSION_START: 'session_start_time',
  LAST_REFRESH: 'last_refresh_time',
  REFRESH_COUNT: 'refresh_count',
  TIME_REMAINING: 'session_time_remaining'
}

export function useSessionSecurity() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(ENV_CONFIG.SESSION_EXPIRY)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(new Date())
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null)
  const [refreshCount, setRefreshCount] = useState<number>(0)

  // Función para obtener datos del localStorage
  const getStoredSessionData = () => {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START)
      const lastRefresh = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH)
      const refreshCount = localStorage.getItem(STORAGE_KEYS.REFRESH_COUNT)
      const timeRemaining = localStorage.getItem(STORAGE_KEYS.TIME_REMAINING)
      
      if (sessionStart && lastRefresh) {
        return {
          sessionStart: parseInt(sessionStart),
          lastRefresh: parseInt(lastRefresh),
          refreshCount: refreshCount ? parseInt(refreshCount) : 0,
          timeRemaining: timeRemaining ? parseInt(timeRemaining) : ENV_CONFIG.SESSION_EXPIRY
        }
      }
    } catch (error) {
      console.warn('Error al leer localStorage:', error)
    }
    
    return null
  }

  // Función para guardar datos en localStorage
  const saveSessionData = (data: {
    sessionStart: number
    lastRefresh: number
    refreshCount: number
    timeRemaining: number
  }) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_START, data.sessionStart.toString())
      localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, data.lastRefresh.toString())
      localStorage.setItem(STORAGE_KEYS.REFRESH_COUNT, data.refreshCount.toString())
      localStorage.setItem(STORAGE_KEYS.TIME_REMAINING, data.timeRemaining.toString())
    } catch (error) {
      console.warn('Error al guardar en localStorage:', error)
    }
  }

  // Función para limpiar datos del localStorage
  const clearSessionData = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_START)
      localStorage.removeItem(STORAGE_KEYS.LAST_REFRESH)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_COUNT)
      localStorage.removeItem(STORAGE_KEYS.TIME_REMAINING)
    } catch (error) {
      console.warn('Error al limpiar localStorage:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as SessionUser
      
      // Intentar recuperar datos de sesión del localStorage
      const storedData = getStoredSessionData()
      
      let sessionStart: number
      let lastRefresh: number
      let currentRefreshCount: number
      
      if (storedData) {
        // Usar datos almacenados si existen
        sessionStart = storedData.sessionStart
        lastRefresh = storedData.lastRefresh
        currentRefreshCount = storedData.refreshCount
        
        // Verificar si la sesión almacenada sigue siendo válida
        const now = Math.floor(Date.now() / 1000)
        const sessionAge = now - sessionStart
        
        if (sessionAge >= ENV_CONFIG.SESSION_EXPIRY) {
          // Sesión expirada, limpiar localStorage y cerrar sesión
          console.log('⏰ Sesión almacenada expirada, cerrando sesión...')
          clearSessionData()
          signOut({ redirect: true, callbackUrl: '/login' })
          return
        }
        
        // Usar tiempo restante almacenado
        setTimeRemaining(storedData.timeRemaining)
        console.log('📱 Sesión recuperada del localStorage, tiempo restante:', storedData.timeRemaining, 'segundos')
      } else {
        // Nueva sesión, inicializar datos
        sessionStart = user.sessionStart || Math.floor(Date.now() / 1000)
        lastRefresh = user.lastRefresh || Math.floor(Date.now() / 1000)
        currentRefreshCount = user.refreshCount || 0
        
        // Guardar datos iniciales en localStorage
        saveSessionData({
          sessionStart,
          lastRefresh,
          refreshCount: currentRefreshCount,
          timeRemaining: ENV_CONFIG.SESSION_EXPIRY
        })
        console.log('🆕 Nueva sesión iniciada, datos guardados en localStorage')
      }
      
      // Inicializar estado con datos recuperados
      setRefreshCount(currentRefreshCount)
      setLastRefreshTime(new Date(lastRefresh * 1000))
      
      // IMPORTANTE: NO cerrar sesión después de 60 segundos
      // Solo refrescar el token cada 60 segundos
      refreshIntervalRef.current = setInterval(() => {
        // Solo refrescar el token, NO cerrar sesión
        console.log('🔄 Refrescando token automáticamente...')
        
        const now = Math.floor(Date.now() / 1000)
        const newLastRefresh = now
        
        // Actualizar tiempo del último refresh
        setLastRefreshTime(new Date(newLastRefresh * 1000))
        setRefreshCount(prev => prev + 1)
        
        // Actualizar localStorage con nuevo refresh
        const updatedData = {
          sessionStart,
          lastRefresh: newLastRefresh,
          refreshCount: currentRefreshCount + 1,
          timeRemaining: timeRemaining
        }
        saveSessionData(updatedData)
        
        // NO recargar la página, solo refrescar el token
        // La sesión continúa activa
      }, ENV_CONFIG.TOKEN_REFRESH_INTERVAL * 1000)

      // Configurar verificación de expiración cada 10 segundos
      // IMPORTANTE: Solo verificar la expiración de la sesión completa (1 hora)
      sessionCheckIntervalRef.current = setInterval(() => {
        const now = Math.floor(Date.now() / 1000)
        const sessionAge = now - sessionStart
        
        // Solo cerrar sesión después de 1 hora completa
        if (sessionAge >= ENV_CONFIG.SESSION_EXPIRY) {
          console.log('⏰ Sesión expirada por tiempo completo (1 hora), cerrando sesión...')
          clearSessionData()
          signOut({ redirect: true, callbackUrl: '/login' })
          return
        }

        // Calcular tiempo restante de la sesión completa
        const remaining = ENV_CONFIG.SESSION_EXPIRY - sessionAge
        setTimeRemaining(remaining)
        
        // Ya no sobrescribimos lastRefreshTime aquí para no romper el contador
        // Tampoco recalculamos nextRefreshTime con valores obsoletos; los componentes calculan el countdown
      }, ENV_CONFIG.SESSION_CHECK_INTERVAL * 1000)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current)
        }
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
    
    // Limpiar localStorage al cerrar sesión
    clearSessionData()
    
    signOut({ redirect: true, callbackUrl: '/login' })
  }

  // Función para obtener información de seguridad
  const getSecurityInfo = () => {
    return {
      sessionExpiry: ENV_CONFIG.SESSION_EXPIRY,
      tokenRefreshInterval: ENV_CONFIG.TOKEN_REFRESH_INTERVAL,
      warningThreshold: ENV_CONFIG.WARNING_THRESHOLD,
      criticalThreshold: ENV_CONFIG.CRITICAL_THRESHOLD,
      isExpiringSoon: timeRemaining <= ENV_CONFIG.WARNING_THRESHOLD,
      isCritical: timeRemaining <= ENV_CONFIG.CRITICAL_THRESHOLD
    }
  }

  return {
    session,
    status,
    timeRemaining,
    lastRefreshTime,
    nextRefreshTime,
    refreshCount,
    formatTimeRemaining,
    handleSignOut,
    getSecurityInfo,
    isAuthenticated: status === 'authenticated'
  }
}
