// ============================================================================
// LAYOUT GRUPO (MAIN) - Layout com Sidebar lateral e Header otimizado
// ============================================================================

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex">
      {/* Sidebar Lateral */}
      <Sidebar />
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header />
        
        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 ml-0 lg:ml-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
