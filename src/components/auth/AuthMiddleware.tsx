'use client';

// ============================================================================
// AUTH MIDDLEWARE - Simplificado para evitar conflitos com AuthProvider
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const publicRoutes = ['/auth', '/login', '/register', '/auth/callback'];

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const { isLoading } = useAuth();

  // SIMPLIFICAÇÃO: AuthProvider já gerencia toda a lógica de autenticação
  // AuthMiddleware agora apenas mostra loading se necessário
  // A navegação/redirecionamento é responsabilidade dos componentes individuais

  // Durante carregamento inicial, mostrar loading
  if (isLoading) {
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

  // CORREÇÃO: Sempre renderizar children após carregamento
  // A lógica de redirecionamento é responsabilidade dos componentes/páginas individuais
  // Isso evita conflitos e loops de redirecionamento
  return <>{children}</>;
}
