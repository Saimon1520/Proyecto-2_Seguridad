# 🔍 Comandos para Verificar la Base de Datos

Este archivo contiene todos los comandos necesarios para verificar que las contraseñas están encriptadas y revisar todos los datos del sistema.

## 📋 **COMANDOS INDIVIDUALES**

### 1️⃣ **Ver Usuarios y Contraseñas Encriptadas**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT email, username, password FROM users;"
```

### 2️⃣ **Ver Productos**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT * FROM products;"
```

### 3️⃣ **Ver Roles**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT * FROM roles;"
```

### 4️⃣ **Ver Permisos**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT * FROM permissions;"
```

### 5️⃣ **Ver Relación Roles-Permisos**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT r.name as role, p.name as permission FROM role_permissions rp JOIN roles r ON rp.\"roleId\" = r.id JOIN permissions p ON rp.\"permissionId\" = p.id ORDER BY r.name;"
```

### 6️⃣ **Ver Usuarios con sus Roles**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT u.email, u.username, r.name as role FROM users u LEFT JOIN roles r ON u.\"roleId\" = r.id;"
```

## 🚀 **COMANDO COMPLETO (TODO EN UNO)**

```bash
docker exec -it login_db psql -U postgres -d login_secure -c "
\echo '=== USUARIOS Y CONTRASEÑAS ENCRIPTADAS ==='
SELECT email, username, substring(password, 1, 30) || '...' as password_hash FROM users;
\echo ''
\echo '=== PRODUCTOS ==='
SELECT code, name, price, quantity FROM products;
\echo ''
\echo '=== ROLES ==='
SELECT name, description FROM roles;
\echo ''
\echo '=== PERMISOS ==='
SELECT name, description FROM permissions;
\echo ''
\echo '=== USUARIOS CON ROLES ==='
SELECT u.email, u.username, r.name as role FROM users u LEFT JOIN roles r ON u.\"roleId\" = r.id;
\echo ''
\echo '=== ROLES Y SUS PERMISOS ==='
SELECT r.name as role, p.name as permission FROM role_permissions rp JOIN roles r ON rp.\"roleId\" = r.id JOIN permissions p ON rp.\"permissionId\" = p.id ORDER BY r.name;
"
```

## ✅ **VERIFICACIÓN DE ENCRIPTACIÓN**

### **Comando para verificar solo las contraseñas encriptadas:**
```bash
docker exec -it login_db psql -U postgres -d login_secure -c "SELECT email, username, substring(password, 1, 20) || '...' as hash_inicio, length(password) as longitud_hash FROM users;"
```

### **Explicación de lo que verás:**
- **Formato esperado**: `$2a$12$...` (bcrypt con 12 rondas)
- **Longitud**: 60 caracteres exactos
- **Contenido**: Mezcla aleatoria de letras, números y símbolos
- **Irreversible**: No se puede obtener la contraseña original

## 🔐 **CARACTERÍSTICAS DE SEGURIDAD IMPLEMENTADAS**

1. **Encriptación bcrypt**: 12 rondas de salt
2. **Hashes únicos**: Cada contraseña tiene un hash diferente
3. **No texto plano**: Las contraseñas originales no se almacenan
4. **Protección contra ataques**: Rainbow tables, fuerza bruta, etc.

## 📝 **NOTAS**

- Todos los comandos requieren que Docker esté ejecutándose
- El contenedor de la base de datos debe llamarse `login_db`
- Los comandos son de solo lectura y no modifican datos
- Si ves hashes como `$2a$12$...` entonces las contraseñas están correctamente encriptadas

## 🛠️ **COMANDOS DE GESTIÓN**

### **Ver contenedores activos:**
```bash
docker ps
```

### **Iniciar la aplicación completa:**
```bash
docker-compose up -d
```

### **Detener la aplicación:**
```bash
docker-compose down
```

### **Ver logs de la aplicación:**
```bash
docker logs login_app
```

### **Ver logs de la base de datos:**
```bash
docker logs login_db
```
