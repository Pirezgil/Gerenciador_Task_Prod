'use client';

// ============================================================================
// DATA MANAGEMENT - Gerenciamento de dados do usuário
// ============================================================================

import React from 'react';
import { Download, Upload, Trash2, FileText, Archive, RefreshCw } from 'lucide-react';
import { useStandardAlert } from '@/components/shared/StandardAlert';

export function DataManagement() {
  const { showAlert, AlertComponent } = useStandardAlert();
  const handleExportData = () => {
    // Simular export de dados
    const data = {
      user: { name: 'Usuário', email: 'user@example.com' },
      tasks: [],
      projects: [],
      notes: [],
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerebro-dados-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Dados importados:', data);
            showAlert(
              'Sucesso',
              'Dados importados com sucesso! (Simulação)',
              'success'
            );
          } catch (err) {
            console.error("Erro ao importar dados:", err);
            showAlert(
              'Erro na Importação',
              'Erro ao importar o arquivo. Verifique o formato.',
              'error'
            );
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Gerenciamento de Dados</h2>
      
      <div className="space-y-8">
        {/* Export/Import */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Backup e Restauração</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-colors"
            >
              <Download className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Exportar Dados</h4>
                <p className="text-sm text-gray-600">Baixar todos os seus dados</p>
              </div>
            </button>
            
            <button
              onClick={handleImportData}
              className="flex items-center space-x-3 p-4 border-2 border-green-200 rounded-xl hover:border-green-300 transition-colors"
            >
              <Upload className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Importar Dados</h4>
                <p className="text-sm text-gray-600">Restaurar dados de backup</p>
              </div>
            </button>
          </div>
        </div>

        {/* Estatísticas de Uso */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Estatísticas de Dados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">0</div>
                  <div className="text-sm text-blue-700">Tarefas Criadas</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Archive className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">0</div>
                  <div className="text-sm text-purple-700">Projetos Ativos</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">0</div>
                  <div className="text-sm text-green-700">Notas Salvas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limpeza de Dados */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Limpeza de Dados</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900">Tarefas Concluídas</h4>
                <p className="text-sm text-gray-600">Limpar tarefas concluídas há mais de 30 dias</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Limpar
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900">Notas Arquivadas</h4>
                <p className="text-sm text-gray-600">Remover notas arquivadas há mais de 90 dias</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Limpar
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">Todos os Dados</h4>
                <p className="text-sm text-red-600">Apagar todos os dados permanentemente</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Apagar Tudo
              </button>
            </div>
          </div>
        </div>

        {/* Informações Legais */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações sobre Dados</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Seus dados são armazenados localmente no seu navegador</p>
            <p>• Nenhuma informação pessoal é enviada para servidores externos</p>
            <p>• Você tem controle total sobre seus dados</p>
            <p>• Use as funções de export para fazer backup regular</p>
          </div>
        </div>
      </div>
      <AlertComponent />
    </div>
  );
}

