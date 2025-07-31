// ============================================================================
// THEME COLOR TEST - Componente para testar cores dos temas
// ============================================================================

import React from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeColorTest() {
  const { currentTheme } = useThemeStore();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
      <h3 className="theme-heading text-sm mb-2">Teste de Cores do Tema</h3>
      
      <div className="space-y-2 text-xs">
        <div className="theme-text">Texto Principal</div>
        <div className="theme-text-secondary">Texto Secundário</div>
        <div className="theme-text-muted">Texto Esmaecido</div>
        
        <div className="bg-blue-500 p-2 rounded">
          <span className="theme-text-on-primary">Texto em Primário</span>
        </div>
        
        <div className="bg-purple-500 p-2 rounded">
          <span className="theme-text-on-secondary">Texto em Secundário</span>
        </div>
        
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded theme-button-text">
          Botão Gradiente
        </button>
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs theme-text-secondary">
        Tema: {currentTheme.name}
      </div>
    </div>
  );
}