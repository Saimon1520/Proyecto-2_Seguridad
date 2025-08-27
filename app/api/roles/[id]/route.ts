import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

const prisma = new PrismaClient()

// PUT - Editar rol
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

        // Verificar si el usuario tiene permisos para editar roles
        const hasPermission = session.user.role?.permissions.includes('roles_editar')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para editar roles' },
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

        // Verificar si el rol existe
        const existingRole = await prisma.role.findUnique({
            where: { id: params.id }
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Rol no encontrado' },
                { status: 404 }
            )
        }

        // Verificar si el nuevo nombre ya existe en otro rol
        const duplicateName = await prisma.role.findFirst({
            where: {
                name,
                id: { not: params.id }
            }
        })

        if (duplicateName) {
            return NextResponse.json(
                { error: 'Ya existe otro rol con ese nombre' },
                { status: 400 }
            )
        }

        // Actualizar el rol
        const updatedRole = await prisma.role.update({
            where: { id: params.id },
            data: {
                name,
                description
            }
        })

        // Actualizar permisos
        if (permissions) {
            // Eliminar permisos existentes
            await prisma.rolePermission.deleteMany({
                where: { roleId: params.id }
            })

            // Agregar nuevos permisos
            for (const permissionName of permissions) {
                const permission = await prisma.permission.findUnique({
                    where: { name: permissionName }
                })

                if (permission) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: params.id,
                            permissionId: permission.id
                        }
                    })
                }
            }
        }

        return NextResponse.json(
            { message: 'Rol actualizado exitosamente', role: updatedRole }
        )
    } catch (error) {
        console.error('Error al actualizar rol:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// DELETE - Borrar rol
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

        // Verificar si el usuario tiene permisos para borrar roles
        const hasPermission = session.user.role?.permissions.includes('roles_borrar')
        if (!hasPermission) {
            return NextResponse.json(
                { error: 'No tiene permisos para borrar roles' },
                { status: 403 }
            )
        }

        // Verificar si el rol existe
        const existingRole = await prisma.role.findUnique({
            where: { id: params.id }
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Rol no encontrado' },
                { status: 404 }
            )
        }

        // Verificar si hay usuarios usando este rol
        const usersWithRole = await prisma.user.findFirst({
            where: { roleId: params.id }
        })

        if (usersWithRole) {
            return NextResponse.json(
                { error: 'No se puede borrar el rol porque hay usuarios asignados a él' },
                { status: 400 }
            )
        }

        // Eliminar permisos del rol
        await prisma.rolePermission.deleteMany({
            where: { roleId: params.id }
        })

        // Eliminar el rol
        await prisma.role.delete({
            where: { id: params.id }
        })

        return NextResponse.json(
            { message: 'Rol eliminado exitosamente' }
        )
    } catch (error) {
        console.error('Error al eliminar rol:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
