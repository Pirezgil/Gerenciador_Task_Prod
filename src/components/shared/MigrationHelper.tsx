// ============================================================================
// MIGRATION HELPER - Componente para migrar dados do localStorage para API
// ============================================================================

'use client';

import { useState } from 'react';
import { migrationApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { invalidateQueries } from '@/lib/queryClient';

export function MigrationHelper() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string>('');

  // Verificar se há dados no localStorage
  const hasLocalData = () => {
    if (typeof window === 'undefined') return false;
    
    const stores = [
      'cerebro-auth',
      'tasks-store',
      'notes-store',
      'habits-store',
      'energy-store'
    ];
    
    return stores.some(store => localStorage.getItem(store));
  };

  const handleMigration = async () => {
    if (typeof window === 'undefined') return;
    
    setIsMigrating(true);
    setMigrationResult('');

    try {
      // Coletar dados do localStorage
      const localData = {
        authStore: JSON.parse(localStorage.getItem('cerebro-auth') || '{}'),
        tasksStore: JSON.parse(localStorage.getItem('tasks-store') || '{}'),
        notesStore: JSON.parse(localStorage.getItem('notes-store') || '{}'),
        habitsStore: JSON.parse(localStorage.getItem('habits-store') || '{}'),
        energyStore: JSON.parse(localStorage.getItem('energy-store') || '{}'),
      };

      // Enviar para API de migração
      const result = await migrationApi.migrateFromLocalStorage(localData);
      
      setMigrationResult(`✅ ${result.message}`);
      
      // Invalidar todas as queries para carregar dados migrados
      invalidateQueries.all();
      
      // Opcional: limpar localStorage após migração bem-sucedida
      // Object.keys(localData).forEach(key => localStorage.removeItem(key));
      
    } catch (error: any) {
      console.error('Erro na migração:', error);
      setMigrationResult(`❌ Erro na migração: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Não mostrar se não há dados locais ou se já está invisível
  if (!hasLocalData() || !isVisible) {
    // Mostrar botão pequeno para reexibir se necessário
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="text-xs"
        >
          Migrar Dados
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Migração de Dados</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Detectamos dados salvos localmente. Deseja migrar para o servidor?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Importante:</strong> Esta migração irá transferir todos os seus dados 
              (tarefas, projetos, notas, hábitos) para o servidor. Certifique-se de estar 
              conectado com a conta correta.
            </p>
          </div>

          {migrationResult && (
            <div className={`p-3 rounded text-sm mb-3 ${
              migrationResult.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {migrationResult}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleMigration}
            disabled={isMigrating}
            className="flex-1"
          >
            {isMigrating ? 'Migrando...' : 'Migrar Dados'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsVisible(false)}
            className="flex-1"
          >
            Agora Não
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Você pode executar esta migração posteriormente se preferir.
        </p>
      </div>
    </div>
  );
}