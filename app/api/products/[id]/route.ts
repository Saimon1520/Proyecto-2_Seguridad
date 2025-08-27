import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Esquema de validación para productos
const productSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0')
})

// PUT - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario tiene permiso para editar productos
    const hasPermission = session.user.role?.permissions.includes('productos_editar')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'No tiene permisos para editar productos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = productSchema.parse(body)

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el código ya existe en otro producto
    const productWithSameCode = await prisma.product.findFirst({
      where: {
        code: validatedData.code,
        id: { not: params.id }
      }
    })

    if (productWithSameCode) {
      return NextResponse.json(
        { error: 'Ya existe otro producto con este código' },
        { status: 400 }
      )
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description || null,
        quantity: validatedData.quantity,
        price: validatedData.price
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario tiene permiso para borrar productos
    const hasPermission = session.user.role?.permissions.includes('productos_borrar')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'No tiene permisos para borrar productos' },
        { status: 403 }
      )
    }

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el producto
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
