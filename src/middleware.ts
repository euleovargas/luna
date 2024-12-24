import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isPublicPath = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register')

  // Se estiver em uma rota pública, permite acesso
  if (isPublicPath) {
    // Se estiver logado, redireciona para dashboard
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Adiciona um cabeçalho de cache personalizado para forçar revalidação
  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  
  if (request.nextUrl.pathname === "/profile") {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }

  // Se estiver autenticado, permite acesso
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
}
