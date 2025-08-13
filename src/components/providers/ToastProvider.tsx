'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={theme as 'light' | 'dark' | 'system'}
      toastOptions={{
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        },
        className: 'toast sentinela-notification',
        descriptionClassName: 'toast-description',
        actionButtonStyle: {
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        cancelButtonStyle: {
          backgroundColor: 'transparent',
          color: 'var(--muted-foreground)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '14px',
        },
      }}
      closeButton
      richColors
      expand
      duration={4000}
      visibleToasts={5}
      gap={8}
      offset={16}
    />
  );
}