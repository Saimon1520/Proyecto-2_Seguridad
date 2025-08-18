import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/api/auth', '/api/auth/signin', '/api/auth/callback', '/api/auth/session', '/api/auth/csrf', '/api/auth/providers']

// Rutas de API que requieren autenticación
const protectedApiRoutes = ['/api/users', '/api/products', '/api/roles']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si es una ruta pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar si es una ruta de API protegida
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar timeout de sesión (1 minuto de inactividad)
    if (token.iat && typeof token.iat === 'number' && Date.now() - token.iat * 1000 > 60 * 1000) {
      return NextResponse.json(
        { error: 'Sesión expirada por inactividad' },
        { status: 401 }
      )
    }
  }

  // Para rutas de páginas, verificar autenticación
  if (!pathname.startsWith('/api/')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'Debe iniciar sesión para acceder a esta página')
      return NextResponse.redirect(loginUrl)
    }

    // Verificar timeout de sesión (1 minuto de inactividad)
    if (token.iat && typeof token.iat === 'number' && Date.now() - token.iat * 1000 > 60 * 1000) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'Sesión expirada por inactividad')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Agregar headers de seguridad
  const response = NextResponse.next()
  
  // Headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP para prevenir XSS
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
