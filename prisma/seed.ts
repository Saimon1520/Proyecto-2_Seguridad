import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear permisos (UTN-05)
  console.log('📝 Creando permisos...')
  const permissions = [
    { name: 'crear', description: 'Permite crear registros' },
    { name: 'editar', description: 'Permite editar registros' },
    { name: 'borrar', description: 'Permite borrar registros' },
    { name: 'ver_reportes', description: 'Permite acceder a las listas' }
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
  const verReportesPermission = await prisma.permission.findUnique({ where: { name: 'ver_reportes' } })

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: auditorRole!.id,
        permissionId: verReportesPermission!.id
      }
    },
    update: {},
    create: {
      roleId: auditorRole!.id,
      permissionId: verReportesPermission!.id
    }
  })

  // Registrador: crear, editar, borrar productos y ver reportes
  const registradorRole = await prisma.role.findUnique({ where: { name: 'Registrador' } })
  const productPermissions = await prisma.permission.findMany({
    where: {
      name: { in: ['crear', 'editar', 'borrar', 'ver_reportes'] }
    }
  })

  for (const permission of productPermissions) {
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