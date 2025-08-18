# Pruebas de Seguridad - UTN-07

## 🧪 Guía Completa de Pruebas de Seguridad

Este documento contiene todas las pruebas necesarias para verificar que las medidas de seguridad de la UTN-07 estén funcionando correctamente.

## 📋 Checklist de Verificación

### ✅ 1. Protección contra SQL Injection
- [ ] Prueba de inyección básica
- [ ] Prueba de inyección con comentarios
- [ ] Prueba de inyección en campos de búsqueda
- [ ] Verificación de logs seguros

### ✅ 2. Protección contra Cross-Site Scripting (XSS)
- [ ] Prueba de script en campos de texto
- [ ] Prueba de HTML malicioso
- [ ] Verificación de sanitización
- [ ] Verificación de headers CSP

### ✅ 3. Timeout de Sesión por Inactividad
- [ ] Verificación de timeout de 1 minuto
- [ ] Prueba de reinicio de timer
- [ ] Verificación de logout automático
- [ ] Prueba de actividad del usuario

### ✅ 4. Autenticación Obligatoria
- [ ] Acceso a rutas protegidas sin login
- [ ] Verificación de redirección a login
- [ ] Acceso a APIs sin autenticación
- [ ] Verificación de middleware

### ✅ 5. Control de Acceso Basado en Roles
- [ ] Acceso con usuario sin permisos
- [ ] Verificación de ocultación de UI
- [ ] Acceso a APIs sin autorización
- [ ] Prueba de diferentes roles

### ✅ 6. Cookies Seguras
- [ ] Verificación de flags httpOnly
- [ ] Verificación de flags secure
- [ ] Verificación de sameSite
- [ ] Verificación de nombres seguros

## 🚀 Ejecución de Pruebas

### Requisitos Previos
1. Aplicación ejecutándose en Docker
2. Base de datos con datos de prueba
3. Usuarios con diferentes roles creados
4. Herramientas de desarrollo del navegador

### Usuarios de Prueba Recomendados
```json
{
  "admin": {
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin",
    "permissions": ["crear", "editar", "borrar", "ver_reportes"]
  },
  "usuario": {
    "email": "usuario@test.com", 
    "password": "usuario123",
    "role": "usuario",
    "permissions": ["crear", "editar"]
  },
  "lector": {
    "email": "lector@test.com",
    "password": "lector123", 
    "role": "lector",
    "permissions": ["ver_reportes"]
  }
}
```

## 🔍 Pruebas Detalladas

### 1. Protección contra SQL Injection

#### Prueba 1.1: Inyección en Login
**Objetivo**: Verificar que no se pueda hacer SQL injection en el formulario de login

**Pasos**:
1. Ir a `/login`
2. Intentar con email: `admin@test.com' OR '1'='1`
3. Contraseña: `cualquier`

**Resultado Esperado**:
- Error de validación de email
- No se ejecuta SQL malicioso
- Log seguro sin información sensible

**Verificación**:
```bash
# Verificar logs de la aplicación
docker-compose logs app | grep "Error en autenticación"
```

#### Prueba 1.2: Inyección en Búsqueda de Usuarios
**Objetivo**: Verificar protección en APIs de búsqueda

**Pasos**:
1. Loguearse como admin
2. Ir a `/users`
3. Usar herramientas de desarrollo para interceptar requests
4. Modificar parámetros de búsqueda con SQL malicioso

**Resultado Esperado**:
- Error de validación
- No se ejecuta SQL malicioso
- Respuesta de error genérica

### 2. Protección contra Cross-Site Scripting (XSS)

#### Prueba 2.1: Script en Campo de Nombre
**Objetivo**: Verificar que no se ejecute JavaScript malicioso

**Pasos**:
1. Loguearse como admin
2. Ir a crear/editar usuario
3. En campo nombre: `<script>alert('XSS')</script>`
4. Guardar y verificar

**Resultado Esperado**:
- El script se sanitiza
- No se ejecuta JavaScript
- Se muestra texto plano

#### Prueba 2.2: HTML Malicioso en Descripción
**Objetivo**: Verificar sanitización de HTML

**Pasos**:
1. Crear/editar producto
2. En descripción: `<img src="x" onerror="alert('XSS')">`
3. Guardar y verificar

**Resultado Esperado**:
- HTML malicioso se elimina
- Solo se permiten tags seguros
- No se ejecuta JavaScript

### 3. Timeout de Sesión por Inactividad

#### Prueba 3.1: Timeout de 1 Minuto
**Objetivo**: Verificar que la sesión expire tras 1 minuto sin actividad

**Pasos**:
1. Loguearse en la aplicación
2. No mover mouse, no escribir, no hacer scroll
3. Esperar 1 minuto
4. Verificar logout automático

**Resultado Esperado**:
- Sesión expira en exactamente 60 segundos
- Usuario es redirigido a login
- Mensaje: "Sesión expirada por inactividad"

#### Prueba 3.2: Reinicio de Timer
**Objetivo**: Verificar que la actividad del usuario reinicie el timer

**Pasos**:
1. Loguearse en la aplicación
2. Esperar 30 segundos
3. Mover el mouse o hacer clic
4. Verificar que el timer se reinicie

**Resultado Esperado**:
- Timer se reinicia con actividad
- Sesión no expira
- Contador de tiempo se actualiza

### 4. Autenticación Obligatoria

#### Prueba 4.1: Acceso Directo a Dashboard
**Objetivo**: Verificar que no se pueda acceder sin login

**Pasos**:
1. Cerrar sesión
2. Ir directamente a `/dashboard`
3. Verificar redirección

