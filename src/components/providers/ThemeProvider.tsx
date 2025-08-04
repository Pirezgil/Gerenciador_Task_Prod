'use client';

// ============================================================================
// THEME PROVIDER - Hidratação 100% Segura
// ============================================================================

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, applyThemeToDocument } = useThemeStore();
  const [canApplyTheme, setCanApplyTheme] = useState(false);

  // ✅ CORREÇÃO: Aguardar hidratação completa antes de aplicar tema
  useLayoutEffect(() => {
    // Aguardar 2 ticks para garantir que a hidratação terminou
    const timer = setTimeout(() => {
      setCanApplyTheme(true);
    }, 50); // Delay mínimo para hidratação terminar

    return () => clearTimeout(timer);
  }, []);

  // ✅ CORREÇÃO: Só aplicar tema após hidratação estar completa
  useEffect(() => {
    if (!canApplyTheme || typeof window === 'undefined') return;
    
    // Aplicar tema de forma segura
    try {
      applyThemeToDocument(currentTheme);
      
      // Remover classe de loading
      document.body.classList.remove('theme-loading');
      document.body.classList.add('theme-loaded');
      
      // Detectar preferência de tema do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (currentTheme.mode === 'auto') {
          applyThemeToDocument({
            ...currentTheme,
            mode: mediaQuery.matches ? 'dark' : 'light'
          });
        }
      };
      
      if (currentTheme.mode === 'auto') {
        handleChange();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch (error) {
      console.warn('Erro ao aplicar tema:', error);
    }
    
    // Garantir que sempre retornamos algo (mesmo que undefined)
    return;
  }, [canApplyTheme, currentTheme, applyThemeToDocument]);

  return <>{children}</>;
}
