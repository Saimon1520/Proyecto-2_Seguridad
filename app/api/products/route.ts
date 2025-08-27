import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { 
  sanitizeText, 
  validateProductCode, 
  validatePrice, 
  validateQuantity,
  escapeForLog 
} from '@/app/utils/security'

const prisma = new PrismaClient()

// Esquema de validación para productos
const productSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0')
})

// GET - Obtener todos los productos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario tiene permiso para ver productos o reportes de productos
    const hasPermission = session.user.role?.permissions.some((permission: string) => 
      permission === 'productos_ver' || permission === 'reportes_productos'
    )
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'No tiene permisos para ver la lista de productos' },
        { status: 403 }
      )
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario tiene permiso para crear productos
    const hasPermission = session.user.role?.permissions.includes('productos_crear')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'No tiene permisos para crear productos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = productSchema.parse(body)

    // Sanitizar y validar datos adicionales
    const sanitizedCode = validateProductCode(validatedData.code)
    const sanitizedName = sanitizeText(validatedData.name)
    const sanitizedDescription = validatedData.description ? sanitizeText(validatedData.description) : null
    const validatedQuantity = validateQuantity(validatedData.quantity)
    const validatedPrice = validatePrice(validatedData.price)

    if (!sanitizedCode || !sanitizedName || validatedQuantity === null || validatedPrice === null) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos o maliciosos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const existingProduct = await prisma.product.findUnique({
      where: { code: sanitizedCode }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este código' },
        { status: 400 }
      )
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        code: sanitizedCode,
        name: sanitizedName,
        description: sanitizedDescription,
        quantity: validatedQuantity,
        price: validatedPrice
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    // Log seguro sin exponer información sensible
    console.error('Error creating product:', {
      error: error instanceof Error ? escapeForLog(error.message) : 'Error desconocido',
      timestamp: new Date().toISOString(),
      action: 'create_product'
    })

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
