'use client';

// ============================================================================
// PÁGINA CAIXA DE AREIA - REFINADA - Sistema de notas em lista organizada por data
// Navegação + Segurança obrigatória + Design moderno refinado
// ATUALIZAÇÕES: Bordas arredondadas + Containers ajustados + Altura automática
// ============================================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  RotateCcw, 
  Calendar,
  Clock,
  Lock,
  Edit3,
  Trash2,
  Archive,
  Sparkles
} from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';

export function CaixaDeAreiaPage() {
  const { 
    notes, 
    newNoteContent, 
    saveNote, 
    updateNote,
    archiveNote,
    deleteNote,
    setShowTransformModal,
    editingNote
  } = useTasksStore();
  
  const { sandboxAuth, user, unlockSandbox, lockSandbox } = useAuthStore();
  const [showAddNote, setShowAddNote] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('updated');

  // Sempre verificar autenticação - senha obrigatória
  const needsAuth = !sandboxAuth.isUnlocked;

  // Organizar notas por data
  const sortedNotes = [...notes]
    .filter(note => note.status === 'active')
    .sort((a, b) => {
      const dateA = new Date(sortBy === 'created' ? a.createdAt : a.updatedAt);
      const dateB = new Date(sortBy === 'created' ? b.createdAt : b.updatedAt);
      return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
    });

  // Handler para verificar senha
  const handlePasswordSubmit = () => {
    if (!user?.settings?.sandboxPassword) {
      setPasswordError('Senha não configurada. Configure na tela de Segurança.');
      return;
    }
    
    if (password === user.settings.sandboxPassword) {
      unlockSandbox();
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Senha incorreta');
      setPassword('');
    }
  };

  // Handler para adicionar nova nota
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      saveNote(newNoteContent);
      setShowAddNote(false);
    }
  };

  // Handler para Enter na textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddNote();
    }
    if (e.key === 'Escape') {
      setShowAddNote(false);
      useTasksStore.setState({ newNoteContent: '' });
    }
  };

  // Se precisa de autenticação, mostrar tela de login
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -10 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 w-full max-w-lg shadow-2xl border border-white/20"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent"
            >
              🏖️ Caixa de Areia Privada
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-lg"
            >
              Seu espaço seguro para pensamentos livres
            </motion.p>
          </div>
          
          <div className="space-y-4">
            <div>
              <motion.input
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                type="password"
                placeholder="✨ Digite sua senha mágica"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full p-5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 focus:border-amber-400 text-white placeholder-white/60 text-lg"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordSubmit}
              disabled={!password.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                password.trim()
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              🚀 Acessar Caixa de Areia
            </motion.button>
          </div>
          
          <div className="mt-6 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-white/70"
            >
              Senha não configurada?{' '}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => useTasksStore.setState({ currentPage: 'profile' })}
                className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 transition-colors"
              >
                Configure aqui ✨
              </motion.button>
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header removido - usando sistema global */}

        {/* Lista de notas - CONTAINER MENOR */}
        <div className="max-w-3xl mx-auto p-8">
          {sortedNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🏖️</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2 font-serif">
                Sua caixa de areia está vazia
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Este é seu espaço privado para pensamentos livres. <br />
                Crie sua primeira nota!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddNote(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
              >
                Criar primeira nota
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {sortedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-amber-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500"
                  >
                    {/* Header da nota */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📝</div>
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {note.updatedAt !== note.createdAt && (
                            <p className="text-xs text-amber-600">
                              Editado em {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowTransformModal(note)}
                          className="p-2 text-amber-500 hover:text-amber-700 transition-colors bg-amber-50 rounded-xl hover:bg-amber-100"
                          title="Transformar em ação"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => useTasksStore.setState({ editingNote: editingNote === note.id ? null : note.id })}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => archiveNote(note.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                          title="Arquivar"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl hover:bg-red-50"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo da nota - ALTURA AUTOMÁTICA */}
                    {editingNote === note.id ? (
                      <textarea
                        className="w-full min-h-[100px] p-4 border border-amber-200 rounded-2xl resize-y focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 font-serif text-gray-700 leading-relaxed"
                        defaultValue={note.content}
                        onBlur={(e) => updateNote(note.id, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className="font-serif text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal de adicionar nota - BORDAS MAIS ARREDONDADAS */}
        <AnimatePresence>
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddNote(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  ✍️ Nova nota na caixa de areia
                </h3>
                
                <textarea
                  className="w-full min-h-[120px] p-4 border border-amber-200 rounded-2xl resize-y focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 font-serif text-gray-700 leading-relaxed"
                  placeholder="Escreva seus pensamentos livremente... (Ctrl+Enter para salvar, Esc para cancelar)"
                  value={newNoteContent}
                  onChange={(e) => useTasksStore.setState({ newNoteContent: e.target.value })}
                  onKeyDown={handleTextareaKeyDown}
                  autoFocus
                />
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-amber-600">
                    💡 Ctrl+Enter para salvar • Esc para cancelar
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                      className={`px-6 py-2 rounded-2xl font-semibold transition-all duration-300 ${
                        newNoteContent.trim()
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Criar Nota
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TaskEditModal />
    </>
  );
}
