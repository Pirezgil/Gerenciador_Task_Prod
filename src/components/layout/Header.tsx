'use client';

// ============================================================================
// HEADER - Cabeçalho otimizado para trabalhar com Sidebar lateral
// ============================================================================

import React from 'react';
import { usePageContext } from './PageContext';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const pageContext = usePageContext();
  const { user } = useAuthStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getThemeStyles = (theme: string) => {
    const themes = {
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-red-500',
      amber: 'from-amber-400 to-orange-500',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-emerald-600'
    };
    return themes[theme as keyof typeof themes] || themes.blue;
  };

  return (
    <>
      {/* Header Principal - Simplificado */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-white/20 lg:ml-0">
        <div className="px-6 py-4 ml-0 lg:ml-4">
          <div className="flex items-center justify-between">
            {/* Logo/Título - Oculto no mobile (sidebar tem) */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Sistema Cérebro-Compatível
                  </h1>
                  <p className="text-sm text-gray-600">Organização inteligente para sua mente</p>
                </div>
              </div>
            </div>
            
            {/* User Info - Sempre visível */}
            <div className="flex items-center space-x-6 ml-auto">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">{user?.name || "Usuário"}</span>! 👋
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contexto da Página - Aprimorado */}
      {pageContext && (
        <div className={`bg-gradient-to-r ${getThemeStyles(pageContext.theme)} border-t border-white/20`}>
          <div className="px-6 py-5 ml-0 lg:ml-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {pageContext.icon && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-75"></div>
                    <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="text-3xl">{pageContext.icon}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {pageContext.title}
                  </h2>
                  {pageContext.subtitle && (
                    <p className="text-sm text-white/90 mt-1">
                      {pageContext.subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {pageContext.actions && (
                <div className="flex items-center space-x-3">
                  {pageContext.actions}
                </div>
              )}
            </div>
            
            {/* Stats - Aprimoradas */}
            {pageContext.stats && pageContext.stats.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {pageContext.stats.map((stat, index) => (
                  <div key={index} className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/80 font-medium uppercase tracking-wide">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      {stat.icon && (
                        <span className="text-2xl opacity-90">{stat.icon}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
