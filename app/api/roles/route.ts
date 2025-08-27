import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

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

        // Verificar si el usuario tiene permiso para ver roles
        const hasPermission = session.user.role?.permissions.includes('roles_ver')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para ver roles' },
                { status: 403 }
            )
        }

        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        })

        // Formatear la respuesta
        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
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

// POST - Crear rol
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar si el usuario tiene permiso para crear roles
        const hasPermission = session.user.role?.permissions.includes('roles_crear')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para crear roles' },
                { status: 403 }
            )
        }

        const { name, description, permissions } = await request.json()

        // Validaciones
        if (!name || !description) {
            return NextResponse.json(
                { error: 'Nombre y descripción son requeridos' },
                { status: 400 }
            )
        }

        // Verificar si el rol ya existe
        const existingRole = await prisma.role.findUnique({
            where: { name }
        })

        if (existingRole) {
            return NextResponse.json(
                { error: 'Ya existe un rol con ese nombre' },
                { status: 400 }
            )
        }

        // Crear el rol
        const newRole = await prisma.role.create({
            data: {
                name,
                description
            }
        })

        // Asignar permisos si se proporcionan
        if (permissions && permissions.length > 0) {
            for (const permissionName of permissions) {
                const permission = await prisma.permission.findUnique({
                    where: { name: permissionName }
                })

                if (permission) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: newRole.id,
                            permissionId: permission.id
                        }
                    })
                }
            }
        }

        return NextResponse.json(
            { message: 'Rol creado exitosamente', role: newRole },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error al crear rol:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

