// BombeiroPageWrapper.tsx
// Use este arquivo se ainda tiver problemas de hidratação

import dynamic from 'next/dynamic';

// ✅ CORREÇÃO: Desabilitar SSR completamente para evitar hidratação
const BombeiroPage = dynamic(() => import('./BombeiroPage').then(mod => ({ default: mod.BombeiroPage })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-red-950">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Carregando Painel do Bombeiro...
          </p>
        </div>
      </div>
    </div>
  )
});

export { BombeiroPage };
export default BombeiroPage;