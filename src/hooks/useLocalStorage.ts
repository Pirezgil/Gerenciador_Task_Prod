// ============================================================================
// USE LOCAL STORAGE - Hook para persistência local
// ============================================================================

'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      const storedValue = item ? JSON.parse(item) : defaultValue;
      setValue(storedValue);
    } catch (error) {
      console.warn(`Erro ao carregar ${key} do localStorage:`, error);
      setValue(defaultValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  const removeValue = () => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Erro ao remover ${key} do localStorage:`, error);
    }
  };

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
  };
}
