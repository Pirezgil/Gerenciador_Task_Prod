// ============================================================================
// SERVICE WORKER PROVIDER - Inicialização automática do Service Worker
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function ServiceWorkerProvider() {
  const { isSupported, isRegistered, error } = useServiceWorker();

  useEffect(() => {
    // Log do status do Service Worker para debug
    if (typeof window !== 'undefined') {
      console.log('🔔 Service Worker Provider inicializado:', {
        isSupported,
        isRegistered,
        error,
        timestamp: new Date().toISOString()
      });
    }
  }, [isSupported, isRegistered, error]);

  // Este componente não renderiza nada, apenas inicializa o Service Worker
  return null;
}