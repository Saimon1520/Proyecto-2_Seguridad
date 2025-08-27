import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions = {
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
            },
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
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
            const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
            const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '15') * 60 * 1000 // Convertir a milisegundos
            
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: user.loginAttempts + 1,
                lockedUntil: user.loginAttempts >= (maxAttempts - 1) ? new Date(Date.now() + lockoutDuration) : null
              }
            })

            if (user.loginAttempts >= (maxAttempts - 1)) {
              throw new Error(`Demasiados intentos fallidos. Cuenta bloqueada por ${process.env.LOCKOUT_DURATION || '15'} minutos.`)
            }

            throw new Error('Contraseña incorrecta')
          }

          // Resetear intentos de login y actualizar último login si la autenticación es exitosa
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          })

          // Retornar usuario con información del rol y permisos
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            username: user.username,
            role: user.role ? {
              id: user.role.id,
              name: user.role.name,
              permissions: user.role.permissions.map(rp => rp.permission.name)
            } : null
          }
        } catch (error) {
          console.error('Error en autenticación:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    // NO usar tiempo fijo - solo inactividad
    // maxAge: parseInt(process.env.SESSION_EXPIRY || '60'), // Comentado
  },
  jwt: {
    // NO usar tiempo fijo - solo inactividad
    // maxAge: parseInt(process.env.SESSION_EXPIRY || '60'), // Comentado
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.username = user.username
        token.role = user.role
        token.iat = Math.floor(Date.now() / 1000) // Timestamp de emisión
        // NO forzar expiración - solo inactividad
        // token.exp = Math.floor(Date.now() / 1000) + parseInt(process.env.SESSION_EXPIRY || '60')
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.username = token.username as string
        session.user.role = token.role as any
        // NO mostrar expiración - solo inactividad
        // session.expires = new Date(token.exp * 1000).toISOString()
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}
