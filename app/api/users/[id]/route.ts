import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

const updateUserSchema = z.object({
    email: z.string().email('Email inválido').optional(),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    username: z.string().min(3, 'El username debe tener al menos 3 caracteres').optional(),
    roleId: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional()
})

// GET - Obtener usuario específico
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para ver reportes
        const hasPermission = session.user.role?.permissions.includes('ver_reportes')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para ver usuarios' },
                { status: 403 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
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
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Formatear la respuesta para incluir permisos como array
        const formattedUser = {
            ...user,
            role: user.role ? {
                ...user.role,
                permissions: user.role.permissions.map(rp => rp.permission.name)
            } : null
        }

        return NextResponse.json(formattedUser)
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// PUT - Actualizar usuario
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para editar
        const hasPermission = session.user.role?.permissions.includes('editar')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para editar usuarios' },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validar datos de entrada
        const validatedData = updateUserSchema.parse(body)

        // Verificar si el usuario existe
        const existingUser = await prisma.user.findUnique({
            where: { id: params.id }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Verificar si el email o username ya existe (si se está actualizando)
        if (validatedData.email || validatedData.username) {
            const duplicateUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        ...(validatedData.email ? [{ email: validatedData.email }] : []),
                        ...(validatedData.username ? [{ username: validatedData.username }] : [])
                    ],
                    NOT: { id: params.id }
                }
            })

            if (duplicateUser) {
                return NextResponse.json(
                    { error: 'El email o username ya está registrado' },
                    { status: 400 }
                )
            }
        }

        // Preparar datos de actualización
        const updateData: any = {}

        if (validatedData.email) updateData.email = validatedData.email
        if (validatedData.name) updateData.name = validatedData.name
        if (validatedData.username) updateData.username = validatedData.username
        if (validatedData.roleId !== undefined) updateData.roleId = validatedData.roleId || null

        // Encriptar contraseña si se proporciona
        if (validatedData.password) {
            updateData.password = await bcrypt.hash(validatedData.password, 12)
        }

        // Actualizar usuario
        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
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
            message: 'Usuario actualizado exitosamente',
            user
        })

    } catch (error) {
        console.error('Error al actualizar usuario:', error)

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

// DELETE - Eliminar usuario
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para borrar
        const hasPermission = session.user.role?.permissions.includes('borrar')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para eliminar usuarios' },
                { status: 403 }
            )
        }

        // Verificar si el usuario existe
        const existingUser = await prisma.user.findUnique({
            where: { id: params.id }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // No permitir eliminar el propio usuario
        if (existingUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'No puede eliminar su propia cuenta' },
                { status: 400 }
            )
        }

        // Eliminar usuario
        await prisma.user.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            message: 'Usuario eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

