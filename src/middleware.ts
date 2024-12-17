import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'
import { securityMiddleware } from '@/lib/security'

export async function middleware(request: NextRequest) {
  // Verifica segurança primeiro
  const securityCheck = await securityMiddleware(request)
  if (securityCheck) return securityCheck

  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')
  const isHomePage = request.nextUrl.pathname === '/'
  const isProfilePage = request.nextUrl.pathname.startsWith('/profile')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // Se estiver em uma página de autenticação e já estiver logado, redireciona para dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se estiver na homepage
  if (isHomePage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se estiver tentando acessar área admin
  if (isAdminPage) {
    if (!token) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Verifica se o usuário é admin
    if (token.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Se estiver na página de perfil ou dashboard e não estiver autenticado
  if ((isProfilePage || isDashboardPage) && !token) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Para todas as outras rotas, permite o acesso
  const response = NextResponse.next()
  
  // Adiciona headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
}
