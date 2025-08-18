# 🔒 Sistema de Seguridad de Sesiones

## Descripción General

Este sistema implementa un mecanismo de seguridad robusto para las sesiones de usuario que incluye:

- **Refresh automático de tokens cada 60 segundos**
- **Expiración de sesión cada 1 hora**
- **Prevención de token stealing**
- **Notificaciones de expiración**
- **Middleware de seguridad en el servidor**

## 🚀 Características de Seguridad

### 1. Refresh Automático de Tokens
- **Frecuencia**: Cada 60 segundos
- **Propósito**: Mantener tokens frescos y prevenir ataques de replay
- **Implementación**: Automático en el cliente y servidor

### 2. Expiración de Sesión
- **Duración**: 1 hora (3600 segundos)
- **Comportamiento**: Cierre automático de sesión
- **Redirección**: Login obligatorio después de expirar

### 3. Prevención de Token Stealing
- **Nonce único**: Generado en cada refresh
- **Timestamp de emisión**: Actualizado en cada refresh
- **Contador de refreshes**: Rastrea el número de actualizaciones
- **Firma única**: Cada token tiene una firma diferente

### 4. Notificaciones de Usuario
- **Advertencia**: 5 minutos antes de expirar
- **Crítica**: 1 minuto antes de expirar
- **Countdown**: Tiempo restante en tiempo real
- **Indicador visual**: Barra de progreso y colores

## 📁 Archivos del Sistema

### Configuración Principal
- `app/lib/security.ts` - Constantes y funciones de seguridad
- `app/lib/auth.ts` - Configuración de NextAuth con seguridad
- `middleware.ts` - Verificación de seguridad en el servidor

### Componentes de UI
- `app/components/SecurityIndicator.tsx` - Indicador de seguridad principal
- `app/components/SessionExpiryNotification.tsx` - Notificaciones de expiración
- `app/components/AuthProvider.tsx` - Proveedor de autenticación con seguridad

### Hooks Personalizados
- `app/hooks/useSessionSecurity.ts` - Hook para manejo de seguridad de sesión

## ⚙️ Configuración

### Constantes de Seguridad (`app/lib/security.ts`)

```typescript
export const SECURITY_CONFIG = {
  SESSION_EXPIRY: 60 * 60,           // 1 hora
  TOKEN_REFRESH_INTERVAL: 60,         // 60 segundos
  WARNING_THRESHOLD: 5 * 60,          // 5 minutos
  CRITICAL_THRESHOLD: 60,             // 1 minuto
  SESSION_CHECK_INTERVAL: 10,         // 10 segundos
  MAX_LOGIN_ATTEMPTS: 5,              // 5 intentos
  LOCKOUT_DURATION: 15 * 60,          // 15 minutos
  NONCE_LENGTH: 13                    // Longitud del nonce
}
```

### Variables de Entorno

```env
NEXTAUTH_SECRET=tu_secreto_super_seguro
NEXTAUTH_URL=http://localhost:3000
```

## 🔄 Flujo de Funcionamiento

### 1. Inicio de Sesión
```
Usuario hace login → Token JWT creado → Timestamps inicializados
```

### 2. Durante la Sesión (Cada 60 segundos)
```
Verificar tiempo → Generar nuevo nonce → Actualizar timestamps → Refresh token
```

### 3. Verificación de Expiración (Cada 10 segundos)
```
Calcular tiempo restante → Mostrar advertencias → Forzar logout si expira
```

### 4. Expiración de Sesión
```
Sesión expira → Usuario redirigido → Login obligatorio → Nueva sesión
```

## 🛡️ Medidas de Seguridad

### Prevención de Ataques
- **Token Replay**: Nonce único en cada refresh
- **Session Hijacking**: Tokens que cambian constantemente
- **Timing Attacks**: Timestamps precisos y verificados
- **Brute Force**: Bloqueo temporal después de intentos fallidos

