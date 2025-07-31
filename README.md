# Sistema de Login Seguro - NextJS + PostgreSQL

Este proyecto implementa un sistema de autenticación web seguro con protección contra ataques de SQL Injection, encriptación de contraseñas y límite de intentos de login.

## Características

- **Autenticación Segura**: Sistema de login con NextAuth.js
- **Protección SQL Injection**: Uso de Prisma ORM con prepared statements
- **Encriptación BCrypt**: Contraseñas hasheadas con salt
- **Límite de Intentos**: Bloqueo temporal tras 5 intentos fallidos
- **Docker**: Contenedores para PostgreSQL y la aplicación
- **TypeScript**: Tipado completo para mayor seguridad
- **Tailwind CSS**: Interfaz moderna y responsiva

## Requisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd login-seguro-nextjs
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/login_secure"
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Ejecutar con Docker
```bash
# Construir y ejecutar los contenedores
docker-compose up --build

# En otra terminal, ejecutar las migraciones y seed
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

### 4. Acceder a la aplicación
Abre tu navegador en: http://localhost:3000

## Usuarios de Prueba

El sistema incluye usuarios predefinidos para pruebas:

| Email | Contraseña | Nombre |
|-------|------------|--------|
| admin@test.com | admin123 | Administrador |
| usuario@test.com | usuario123 | Usuario Test |
| maria@test.com | maria123 | María García |

## Medidas de Seguridad Implementadas

### 1. Protección contra SQL Injection
- **Prisma ORM**: Uso de prepared statements automáticos
- **Validación de entrada**: Validación con Zod
- **Escape de caracteres**: Manejo seguro de datos de entrada

### 2. Encriptación de Contraseñas
- **BCrypt**: Hashing con salt de 12 rondas
- **Almacenamiento seguro**: Solo hashes en la base de datos
- **Verificación segura**: Comparación de hashes

### 3. Límite de Intentos de Login
- **Contador de intentos**: Seguimiento de intentos fallidos
- **Bloqueo temporal**: 15 minutos tras 5 intentos fallidos
- **Reset automático**: Reseteo tras login exitoso

### 4. Gestión de Sesiones
- **JWT seguro**: Tokens con expiración
- **Protección de rutas**: Middleware de autenticación
- **Logout seguro**: Invalidación de sesiones

## Pruebas de SQL Injection

### Intentos de Ataque Documentados

1. **Inyección básica**:
   ```
   Email: admin@test.com' OR '1'='1
   Contraseña: cualquier
   ```
   **Resultado**: Bloqueado por validación de email

2. **Inyección con comentarios**:
   ```
   Email: admin@test.com'--
   Contraseña: cualquier
   ```
   **Resultado**: Bloqueado por validación de email

3. **Inyección UNION**:
   ```
   Email: ' UNION SELECT * FROM users--
   Contraseña: cualquier
   ```
   **Resultado**: Bloqueado por validación de email

### Verificación de Protección

Todas las consultas a la base de datos se realizan a través de Prisma, que automáticamente:
- Escapa caracteres especiales
- Utiliza prepared statements
- Previene inyecciones SQL

## Estructura del Proyecto

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # Configuración NextAuth
│   ├── dashboard/page.tsx               # Página de bienvenida
│   ├── login/page.tsx                   # Página de login
│   ├── globals.css                      # Estilos globales
│   ├── layout.tsx                       # Layout principal
│   └── page.tsx                         # Página principal
├── prisma/
│   ├── schema.prisma                    # Esquema de base de datos
│   └── seed.ts                          # Datos de prueba
├── types/
│   └── next-auth.d.ts                   # Tipos personalizados
├── docker-compose.yml                   # Configuración Docker
├── Dockerfile                           # Dockerfile de la app
└── package.json                         # Dependencias
```

## Comandos Útiles

```bash
# Desarrollo local
npm install
npm run dev

# Base de datos
npm run db:migrate    # Ejecutar migraciones
npm run db:generate   # Generar cliente Prisma
npm run db:seed       # Poblar con datos de prueba

# Docker
docker-compose up     # Levantar servicios
docker-compose down   # Detener servicios
docker-compose logs   # Ver logs
```

## Configuración de Desarrollo

### Instalación Local (sin Docker)
```bash
# Instalar dependencias
npm install

# Configurar base de datos PostgreSQL local
# Crear base de datos: login_secure

# Ejecutar migraciones
npm run db:migrate
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

## Entregables

- Código fuente del login implementado
- Base de datos con usuarios registrados
- Pruebas de SQL Injection documentadas
- Explicación de medidas de seguridad implementadas

## Seguridad Adicional

### Recomendaciones para Producción

1. **Variables de entorno**: Usar secretos reales y seguros
2. **HTTPS**: Configurar certificados SSL
3. **Rate limiting**: Implementar límites de velocidad
4. **Logs de seguridad**: Monitorear intentos de acceso
5. **Backup**: Respaldos regulares de la base de datos

### Monitoreo

- Logs de autenticación
- Intentos fallidos de login
- Bloqueos de cuenta
- Errores de base de datos

## Soporte

Para dudas o problemas, revisa:
1. Los logs de Docker: `docker-compose logs`
2. La documentación de NextAuth.js
3. La documentación de Prisma

---

**Desarrollado para la actividad de Calidad del Software**
*Implementación de un Login Seguro en una Aplicación Web* 