import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear permisos específicos y organizados
  console.log('📝 Creando permisos específicos...')
  const permissions = [
    // Gestión de Productos
    { name: 'productos_crear', description: 'Crear productos' },
    { name: 'productos_editar', description: 'Editar productos' },
    { name: 'productos_borrar', description: 'Eliminar productos' },
    { name: 'productos_ver', description: 'Ver lista de productos' },
    
    // Gestión de Usuarios
    { name: 'usuarios_ver', description: 'Ver usuarios' },
    { name: 'usuarios_editar', description: 'Editar usuarios' },
    { name: 'usuarios_crear', description: 'Crear usuarios' },
    { name: 'usuarios_borrar', description: 'Borrar usuarios' },
    
    // Gestión de Roles
    { name: 'roles_ver', description: 'Ver roles' },
    { name: 'roles_editar', description: 'Editar roles' },
    { name: 'roles_crear', description: 'Crear roles' },
    { name: 'roles_borrar', description: 'Borrar roles' },
    
    // Reportes
    { name: 'reportes_productos', description: 'Ver lista de productos' },
    { name: 'reportes_usuarios', description: 'Ver lista de usuarios' }
  ]

  for (const permData of permissions) {
    await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: permData
    })
  }

  // Crear roles (UTN-06)
  console.log('👥 Creando roles...')
  const roles = [
    { name: 'SuperAdmin', description: 'Administrador con todos los permisos' },
    { name: 'Auditor', description: 'Solo puede ver listas de usuarios y productos' },
    { name: 'Registrador', description: 'Puede gestionar productos y ver usuarios' }
  ]

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData
    })
  }

  // Asignar permisos a roles
  console.log('🔗 Asignando permisos a roles...')

  // SuperAdmin: todos los permisos
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SuperAdmin' } })
  const allPermissions = await prisma.permission.findMany()

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole!.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: superAdminRole!.id,
        permissionId: permission.id
      }
    })
  }

  // Auditor: solo ver reportes
  const auditorRole = await prisma.role.findUnique({ where: { name: 'Auditor' } })
  const reportPermissions = await prisma.permission.findMany({
    where: {
      name: { in: ['reportes_productos', 'reportes_usuarios'] }
    }
  })

  for (const permission of reportPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: auditorRole!.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: auditorRole!.id,
        permissionId: permission.id
      }
    })
  }

  // Registrador: gestión de productos y ver usuarios
  const registradorRole = await prisma.role.findUnique({ where: { name: 'Registrador' } })
  const registradorPermissions = await prisma.permission.findMany({
    where: {
      name: { in: ['productos_crear', 'productos_editar', 'productos_borrar', 'reportes_usuarios'] }
    }
  })

  for (const permission of registradorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: registradorRole!.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: registradorRole!.id,
        permissionId: permission.id
      }
    })
  }

  // Crear usuarios de prueba con roles
  console.log('👤 Creando usuarios de prueba...')
  const users = [
    {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Administrador',
      username: 'admin',
      roleName: 'SuperAdmin'
    },
    {
      email: 'auditor@test.com',
      password: 'auditor123',
      name: 'Auditor Test',
      username: 'auditor',
      roleName: 'Auditor'
    },
    {
      email: 'registrador@test.com',
      password: 'registrador123',
      name: 'Registrador Test',
      username: 'registrador',
      roleName: 'Registrador'
    },
    {
      email: 'usuario@test.com',
      password: 'usuario123',
      name: 'Usuario Test',
      username: 'usuario',
      roleName: 'Registrador'
    },
    {
      email: 'maria@test.com',
      password: 'maria123',
      name: 'María García',
      username: 'maria',
      roleName: 'Auditor'
    }
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const role = await prisma.role.findUnique({ where: { name: userData.roleName } })

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        username: userData.username,
        loginAttempts: 0,
        roleId: role?.id
      }
    })
  }

  // Crear productos de ejemplo
  console.log('📦 Creando productos de ejemplo...')
  const products = [
    {
      code: 'PROD001',
      name: 'Laptop HP Pavilion',
      description: 'Laptop de 15 pulgadas con procesador Intel i5',
      quantity: 10,
      price: 899.99
    },
    {
      code: 'PROD002',
      name: 'Mouse Inalámbrico Logitech',
      description: 'Mouse inalámbrico con sensor óptico de alta precisión',
      quantity: 25,
      price: 29.99
    },
    {
      code: 'PROD003',
      name: 'Teclado Mecánico RGB',
      description: 'Teclado mecánico con switches Cherry MX y retroiluminación RGB',
      quantity: 15,
      price: 149.99
    },
    {
      code: 'PROD004',
      name: 'Monitor Samsung 24"',
      description: 'Monitor LED de 24 pulgadas con resolución Full HD',
      quantity: 8,
      price: 199.99
    },
    {
      code: 'PROD005',
      name: 'Disco Duro Externo 1TB',
      description: 'Disco duro externo portátil de 1TB con conexión USB 3.0',
      quantity: 20,
      price: 59.99
    }
  ]

  for (const productData of products) {
    await prisma.product.upsert({
      where: { code: productData.code },
      update: {},
      create: productData
    })
  }

  console.log('✅ Seed completado exitosamente!')
  console.log('Usuarios creados:')
  console.log('- admin@test.com / admin123')
  console.log('- usuario@test.com / usuario123')
  console.log('- maria@test.com / maria123')
  console.log('Productos creados:')
  console.log('- PROD001: Laptop HP Pavilion')
  console.log('- PROD002: Mouse Inalámbrico Logitech')
  console.log('- PROD003: Teclado Mecánico RGB')
  console.log('- PROD004: Monitor Samsung 24"')
  console.log('- PROD005: Disco Duro Externo 1TB')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 