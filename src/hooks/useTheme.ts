'use client';

// ============================================================================
// HOOK useTheme - Integração completa com themeStore para modo escuro
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export interface UseThemeReturn {
  // Estado atual
  isDark: boolean;
  currentTheme: any;
  
  // Ações principais
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  
  // Temas e presets
  applyPreset: (presetId: string) => void;
  presets: any[];
  
  // Personalização
  updateColors: (colors: { primary?: string; secondary?: string }) => void;
  
  // Utilidades
  getThemeClass: (lightClass: string, darkClass: string) => string;
  isSystemDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const {
    currentTheme,
    presets,
    updateTheme,
    applyPreset: storeApplyPreset,
    applyThemeToDocument
  } = useThemeStore();
  
  const isDark = currentTheme.mode === 'dark';
  
  // Detectar preferência do sistema
  const isSystemDark = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : false;
  
  // Toggle entre modo claro e escuro
  const toggleDarkMode = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    updateTheme({ mode: newMode });
  }, [isDark, updateTheme]);
  
  // Definir modo escuro explicitamente
  const setDarkMode = useCallback((darkMode: boolean) => {
    const newMode = darkMode ? 'dark' : 'light';
    updateTheme({ mode: newMode });
  }, [updateTheme]);
  
  // Aplicar preset com suporte a modo escuro
  const applyPreset = useCallback((presetId: string) => {
    storeApplyPreset(presetId);
  }, [storeApplyPreset]);
  
  // Atualizar cores mantendo modo atual
  const updateColors = useCallback((colors: { primary?: string; secondary?: string }) => {
    updateTheme(colors);
  }, [updateTheme]);
  
  // Utilitário para classes condicionais
  const getThemeClass = useCallback((lightClass: string, darkClass: string) => {
    return isDark ? darkClass : lightClass;
  }, [isDark]);
  
  // Aplicar tema ao documento quando mudar
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme, applyThemeToDocument]);
  
  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Opcional: auto-switch baseado no sistema
      // Descomente a linha abaixo se quiser auto-switch
      // setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);
  
  return {
    // Estado
    isDark,
    currentTheme,
    isSystemDark,
    
    // Ações
    toggleDarkMode,
    setDarkMode,
    
    // Temas
    applyPreset,
    presets,
    
    // Personalização
    updateColors,
    
    // Utilidades
    getThemeClass
  };
}

// Hook simplificado apenas para toggle
export function useDarkMode() {
  const { isDark, toggleDarkMode, setDarkMode } = useTheme();
  return { isDark, toggle: toggleDarkMode, setDark: setDarkMode };
}
