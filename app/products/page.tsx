"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProductCard from '../components/ProductCard'
import ConfirmationModal from '../components/ConfirmationModal'

// Configuración para hacer la página dinámica
export const dynamic = 'force-dynamic'

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Formulario para crear/editar producto
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    quantity: 0,
    price: 0
  })

  // Estados para errores de validación
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchProducts()
  }, [session, status, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para validar el formulario
  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    
    // Validar código del producto
    if (!formData.code.trim()) {
      errors.code = 'El código del producto es obligatorio'
    } else if (!/^[A-Z][A-Z0-9]{2,9}$/.test(formData.code.trim().toUpperCase())) {
      errors.code = 'El código debe empezar con una letra mayúscula, seguido de 2-9 caracteres (letras o números). Ejemplo: P001, PROD123'
    }
    
    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre del producto es obligatorio'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'El nombre del producto no puede tener más de 100 caracteres'
    }
    
    // Validar cantidad
    if (formData.quantity < 0) {
      errors.quantity = 'La cantidad no puede ser negativa'
    } else if (formData.quantity > 2147483647) {
      errors.quantity = 'La cantidad máxima permitida es 2,147,483,647'
    }
    
    // Validar precio
    if (formData.price < 0) {
      errors.price = 'El precio no puede ser negativo'
    } else if (formData.price > 9999.99) {
      errors.price = 'El precio máximo permitido es $9,999.99'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setEditingProduct(null)
        setFormData({ code: '', name: '', description: '', quantity: 0, price: 0 })
        setFormErrors({})
        setMessage({ type: 'success', text: editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente' })
        fetchProducts()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: `Error: ${error.message}` })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage({ type: 'error', text: 'Error al guardar el producto' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || '',
      quantity: product.quantity,
      price: Number(product.price)
    })
    setShowCreateForm(true)
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Producto eliminado exitosamente' })
        fetchProducts()
        setShowDeleteModal(false)
        setProductToDelete(null)
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Error al eliminar el producto' })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage({ type: 'error', text: 'Error al eliminar el producto' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingProduct(null)
    setFormData({ code: '', name: '', description: '', quantity: 0, price: 0 })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de confirmación */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <svg className={`w-5 h-5 mr-2 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`} fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            {message.text}
          </div>
        </div>
      )}

      {/* Header de la página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="mt-2 text-gray-600">
            Administre el inventario de productos del sistema
          </p>
        </div>
        
        {/* Botón Crear Producto */}
        {session?.user?.role?.permissions?.includes('productos_crear') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Producto
          </button>
        )}
      </div>

      {/* Formulario de crear/editar */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">
            {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    setFormData({ ...formData, code: value })
                    // Limpiar error si se corrige
                    if (formErrors.code && /^[A-Z][A-Z0-9]{2,9}$/.test(value)) {
                      setFormErrors({ ...formErrors, code: '' })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  placeholder="Ej: P001, PROD123"
                  maxLength={10}
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Formato: Letra mayúscula + 2-9 caracteres (letras o números)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, name: value })
                    // Limpiar error si se corrige
                    if (formErrors.name && value.trim().length <= 100) {
                      setFormErrors({ ...formErrors, name: '' })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  placeholder="Nombre del producto"
                  maxLength={100}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 100 caracteres ({formData.name.length}/100)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData({ ...formData, quantity: value })
                    // Limpiar error si se corrige
                    if (formErrors.quantity && value >= 0 && value <= 2147483647) {
                      setFormErrors({ ...formErrors, quantity: '' })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  min="0"
                  max="2147483647"
                />
                {formErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Cantidad máxima: 2,147,483,647
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setFormData({ ...formData, price: value })
                    // Limpiar error si se corrige
                    if (formErrors.price && value >= 0 && value <= 9999.99) {
                      setFormErrors({ ...formErrors, price: '' })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  min="0"
                  max="9999.99"
                  step="0.01"
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Precio máximo: $9,999.99
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del producto (opcional)"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos con el nuevo diseño */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Inventario de Productos</h2>
          <p className="text-sm text-gray-500">
            {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-medium text-gray-500">No hay productos disponibles</p>
            <p className="text-sm text-gray-400">Comience creando un nuevo producto</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={session?.user?.role?.permissions?.includes('productos_editar') || false}
                canDelete={session?.user?.role?.permissions?.includes('productos_borrar') || false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
