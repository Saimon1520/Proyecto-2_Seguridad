'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  quantity: number
  price: number | { toString(): string }
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

  // Formulario para crear/editar producto
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    quantity: 0,
    price: 0
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Producto eliminado exitosamente' })
        fetchProducts()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Error al eliminar el producto' })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage({ type: 'error', text: 'Error al eliminar el producto' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingProduct(null)
    setFormData({ code: '', name: '', description: '', quantity: 0, price: 0 })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="ios-loading">
          <div className="ios-spinner"></div>
          <span className="ml-3 text-gray-600">Cargando productos...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Messages */}
      {message && (
        <div className={`ios-toast ios-toast-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="ios-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="ios-button ios-button-secondary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Volver</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Gestión de Productos</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="ios-button ios-button-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Crear Producto</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de crear/editar - Modal en móvil */}
        {showCreateForm && (
          <div className="ios-modal" onClick={handleCancel}>
            <div className="ios-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="ios-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="ios-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="ios-input"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="ios-input"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="ios-input resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="ios-button ios-button-success flex-1"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="ios-button ios-button-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de productos */}
        <div className="ios-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Productos</h2>
          </div>
          
          {/* Mobile Cards View */}
          <div className="block md:hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="ios-spinner mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay productos disponibles
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="ios-card p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">Código: {product.code}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.description || 'Sin descripción'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Cantidad: {product.quantity}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="ios-button ios-button-secondary text-sm px-3 py-1.5"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="ios-button ios-button-danger text-sm px-3 py-1.5"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="ios-loading">
                        <div className="ios-spinner"></div>
                        <span className="ml-3 text-gray-600">Cargando productos...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No hay productos disponibles
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="font-medium text-gray-900">{product.code}</td>
                      <td className="font-medium text-gray-900">{product.name}</td>
                      <td className="text-gray-500">{product.description || '-'}</td>
                      <td className="text-gray-900">{product.quantity}</td>
                      <td className="font-semibold text-green-600">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="ios-button ios-button-secondary text-sm px-3 py-1.5"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="ios-button ios-button-danger text-sm px-3 py-1.5"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
