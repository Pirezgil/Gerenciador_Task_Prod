'use client';

// ============================================================================
// PÁGINA CAIXA DE AREIA - Ambiente de experimentação e notas
// ============================================================================

import React, { useState } from 'react';
import { PageProvider } from '@/components/layout/PageContext';
import { CaixaDeAreiaPage as CaixaDeAreiaComponent } from '@/components/caixa-de-areia/CaixaDeAreiaPage';
import { Button } from '@/components/ui/button';
import { Plus, SortAsc, SortDesc } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

export default function CaixaDeAreiaPage() {
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('updated');
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Obter dados das notas
  const { notes } = useTasksStore();
  const activeNotes = notes.filter(note => note.status === 'active');

  const handleNewNote = () => {
    setShowAddNote(true);
  };

  const handleSortToggle = () => {
    setSortBy(prev => prev === 'created' ? 'updated' : 'created');
  };

  return (
    <PageProvider
      value={{
        title: '🏖️ Caixa de Areia Privada',
        subtitle: `${activeNotes.length} nota(s) • Organizada por ${sortBy === 'created' ? 'criação' : 'edição'}`,
        icon: '🏖️',
        theme: 'amber',
        actions: (
          <>
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <button
                onClick={handleSortToggle}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  sortBy === 'updated'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                title="Ordenar por atualização"
              >
                <SortDesc className="w-4 h-4" />
              </button>
              <button
                onClick={handleSortToggle}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  sortBy === 'created'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                title="Ordenar por criação"
              >
                <SortAsc className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleNewNote}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Nota
            </Button>
          </>
        )
      }}
    >
      <CaixaDeAreiaComponent 
        sortBy={sortBy}
        showAddNote={showAddNote}
        setShowAddNote={setShowAddNote}
      />
    </PageProvider>
  );
}
