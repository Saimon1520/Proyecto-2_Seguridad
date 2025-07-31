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

  console.log('✅ Seed completado exitosamente!')
  console.log('Usuarios creados:')
  console.log('- admin@test.com / admin123')
  console.log('- usuario@test.com / usuario123')
  console.log('- maria@test.com / maria123')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 