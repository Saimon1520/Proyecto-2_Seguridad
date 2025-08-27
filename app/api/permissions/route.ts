import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

const prisma = new PrismaClient()

// GET - Listar permisos
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para ver roles
        const hasPermission = session.user.role?.permissions.includes('roles_ver')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para ver permisos' },
                { status: 403 }
            )
        }

        const permissions = await prisma.permission.findMany({
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(permissions)
    } catch (error) {
        console.error('Error al obtener permisos:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
