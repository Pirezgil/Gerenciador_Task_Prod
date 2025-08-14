'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Lock, Sparkles, Edit3, Archive, Plus, SortAsc, SortDesc } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/api/useNotes';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/providers/AuthProvider';
import { useModalsStore } from '@/stores/modalsStore';

import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { TransformModal } from '@/components/protocols/TransformModal';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';

export function CaixaDeAreiaPage() {
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('updated');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [showArchivedNotes, setShowArchivedNotes] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  
  const { setShowTransformModal } = useModalsStore();
  const { user } = useAuth(); // Get user from AuthProvider
  const { sandboxAuth, unlockSandbox } = useAuthStore(); // Only sandbox-specific state
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const needsAuth = !sandboxAuth.isUnlocked;
  const activeNotes = notes.filter(note => note.status === 'active');
  const archivedNotes = notes.filter(note => note.status === 'archived');

  const handleNewNote = () => {
    setShowAddNote(true);
  };

  const handleSortToggle = () => {
    setSortBy(prev => prev === 'created' ? 'updated' : 'created');
  };

  const handleToggleArchivedNotes = () => {
    setShowArchivedNotes(prev => !prev);
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNote.mutate(noteToDelete);
      setNoteToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDeleteNote = () => {
    setNoteToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleDeleteConfirmationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmDeleteNote();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelDeleteNote();
    }
  };

  // Focar no modal de confirmação quando abrir
  useEffect(() => {
    if (showDeleteConfirmation && deleteModalRef.current) {
      deleteModalRef.current.focus();
    }
  }, [showDeleteConfirmation]);

  const sortedNotes = [...notes]
    .filter(note => showArchivedNotes ? note.status === 'archived' : note.status === 'active')
    .sort((a, b) => {
      const dateA = new Date(sortBy === 'created' ? a.createdAt : a.updatedAt);
      const dateB = new Date(sortBy === 'created' ? b.createdAt : b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

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

  const handleConfigurePassword = () => {
    router.push('/settings?tab=security');
  };

  const handleAddNote = async () => {
    if (newNoteContent.trim()) {
      try {
        await createNote.mutateAsync({
          content: newNoteContent,
          status: 'active',
          updatedAt: new Date().toISOString(),
        });
        setNewNoteContent('');
        setShowAddNote(false);
      } catch (error) {
        console.error('Erro ao criar nota:', error);
      }
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
    if (e.key === 'Escape') {
      setShowAddNote(false);
      setNewNoteContent('');
    }
  };

  const handleEditNoteKeyDown = (e: React.KeyboardEvent, noteId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      updateNote.mutateAsync({ 
        noteId: noteId, 
        updates: { content: textarea.value } 
      });
      setEditingNote(null);
    }
    if (e.key === 'Escape') {
      setEditingNote(null);
    }
  };

  if (isLoading) return <div className="p-4">Carregando notas...</div>;

  if (needsAuth) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Caixa de Areia Privada</h1>
              <p className="text-amber-100">Seu espaço seguro para pensamentos livres</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="space-y-6">
              <div>
                <input
                  type="password"
                  placeholder="✨ Digite sua senha mágica"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700 placeholder-gray-400"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                )}
              </div>
              <button
                onClick={handlePasswordSubmit}
                disabled={!password.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  password.trim()
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                🚀 Acessar Caixa de Areia
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Senha não configurada?{' '}
                <button
                  onClick={handleConfigurePassword}
                  className="text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Configure aqui ✨
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🏖️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {showArchivedNotes ? 'Notas Arquivadas' : 'Caixa de Areia Privada'}
                  </h1>
                  <p className="text-amber-100 mt-1">
                    {showArchivedNotes ? archivedNotes.length : activeNotes.length} nota(s) • Organizada por {sortBy === 'created' ? 'criação' : 'edição'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Botão para alternar entre notas ativas e arquivadas */}
                <button
                  onClick={handleToggleArchivedNotes}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                  title={showArchivedNotes ? 'Ver notas ativas' : 'Ver notas arquivadas'}
                >
                  <Archive className="w-4 h-4" />
                  <span className="text-sm">
                    {showArchivedNotes ? 'Ativas' : 'Arquivadas'}
                  </span>
                </button>
                
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
                {!showArchivedNotes && (
                  <button
                    onClick={handleNewNote}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
                    title="Criar nova nota"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">Nova Nota</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className={`backdrop-blur-sm rounded-xl p-4 text-center ${
                !showArchivedNotes ? 'bg-white/20 border border-white/30' : 'bg-white/10'
              }`}>
                <div className="text-2xl font-bold">{activeNotes.length}</div>
                <div className="text-sm text-amber-100">Notas Ativas</div>
              </div>
              <div className={`backdrop-blur-sm rounded-xl p-4 text-center ${
                showArchivedNotes ? 'bg-white/20 border border-white/30' : 'bg-white/10'
              }`}>
                <div className="text-2xl font-bold">{archivedNotes.length}</div>
                <div className="text-sm text-amber-100">Arquivadas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{notes.length}</div>
                <div className="text-sm text-amber-100">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{sortBy === 'created' ? 'Criação' : 'Edição'}</div>
                <div className="text-sm text-amber-100">Ordenação</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {sortedNotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {showArchivedNotes ? (
                    <Archive className="w-10 h-10 text-amber-600" />
                  ) : (
                    <Sparkles className="w-10 h-10 text-amber-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {showArchivedNotes ? 'Nenhuma nota arquivada' : 'Sua caixa de areia está vazia'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {showArchivedNotes ? (
                    <>
                      Suas notas arquivadas aparecerão aqui. <br />
                      Transforme notas em tarefas ou projetos para arquivá-las automaticamente!
                    </>
                  ) : (
                    <>
                      Este é seu espaço privado para pensamentos livres. <br />
                      Crie sua primeira nota!
                    </>
                  )}
                </p>
                {!showArchivedNotes && (
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:from-amber-600 hover:to-orange-600 hover:shadow-energia-alta transition-all duration-300"
                  >
                    ✨ Criar primeira nota
                  </button>
                )}
              </div>
            </div>
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
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-energia-normal/20/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📝</div>
                        <div>
                          <p className="text-sm text-text-muted">
                            {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {note.updatedAt !== note.createdAt && (
                            <p className="text-xs text-energia-alta">
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
                        {showArchivedNotes ? (
                          <>
                            {/* Botões para notas arquivadas */}
                            <button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'active' } })}
                              className="p-2 text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 rounded-xl hover:bg-blue-100"
                              title="Reativar nota"
                            >
                              <Archive className="w-4 h-4 rotate-180" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl hover:bg-red-50"
                              title="Deletar definitivamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Botões para notas ativas */}
                            <button
                              onClick={() => setShowTransformModal(note)}
                              className="p-2 text-energia-normal hover:text-energia-baixa transition-colors bg-surface-light rounded-xl hover:bg-surface"
                              title="Transformar em ação"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingNote(editingNote === note.id ? null : note.id)}
                              className="p-2 text-gray-400 hover:text-text-secondary transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'archived' } })}
                              className="p-2 text-gray-400 hover:text-text-secondary transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                              title="Arquivar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl hover:bg-red-50"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingNote === note.id && !showArchivedNotes ? (
                      <textarea
                        className="w-full min-h-[100px] p-4 border border-energia-normal/20 rounded-2xl resize-y focus:outline-none focus:ring-4 focus:ring-energia-normal/20 focus:border-energia-normal font-serif text-text-secondary leading-relaxed"
                        defaultValue={note.content}
                        onBlur={(e) => updateNote.mutateAsync({ 
                          noteId: note.id, 
                          updates: { content: e.target.value } 
                        })}
                        onKeyDown={(e) => handleEditNoteKeyDown(e, note.id)}
                        autoFocus
                      />
                    ) : (
                      <div className={`font-serif leading-relaxed whitespace-pre-wrap ${
                        showArchivedNotes ? 'text-gray-600' : 'text-text-secondary'
                      }`}>
                        {note.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

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
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                ✍️ Nova nota na caixa de areia
              </h3>
              <textarea
                className="w-full min-h-[120px] p-4 border border-energia-normal/20 rounded-2xl resize-y focus:outline-none focus:ring-4 focus:ring-energia-normal/20 focus:border-energia-normal font-serif text-text-secondary leading-relaxed"
                placeholder="Escreva seus pensamentos livremente..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                autoFocus
              />
              <div className="flex justify-end items-center mt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className={`px-6 py-2 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                      newNoteContent.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-energia-alta'
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

      {/* Modal de confirmação de exclusão */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelDeleteNote}
          >
            <motion.div
              ref={deleteModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleDeleteConfirmationKeyDown}
              tabIndex={0}
            >
              {/* Ícone de aviso */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              {/* Título e mensagem */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirmar exclusão
                </h3>
                <p className="text-gray-600 mb-2">
                  Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
                </p>
                <p className="text-xs text-gray-400">
                  Enter para confirmar • Esc para cancelar
                </p>
              </div>
              
              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteNote}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteNote}
                  className="flex-1 px-4 py-3 text-white bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskEditModal />
      <TransformModal />
      <NewTaskModal />
      <NewProjectModal />
    </>
  );
}