**Resultado Esperado**:
- Redirección automática a `/login`
- Mensaje: "Debe iniciar sesión para acceder a esta página"
- No se muestra contenido del dashboard

#### Prueba 4.2: Acceso a APIs sin Autenticación
**Objetivo**: Verificar protección de APIs

**Pasos**:
1. Sin estar logueado
2. Hacer request directo a `/api/users`
3. Verificar respuesta

**Resultado Esperado**:
- Status 401: No autorizado
- Mensaje de error genérico
- No se devuelven datos

### 5. Control de Acceso Basado en Roles

#### Prueba 5.1: Usuario sin Permisos de Creación
**Objetivo**: Verificar que usuarios sin permisos no vean funcionalidades

**Pasos**:
1. Loguearse como usuario "lector"
2. Ir al dashboard
3. Verificar botones ocultos

**Resultado Esperado**:
- Botón "Gestión de Usuarios" no visible
- Botón "Gestión de Productos" no visible
- Solo se muestran funcionalidades permitidas

#### Prueba 5.2: Acceso a API sin Permisos
**Objetivo**: Verificar protección a nivel de API

**Pasos**:
1. Loguearse como usuario sin permisos de creación
2. Intentar crear usuario via API
3. Verificar respuesta

**Resultado Esperado**:
- Status 403: Prohibido
- Mensaje: "No tiene permisos para crear usuarios"
- No se crea el usuario

### 6. Cookies Seguras

#### Prueba 6.1: Verificación de Flags de Cookies
**Objetivo**: Verificar configuración segura de cookies

**Pasos**:
1. Loguearse en la aplicación
2. Abrir herramientas de desarrollo
3. Ir a pestaña Application > Cookies
4. Verificar flags de cookies

**Resultado Esperado**:
- `httpOnly: true` en cookies de sesión
- `secure: true` en producción
- `sameSite: lax`
- Nombres con prefijos seguros

#### Prueba 6.2: Acceso a Cookies desde JavaScript
**Objetivo**: Verificar que cookies httpOnly no sean accesibles

**Pasos**:
1. En consola del navegador
2. Ejecutar: `document.cookie`
3. Verificar que no aparezcan cookies de sesión

**Resultado Esperado**:
- Cookies de sesión no visibles
- Solo cookies públicas visibles
- Protección contra XSS en cookies

## 🛠️ Herramientas de Prueba

### Navegador
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector

### APIs
- Postman
- cURL
- Insomnia

### Seguridad
- OWASP ZAP
- Burp Suite Community
- Browser Developer Tools

## 📊 Criterios de Éxito

### Para Cada Prueba
- [ ] **Funcionalidad**: La medida de seguridad funciona correctamente
- [ ] **Performance**: No hay degradación significativa del rendimiento
- [ ] **UX**: La experiencia del usuario no se ve comprometida
- [ ] **Logs**: Se registran eventos de seguridad apropiadamente
- [ ] **Errores**: Los errores se manejan de forma segura

### Métricas de Seguridad
- **Tiempo de timeout**: 60 ± 5 segundos
- **Tasa de bloqueo XSS**: 100%
- **Tasa de bloqueo SQL Injection**: 100%
- **Tiempo de respuesta de autenticación**: < 2 segundos
- **Cobertura de permisos**: 100%

## 🚨 Casos de Error

### Errores Comunes
1. **Timeout no funciona**: Verificar configuración de NextAuth
2. **XSS no se bloquea**: Verificar instalación de DOMPurify
3. **Permisos no se verifican**: Verificar PermissionGuard
4. **Cookies no seguras**: Verificar configuración de NextAuth

### Soluciones
1. **Reiniciar aplicación**: `docker-compose restart app`
2. **Verificar logs**: `docker-compose logs app`
3. **Verificar dependencias**: `npm list isomorphic-dompurify`
4. **Verificar variables de entorno**: `.env`

## 📝 Reporte de Pruebas

### Template de Reporte
```markdown
# Reporte de Pruebas de Seguridad - UTN-07

**Fecha**: [Fecha de ejecución]
**Ejecutado por**: [Nombre del tester]
**Versión del sistema**: [Versión]

## Resumen
- Total de pruebas: [X]
- Exitosas: [X]
- Fallidas: [X]
- Cumplimiento: [X]%

## Detalles por Categoría
1. **SQL Injection**: [Estado] - [Comentarios]
2. **XSS**: [Estado] - [Comentarios]
3. **Timeout de Sesión**: [Estado] - [Comentarios]
4. **Autenticación**: [Estado] - [Comentarios]
5. **Control de Acceso**: [Estado] - [Comentarios]
6. **Cookies**: [Estado] - [Comentarios]

## Problemas Encontrados
- [Lista de problemas]

## Recomendaciones
- [Lista de mejoras]

## Conclusión
[Estado general del sistema de seguridad]
```

## 🎯 Próximos Pasos

### Después de las Pruebas
1. **Documentar resultados** en el reporte
2. **Reportar problemas** encontrados
3. **Implementar mejoras** si es necesario
4. **Re-ejecutar pruebas** después de cambios
5. **Actualizar documentación** según resultados

### Mantenimiento Continuo
- **Ejecutar pruebas** semanalmente
- **Monitorear logs** de seguridad
- **Actualizar dependencias** regularmente
- **Revisar políticas** de seguridad
- **Capacitar equipo** en seguridad

---

**Nota**: Estas pruebas deben ejecutarse en un entorno de desarrollo, nunca en producción. Para pruebas de producción, usar datos anónimos y entornos aislados.
