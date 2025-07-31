import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        try {
          // Buscar usuario por email usando Prisma (protección contra SQL Injection)
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            throw new Error('Usuario no encontrado')
          }

          // Verificar si la cuenta está bloqueada
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('Cuenta bloqueada temporalmente. Intente más tarde.')
          }

          // Verificar contraseña usando bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            // Incrementar intentos de login fallidos
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: user.loginAttempts + 1,
                lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null // Bloquear por 15 minutos después de 5 intentos
              }
            })

            if (user.loginAttempts >= 4) {
              throw new Error('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.')
            }

            throw new Error('Contraseña incorrecta')
          }

          // Resetear intentos de login si la autenticación es exitosa
          if (user.loginAttempts > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: 0,
                lockedUntil: null
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || ''
          }
        } catch (error) {
          console.error('Error de autenticación:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST } 