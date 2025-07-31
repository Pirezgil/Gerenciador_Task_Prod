// ============================================================================
// NO SSR - DESCONTINUADO
// CORREÇÃO: Este componente foi substituído por useClientOnly() hook
// Mantido apenas para compatibilidade temporária
// ============================================================================

'use client';

import { useClientOnly } from '@/hooks/useHydration';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * @deprecated Use useClientOnly() hook instead
 * Este componente será removido em versões futuras
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isClient = useClientOnly();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
// ============================================================================
// NO SSR - DESCONTINUADO
// CORREÇÃO: Este componente foi substituído por useClientOnly() hook
// Mantido apenas para compatibilidade temporária
// ============================================================================

'use client';

import { useClientOnly } from '@/hooks/useHydration';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * @deprecated Use useClientOnly() hook instead
 * Este componente será removido em versões futuras
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const isClient = useClientOnly();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
