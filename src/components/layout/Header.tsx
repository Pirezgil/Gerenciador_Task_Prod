'use client';

// ============================================================================
// HEADER - Cabeçalho principal com navegação integrada e contexto de página
// ============================================================================

import React from 'react';
import { Navigation } from './Navigation';
import { usePageContext } from './PageContext';

export function Header() {
  const pageContext = usePageContext();
  
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
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Cérebro-Compatível
              </h1>
              <p className="text-sm text-gray-600">Sistema inteligente para organizar sua mente</p>
            </div>
            <Navigation />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">João</span>! 👋
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
      
      {/* Contexto da Página */}
      {pageContext && (
        <div className={`bg-gradient-to-r ${getThemeStyles(pageContext.theme)} border-t border-white/20`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {pageContext.icon && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-75"></div>
                    <div className="relative p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="text-2xl">{pageContext.icon}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {pageContext.title}
                  </h2>
                  {pageContext.subtitle && (
                    <p className="text-sm text-white/80">
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
            
            {/* Stats opcionais */}
            {pageContext.stats && pageContext.stats.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {pageContext.stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                      </div>
                      {stat.icon && (
                        <span className="text-lg opacity-80">{stat.icon}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
