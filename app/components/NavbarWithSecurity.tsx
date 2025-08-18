'use client'

import { useSession } from 'next-auth/react'
import SecurityStatusBar from './SecurityStatusBar'

export default function NavbarWithSecurity() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🔒 Sistema Seguro
            </h1>
          </div>

          {/* Barra de estado de seguridad */}
          {session && (
            <div className="flex items-center">
              <SecurityStatusBar />
            </div>
          )}

          {/* Usuario */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user?.email}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No autenticado
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
