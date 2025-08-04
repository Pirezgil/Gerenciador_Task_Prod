'use client';

// ============================================================================
// AUTH MIDDLEWARE - Proteção de rotas com hidratação segura
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const publicRoutes = ['/auth', '/login', '/register'];

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, initializeAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Marcar como hidratado e inicializar auth
    setIsHydrated(true);
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isHydrated) return;
    
    const verifyAuth = () => {
      // Verificar se há token no localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
      // Log para debug
      console.log('AuthMiddleware Debug:', {
        pathname,
        isPublicRoute,
        isAuthenticated,
        hasToken: !!token,
        user
      });
      
      // Se estiver na página /auth e não estiver autenticado, não redirecionar
      if (pathname === '/auth' && !isAuthenticated) {
        return;
      }
      
      // Se estiver em rota privada sem autenticação, redirecionar para auth
      if (!isPublicRoute && !isAuthenticated && !token) {
        console.log('Redirecting to /auth - no auth on private route');
        router.push('/auth');
        return;
      }
      
      // Se estiver em rota pública mas autenticado, redirecionar para bombeiro
      if (isPublicRoute && isAuthenticated && token) {
        console.log('Redirecting to /bombeiro - authenticated user on public route');
        router.push('/bombeiro');
        return;
      }
    };

    verifyAuth();
  }, [isAuthenticated, isPublicRoute, pathname, router, isHydrated, user]);

  // Durante SSR ou carregamento, mostrar loading
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h2 className="text-xl font-bold theme-text mb-2">Sentinela</h2>
          <div className="flex items-center justify-center space-x-2 theme-text-secondary">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm theme-text-muted mt-3" suppressHydrationWarning>Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Se é rota pública e não está autenticado, mostrar conteúdo
  if (isPublicRoute && !isAuthenticated) {
    return <>{children}</>;
  }

  // Se é rota privada e está autenticado, mostrar conteúdo
  if (!isPublicRoute && isAuthenticated) {
    return <>{children}</>;
  }

  // Caso contrário, não renderizar nada (redirecionamento em progresso)
  return null;
}
