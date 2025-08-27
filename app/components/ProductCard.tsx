'use client'

import { useState } from 'react'
import { 
  CubeIcon, 
  CurrencyDollarIcon, 
  TagIcon, 
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

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

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  canEdit: boolean
  canDelete: boolean
}

export default function ProductCard({ product, onEdit, onDelete, canEdit, canDelete }: ProductCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Sin Stock',
        icon: '🔴'
      }
    } else if (quantity <= 5) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Stock Bajo',
        icon: '🟡'
      }
    } else if (quantity <= 20) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Stock Medio',
        icon: '🔵'
      }
    } else {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Stock Alto',
        icon: '🟢'
      }
    }
  }

  const stockStatus = getStockStatus(product.quantity)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      {/* Header del Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Icono del producto */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <CubeIcon className="w-8 h-8 text-white" />
          </div>
          
          {/* Información principal */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {product.code}
              </span>
            </div>
            <p className="text-gray-600 line-clamp-2">
              {product.description || 'Sin descripción disponible'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar producto"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar producto"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Información del producto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Precio */}
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Precio</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(product.price)}</p>
          </div>
        </div>

        {/* Cantidad */}
        <div className="flex items-center space-x-3">
          <TagIcon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Cantidad</p>
            <p className="text-lg font-bold text-gray-900">{product.quantity}</p>
          </div>
        </div>

        {/* Estado del stock */}
        <div className="flex items-center space-x-3">
          <span className="text-lg">{stockStatus.icon}</span>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Descripción expandible */}
      {product.description && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isDescriptionExpanded ? 'Ocultar descripción' : 'Ver descripción completa'}
            </span>
          </button>
          
          {isDescriptionExpanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Creado: {formatDate(product.createdAt)}</span>
          <span>Actualizado: {formatDate(product.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
