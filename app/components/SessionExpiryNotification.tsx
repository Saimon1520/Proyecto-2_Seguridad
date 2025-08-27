'use client'

import { useSessionSecurity } from '../hooks/useSessionSecurity'

export default function SessionExpiryNotification() {
  const { securityInfo, formatTime, refreshSession } = useSessionSecurity()

  if (!securityInfo.showWarning && !securityInfo.showCritical) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
      securityInfo.showCritical 
        ? 'bg-red-50 border-red-200 text-red-800' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-5 h-5 ${
          securityInfo.showCritical ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {securityInfo.showCritical ? (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${
            securityInfo.showCritical ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {securityInfo.showCritical ? 'Sesión expirando pronto' : 'Sesión por expirar'}
          </h3>
          <p className={`mt-1 text-sm ${
            securityInfo.showCritical ? 'text-red-700' : 'text-yellow-700'
          }`}>
            Tu sesión expirará en {formatTime(securityInfo.timeUntilExpiry)}
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={refreshSession}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                securityInfo.showCritical 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Extender sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
