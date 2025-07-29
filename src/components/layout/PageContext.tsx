'use client';

// ============================================================================
// PAGE CONTEXT - Sistema de contexto para personalização contextual do header
// ============================================================================

import React, { createContext, useContext, ReactNode } from 'react';

export interface PageContextType {
  title: string;
  subtitle?: string;
  icon?: string;
  theme: 'blue' | 'orange' | 'amber' | 'purple' | 'green';
  actions?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
  }>;
}

const PageContext = createContext<PageContextType | null>(null);

export function PageProvider({ 
  children, 
  value 
}: { 
  children: ReactNode;
  value: PageContextType;
}) {
  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  return context;
}
