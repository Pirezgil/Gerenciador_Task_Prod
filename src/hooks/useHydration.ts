// ============================================================================
// HYDRATION SYSTEM - Implementação adequada para Next.js
// CORREÇÃO: Substituição de soluções paliativas por implementação robusta
// ============================================================================

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook otimizado para gerenciar hidratação
 * Resolve conflitos SSR/CSR definitivamente
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marca como hidratado apenas após o primeiro render no cliente
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook avançado para valores diferentes no servidor vs cliente
 * Evita erros de hidratação em componentes complexos
 */
export function useClientValue<T>(clientValue: T, serverValue?: T): T {
  const isHydrated = useHydration();
  
  // Durante SSR ou antes da hidratação, usa valor do servidor
  if (!isHydrated) {
    return serverValue !== undefined ? serverValue : clientValue;
  }
  
  // Após hidratação, usa valor do cliente
  return clientValue;
}

/**
 * Hook para componentes que devem renderizar apenas no cliente
 * Substitui o componente NoSSR por uma solução mais elegante
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

/**
 * Wrapper para componentes que precisam de dados do localStorage
 * Evita erros de hidratação ao acessar storage APIs
 */
export function useStorageSafeValue<T>(
  storageKey: string, 
  defaultValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    
    try {
      const storageAPI = storage === 'localStorage' ? window.localStorage : window.sessionStorage;
      const storedValue = storageAPI.getItem(storageKey);
      
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue));
      }
    } catch (error) {
      console.warn(`Erro ao ler ${storage}:`, error);
    }
  }, [storageKey, storage]);
  
  const setStorageValue = useCallback((newValue: T) => {
    setValue(newValue);
    
    if (isHydrated) {
      try {
        const storageAPI = storage === 'localStorage' ? window.localStorage : window.sessionStorage;
        storageAPI.setItem(storageKey, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Erro ao escrever ${storage}:`, error);
      }
    }
  }, [storageKey, storage, isHydrated]);
  
  return [value, setStorageValue];
}