### Headers de Seguridad
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Política estricta de contenido
- **Referrer-Policy**: strict-origin-when-cross-origin

## 📊 Monitoreo y Logs

### Logs del Servidor
```
Token refrescado para usuario user@example.com - Refresh #15 - Nonce: abc123def456
Sesión expirada para usuario user@example.com - Edad: 3605s
```

### Logs del Cliente
```
Refrescando página para mantener tokens seguros...
Sesión expirada por tiempo, cerrando sesión...
```

## 🚨 Casos de Uso

### 1. Usuario Activo
- Token se refresca automáticamente cada 60 segundos
- Indicador muestra tiempo restante
- No interrupciones en el trabajo

### 2. Usuario Inactivo
- Advertencia a los 5 minutos
- Advertencia crítica a 1 minuto
- Logout automático al expirar

### 3. Múltiples Navegadores
- Cada navegador tiene su propia sesión
- Tokens independientes y únicos
- No hay conflicto entre sesiones

## 🔧 Personalización

### Cambiar Tiempos
```typescript
// En app/lib/security.ts
export const SECURITY_CONFIG = {
  SESSION_EXPIRY: 30 * 60,        // 30 minutos
  TOKEN_REFRESH_INTERVAL: 30,      // 30 segundos
  WARNING_THRESHOLD: 2 * 60,       // 2 minutos
  // ... resto de configuración
}
```

### Agregar Nuevas Medidas
```typescript
// En app/lib/security.ts
export const SECURITY_CONFIG = {
  // ... configuración existente
  ENABLE_IP_CHECKING: true,
  MAX_SESSIONS_PER_USER: 3,
  GEO_BLOCKING: false
}
```

## 📈 Beneficios

### Para el Usuario
- **Transparencia**: Sabe cuánto tiempo le queda
- **Advertencias**: Tiempo para guardar trabajo
- **Seguridad**: Confianza en la protección de datos

### Para el Sistema
- **Seguridad**: Tokens que cambian constantemente
- **Auditoría**: Logs detallados de actividad
- **Prevención**: Múltiples capas de protección
- **Escalabilidad**: Sistema configurable y extensible

## 🚀 Implementación

### 1. Instalación
```bash
# Los componentes ya están integrados en la aplicación
# Solo asegúrate de que las dependencias estén instaladas
npm install next-auth bcryptjs @prisma/client
```

### 2. Configuración
```bash
# Configurar variables de entorno
cp env.example .env
# Editar .env con tus valores
```

### 3. Verificación
```bash
# Ejecutar la aplicación
docker-compose up -d
# Verificar en http://localhost:3000
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Tokens no se refrescan
- Verificar `TOKEN_REFRESH_INTERVAL` en configuración
- Revisar logs del servidor
- Verificar que el usuario esté autenticado

#### 2. Sesiones expiran muy rápido
- Verificar `SESSION_EXPIRY` en configuración
- Revisar timezone del servidor
- Verificar logs de middleware

#### 3. Notificaciones no aparecen
- Verificar que `SecurityIndicator` esté en el DOM
- Revisar consola del navegador
- Verificar permisos de notificaciones

### Logs de Debug
```typescript
// Agregar en app/lib/auth.ts
console.log('Debug - Token refresh:', {
  email: token.email,
  sessionAge: now - token.sessionStart,
  timeSinceLastRefresh: now - token.lastRefresh,
  needsRefresh: timeSinceLastRefresh >= SECURITY_CONFIG.TOKEN_REFRESH_INTERVAL
})
```

## 📚 Referencias

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Session Security Guidelines](https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🤝 Contribución

Para contribuir al sistema de seguridad:

1. Crear issue con descripción del problema/mejora
2. Fork del repositorio
3. Crear branch para la feature
4. Implementar cambios con tests
5. Crear Pull Request con descripción detallada

## 📄 Licencia

Este sistema de seguridad está bajo la misma licencia que el proyecto principal.
