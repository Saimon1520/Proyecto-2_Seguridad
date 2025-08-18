// Configuración del entorno usando variables del .env
export const ENV_CONFIG = {
  // Configuración de NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Configuración de base de datos
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Configuración de seguridad
  SESSION_EXPIRY: parseInt(process.env.SESSION_EXPIRY || '3600'), // 1 hora por defecto
  TOKEN_REFRESH_INTERVAL: parseInt(process.env.TOKEN_REFRESH_INTERVAL || '60'), // 60 segundos por defecto
  WARNING_THRESHOLD: parseInt(process.env.WARNING_THRESHOLD || '300'), // 5 minutos por defecto
  CRITICAL_THRESHOLD: parseInt(process.env.CRITICAL_THRESHOLD || '60'), // 1 minuto por defecto
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900'), // 15 minutos por defecto
  
  // Configuración del entorno
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuración de seguridad avanzada
  ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS === 'true',
  ENABLE_IP_CHECKING: process.env.ENABLE_IP_CHECKING === 'true',
  MAX_SESSIONS_PER_USER: parseInt(process.env.MAX_SESSIONS_PER_USER || '3'),
  ENABLE_SECURITY_AUDIT: process.env.ENABLE_SECURITY_AUDIT === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Configuración adicional
  SESSION_CHECK_INTERVAL: 10, // 10 segundos (fijo)
  NONCE_LENGTH: 13 // Longitud del nonce (fijo)
}
