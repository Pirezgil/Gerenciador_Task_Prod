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
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Marcar como hidratado
    setIsHydrated(true);
    
    const verifyAuth = async () => {
      if (!isPublicRoute && !isAuthenticated) {
        const isValid = await checkAuthStatus();
        if (!isValid) {
          router.push('/auth');
        }
      } else if (isPublicRoute && isAuthenticated) {
        router.push('/');
      }
    };

    // Só verificar auth após hidratação completa
    if (isHydrated) {
      verifyAuth();
    }
  }, [isAuthenticated, isPublicRoute, pathname, router, checkAuthStatus, isHydrated]);

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
          <h2 className="text-xl font-bold theme-text mb-2">Cérebro-Compatível</h2>
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
