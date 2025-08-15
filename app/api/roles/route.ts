import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET - Listar roles
export async function GET(request: NextRequest) {
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
                { error: 'No tiene permisos para ver roles' },
                { status: 403 }
            )
        }

        const roles = await prisma.role.findMany({
            select: {
                id: true,
                name: true,
                description: true,
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
            },
            orderBy: {
                name: 'asc'
            }
        })

        // Formatear la respuesta para incluir permisos como array
        const formattedRoles = roles.map(role => ({
            ...role,
            permissions: role.permissions.map(rp => rp.permission.name)
        }))

        return NextResponse.json(formattedRoles)
    } catch (error) {
        console.error('Error al obtener roles:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

