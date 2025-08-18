// Configuración de seguridad para la aplicación
export const SECURITY_CONFIG = {
  // Tiempo de expiración de sesión (1 hora)
  SESSION_EXPIRY: 60 * 60, // segundos
  
  // Intervalo de refresh de tokens (60 segundos)
  TOKEN_REFRESH_INTERVAL: 60, // segundos
  
  // Tiempo de advertencia antes de expirar (5 minutos)
  WARNING_THRESHOLD: 5 * 60, // segundos
  
  // Tiempo crítico antes de expirar (1 minuto)
  CRITICAL_THRESHOLD: 60, // segundos
  
  // Intervalo de verificación de sesión (10 segundos)
  SESSION_CHECK_INTERVAL: 10, // segundos
  
  // Máximo número de intentos de login antes del bloqueo
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Tiempo de bloqueo después de intentos fallidos (15 minutos)
  LOCKOUT_DURATION: 15 * 60, // segundos
  
  // Longitud del nonce para tokens
  NONCE_LENGTH: 13,
  
  // Headers de seguridad
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  }
}

// Función para generar nonce único
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 2 + SECURITY_CONFIG.NONCE_LENGTH)
}

// Función para verificar si la sesión está por expirar
export function isSessionExpiringSoon(sessionStart: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const sessionAge = now - sessionStart
  return sessionAge >= (SECURITY_CONFIG.SESSION_EXPIRY - SECURITY_CONFIG.WARNING_THRESHOLD)
}

// Función para verificar si la sesión está en estado crítico
export function isSessionCritical(sessionStart: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const sessionAge = now - sessionStart
  return sessionAge >= (SECURITY_CONFIG.SESSION_EXPIRY - SECURITY_CONFIG.CRITICAL_THRESHOLD)
}

// Función para calcular tiempo restante de sesión
export function getSessionTimeRemaining(sessionStart: number): number {
  const now = Math.floor(Date.now() / 1000)
  const sessionAge = now - sessionStart
  return Math.max(0, SECURITY_CONFIG.SESSION_EXPIRY - sessionAge)
}

// Función para verificar si el token necesita refresh
export function needsTokenRefresh(lastRefresh: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const timeSinceLastRefresh = now - lastRefresh
  return timeSinceLastRefresh >= SECURITY_CONFIG.TOKEN_REFRESH_INTERVAL
}
