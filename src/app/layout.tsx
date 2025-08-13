// ============================================================================
// LAYOUT PRINCIPAL - Layout base com autenticação e tema integrado
// ============================================================================

import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ServiceWorkerProvider } from '@/components/providers/ServiceWorkerProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { NotificationPermissionBanner, NotificationDeniedBanner } from '@/components/shared/NotificationPermissionBanner';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sentinela | Gerenciador de Tarefas',
  description: 'Sistema de gerenciamento de tarefas especialmente projetado para usuários neurodivergentes',
  keywords: ['neurodivergente', 'tdah', 'ansiedade', 'produtividade', 'bem-estar'],
  authors: [{ name: 'Arquiteto de Software' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Sentinela | Gerenciador de Tarefas',
    description: 'Sistema de gerenciamento de tarefas especialmente projetado para usuários neurodivergentes',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen theme-background theme-text theme-loading" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {/* Banners de notificação */}
              <NotificationPermissionBanner />
              <NotificationDeniedBanner />
              
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <ServiceWorkerProvider />
              <ToastProvider />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}