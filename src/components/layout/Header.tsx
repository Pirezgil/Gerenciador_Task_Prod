'use client';

// ============================================================================
// HEADER - Cabeçalho otimizado para trabalhar com Sidebar lateral
// ============================================================================

import React from 'react';
import { usePageContext } from './PageContext';
import * as ThemeToggleModule from '@/components/ui/ThemeToggle';

export function Header() {
  const pageContext = usePageContext();
  

  const getThemeStyles = (theme: string) => {
    const themes = {
      blue: 'bg-energia-normal',
      orange: 'from-orange-500 to-red-500',
      amber: 'from-amber-400 to-orange-500',
      purple: 'bg-energia-alta',
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
                    Sistema Sentinela
                  </h1>
                  <p className="text-sm text-text-secondary">Organização inteligente para sua mente</p>
                </div>
              </div>
            </div>
            
            {/* User Info - Sempre visível */}
            <div className="flex items-center space-x-4 ml-auto">
              
              
              {/* Theme Toggle */}
              <ThemeToggleModule.ThemeToggle variant="icon" className="ml-4" />
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
                  <h2 className="text-2xl font-bold text-white-on-primary">
                    {pageContext.title}
                  </h2>
                  {pageContext.subtitle && (
                    <p className="text-sm text-white-on-primary/90 mt-1">
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
                        <p className="text-xs text-white-on-primary/80 font-medium uppercase tracking-wide">{stat.label}</p>
                        <p className="text-2xl font-bold text-white-on-primary mt-1">{stat.value}</p>
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
