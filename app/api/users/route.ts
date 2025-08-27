import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { 
  sanitizeText, 
  validateEmail, 
  validateUsername, 
  validateName,
  escapeForLog 
} from '@/app/utils/security'

const prisma = new PrismaClient()

// Esquemas de validación
const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    username: z.string().min(3, 'El username debe tener al menos 3 caracteres'),
    roleId: z.string().optional()
})

const updateUserSchema = z.object({
    email: z.string().email('Email inválido').optional(),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    username: z.string().min(3, 'El username debe tener al menos 3 caracteres').optional(),
    roleId: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional()
})

// GET - Listar usuarios
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para ver usuarios o reportes de usuarios
        const hasPermission = session.user.role?.permissions.some((permission: string) => 
            permission === 'usuarios_ver' || permission === 'reportes_usuarios'
        )
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para ver la lista de usuarios' },
                { status: 403 }
            )
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                lastLoginAt: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Formatear la respuesta para incluir permisos como array
        const formattedUsers = users.map(user => ({
            ...user,
            role: user.role ? {
                ...user.role,
                permissions: user.role.permissions.map(rp => rp.permission.name)
            } : null
        }))

        return NextResponse.json(formattedUsers)
    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para crear usuarios
        const hasPermission = session.user.role?.permissions.includes('usuarios_crear')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para crear usuarios' },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validar datos de entrada
        const validatedData = createUserSchema.parse(body)

        // Sanitizar y validar datos adicionales
        const sanitizedEmail = validateEmail(validatedData.email)
        const sanitizedUsername = validateUsername(validatedData.username)
        const sanitizedName = validateName(validatedData.name)

        if (!sanitizedEmail || !sanitizedUsername || !sanitizedName) {
            return NextResponse.json(
                { error: 'Datos de entrada inválidos o maliciosos' },
                { status: 400 }
            )
        }

        // Verificar si el usuario ya existe por email o username
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: sanitizedEmail },
                    { username: sanitizedUsername }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'El email o username ya está registrado' },
                { status: 400 }
            )
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                email: sanitizedEmail,
                password: hashedPassword,
                name: sanitizedName,
                username: sanitizedUsername,
                roleId: validatedData.roleId || null,
                loginAttempts: 0
            },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                role: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: 'Usuario creado exitosamente',
            user
        })

    } catch (error) {
        // Log seguro sin exponer información sensible
        console.error('Error al crear usuario:', {
            error: error instanceof Error ? escapeForLog(error.message) : 'Error desconocido',
            timestamp: new Date().toISOString(),
            action: 'create_user'
        })

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de entrada inválidos', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

