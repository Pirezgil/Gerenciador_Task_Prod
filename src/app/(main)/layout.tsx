// ============================================================================
// LAYOUT GRUPO (MAIN) - Layout compartilhado com Header de navegação
// ============================================================================

import { Header } from '@/components/layout/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
      <Header />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
