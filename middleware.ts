import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que precisam de autenticação
const protectedPaths = [
  '/bombeiro',
  '/arquiteto', 
  '/tarefas',
  '/habitos',
  '/planejamento',
  '/recompensas',
  '/settings',
  '/profile',
  '/caixa-de-areia',
  '/lembretes'
];

// Rotas públicas (não precisam de autenticação)
const publicPaths = [
  '/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acesso a recursos estáticos e API
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next();
  }

  // Verificar se tem cookie de autenticação
  const authToken = request.cookies.get('auth-token');
  
  // Se está em rota protegida e não tem token
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se está na página de login e já tem token
  const isPublicRoute = publicPaths.some(path => pathname.startsWith(path));
  if (isPublicRoute && authToken && pathname === '/auth') {
    const dashboardUrl = new URL('/bombeiro', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Redirecionar root para área apropriada
  if (pathname === '/') {
    const targetUrl = authToken ? '/bombeiro' : '/auth';
    const redirectUrl = new URL(targetUrl, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};