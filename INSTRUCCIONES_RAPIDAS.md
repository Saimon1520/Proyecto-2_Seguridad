# 🚀 Instrucciones Rápidas - Sistema de Login Seguro

## ⚡ Inicio Rápido (Windows)

### Opción 1: Scripts Automáticos
1. **Ejecutar `start.bat`** - Inicia todos los servicios
2. **Ejecutar `setup-db.bat`** - Configura la base de datos
3. **Abrir http://localhost:3000** - Acceder a la aplicación

### Opción 2: Comandos Manuales
```bash
# 1. Crear archivo .env
copy env.example .env

# 2. Iniciar servicios
docker-compose up --build -d

# 3. Configurar base de datos
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed

# 4. Acceder a la aplicación
# Abrir: http://localhost:3000
```

## 👥 Usuarios de Prueba

| Email | Contraseña | Nombre | Username | Rol | Permisos |
|-------|------------|--------|----------|-----|----------|
| admin@test.com | admin123 | Administrador | admin | SuperAdmin | Todos los permisos |
| auditor@test.com | auditor123 | Auditor Test | auditor | Auditor | Solo ver reportes |
| registrador@test.com | registrador123 | Registrador Test | registrador | Registrador | Crear, editar, borrar productos y ver reportes |
| usuario@test.com | usuario123 | Usuario Test | usuario | Registrador | Crear, editar, borrar productos y ver reportes |
| maria@test.com | maria123 | María García | maria | Auditor | Solo ver reportes |

## 🎯 Funcionalidades por Rol

### SuperAdmin
- ✅ Crear, editar y borrar usuarios
- ✅ Crear, editar y borrar roles
- ✅ Asignar permisos a roles
- ✅ Asignar roles a usuarios
- ✅ Ver reportes (usuarios y productos)
- ✅ Gestión completa de productos

### Auditor
- ❌ No puede crear, editar o borrar usuarios
- ❌ No puede gestionar roles
- ✅ Solo puede ver listas de usuarios y productos

### Registrador
- ❌ No puede gestionar usuarios
- ❌ No puede gestionar roles
- ✅ Puede crear, editar y borrar productos
- ✅ Puede ver lista de usuarios

## 🧪 Pruebas de Seguridad

### Pruebas de SQL Injection
Intentar estos payloads en el campo email:
- `admin@test.com' OR '1'='1`
- `admin@test.com'--`
- `' UNION SELECT * FROM users--`

**Resultado esperado**: Todos bloqueados por validación de email

### Pruebas de Fuerza Bruta
1. Intentar login 5 veces con contraseña incorrecta
2. La cuenta se bloquea por 15 minutos
3. Mensaje: "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos."

### Pruebas de Acceso
1. **Sin login**: Ir a `/dashboard` → Redirigido a `/login`
2. **Con login**: Acceso permitido → Mensaje "Usuario logueado satisfactoriamente"

### Pruebas de Permisos
1. **Auditor**: Solo puede ver listas, no puede crear/editar/borrar
2. **Registrador**: Puede gestionar productos pero no usuarios
3. **SuperAdmin**: Acceso completo a todas las funcionalidades

## 🔧 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Acceder al contenedor
docker-compose exec app sh

# Ver estado de servicios
docker-compose ps
```

## 📁 Archivos Importantes

- `docker-compose.yml` - Configuración de servicios
- `prisma/schema.prisma` - Esquema de base de datos
- `app/api/auth/[...nextauth]/route.ts` - Configuración de autenticación
- `app/api/users/route.ts` - API de gestión de usuarios
- `app/users/page.tsx` - Página de gestión de usuarios
- `app/dashboard/page.tsx` - Dashboard principal

## 🛡️ Medidas de Seguridad

✅ **Protección SQL Injection**: Prisma ORM con prepared statements  
✅ **Encriptación BCrypt**: Contraseñas hasheadas con salt  
✅ **Límite de Intentos**: Bloqueo tras 5 intentos fallidos  
✅ **Validación de Entrada**: Zod para validación robusta  
✅ **Rutas Protegidas**: Middleware de autenticación  

## 🆘 Solución de Problemas

### Error: "Connection refused"
```bash
# Verificar que Docker esté ejecutándose
docker --version

# Reiniciar servicios
docker-compose down
docker-compose up --build
```

### Error: "Database not found"
```bash
# Ejecutar migraciones
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

### Error: "Invalid credentials"
- Verificar que el archivo `.env` existe
- Usar usuarios de prueba correctos
- Verificar que la base de datos esté poblada

## 📞 Soporte

1. Revisar logs: `docker-compose logs -f`
2. Verificar estado: `docker-compose ps`
3. Consultar documentación completa: `README.md`
4. Revisar pruebas de seguridad: `PRUEBAS_SEGURIDAD.md`

---

**¡Listo para usar!** 🎉 