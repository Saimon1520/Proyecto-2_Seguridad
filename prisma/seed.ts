import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios de prueba con contraseñas encriptadas
  const users = [
    {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Administrador'
    },
    {
      email: 'usuario@test.com',
      password: 'usuario123',
      name: 'Usuario Test'
    },
    {
      email: 'maria@test.com',
      password: 'maria123',
      name: 'María García'
    }
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        loginAttempts: 0
      }
    })
  }

  // Crear productos de ejemplo
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