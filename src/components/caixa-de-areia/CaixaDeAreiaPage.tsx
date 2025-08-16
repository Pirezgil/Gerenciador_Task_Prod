'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Lock, Sparkles, Edit3, Archive, Plus, SortAsc, SortDesc, Settings, ListTodo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/api/useNotes';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/providers/AuthProvider';
import { useModalsStore } from '@/stores/modalsStore';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen bg-gray-50">
        {/* Header - DUAL LAYOUT MOBILE/DESKTOP */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="py-4 sm:py-6 lg:py-8">
              
              {/* MOBILE HEADER (< sm) */}
              <div className="sm:hidden">
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-gray-900">Pátio das Ideias</h1>
                  <p className="text-gray-600 mt-1 text-sm">Seu espaço seguro para pensamentos livres</p>
                </div>

                {/* Botão Mobile */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleConfigurePassword}
                    className="w-full max-w-xs min-h-[48px] text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Configurar Senha</span>
                  </Button>
                </div>
              </div>

              {/* DESKTOP HEADER (≥ sm) - LAYOUT ORIGINAL MELHORADO */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🏖️</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Pátio das Ideias Privado</h1>
                      <p className="text-gray-600 mt-1">Seu espaço seguro para pensamentos livres</p>
                    </div>
                  </div>
                  
                  {/* Botão de Configurações Desktop */}
                  <Button
                    onClick={handleConfigurePassword}
                    variant="outline"
                    className="inline-flex items-center space-x-2 px-4 py-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurar Senha</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Acesso Restrito</h2>
                <p className="text-gray-600 mt-1">Digite sua senha para continuar</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                  )}
                </div>
                
                <Button
                  onClick={handlePasswordSubmit}
                  disabled={!password.trim()}
                  className="w-full"
                >
                  Acessar Pátio das Ideias
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Senha não configurada?{' '}
                  <button
                    onClick={handleConfigurePassword}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Configure nas configurações
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - DUAL LAYOUT MOBILE/DESKTOP */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="py-4 sm:py-6 lg:py-8">
              
              {/* MOBILE HEADER (< sm) */}
              <div className="sm:hidden">
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    {showArchivedNotes ? 'Notas Arquivadas' : 'Pátio das Ideias'}
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm">
                    {showArchivedNotes ? archivedNotes.length : activeNotes.length} nota(s) • {sortBy === 'created' ? 'criação' : 'edição'}
                  </p>
                </div>

                {/* Botão Mobile */}
                <div className="flex justify-center">
                  {!showArchivedNotes && (
                    <Button
                      onClick={handleNewNote}
                      className="w-full max-w-xs min-h-[48px] text-base font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      <span>Nova Nota</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* DESKTOP HEADER (≥ sm) - LAYOUT ORIGINAL MELHORADO */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">{showArchivedNotes ? '📚' : '🏖️'}</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {showArchivedNotes ? 'Notas Arquivadas' : 'Pátio das Ideias Privado'}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        {showArchivedNotes ? archivedNotes.length : activeNotes.length} nota(s) • Organizada por {sortBy === 'created' ? 'criação' : 'edição'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Métricas Desktop */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{activeNotes.length}</div>
                      <div className="text-sm text-gray-500">Ativas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{archivedNotes.length}</div>
                      <div className="text-sm text-gray-500">Arquivadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Ação Desktop */}
                <div className="mt-6 flex justify-end">
                  {!showArchivedNotes && (
                    <Button
                      onClick={handleNewNote}
                      className="inline-flex items-center space-x-2 px-4 py-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova Nota</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Navigation - DUAL LAYOUT MOBILE/DESKTOP */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            
            {/* MOBILE NAVIGATION (< sm) */}
            <div className="sm:hidden">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleToggleArchivedNotes}
                  variant={showArchivedNotes ? "default" : "outline"}
                  className="w-full flex items-center justify-center space-x-2 min-h-[48px] text-base"
                >
                  <Archive className="w-5 h-5" />
                  <span>{showArchivedNotes ? 'Ver Ativas' : 'Ver Arquivadas'}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                    {showArchivedNotes ? activeNotes.length : archivedNotes.length}
                  </span>
                </Button>
                
                <Button
                  onClick={handleSortToggle}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 min-h-[48px] text-base"
                >
                  {sortBy === 'updated' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
                  <span>{sortBy === 'created' ? 'Por Criação' : 'Por Edição'}</span>
                </Button>
              </div>
            </div>

            {/* DESKTOP NAVIGATION (≥ sm) - LAYOUT ORIGINAL */}
            <div className="hidden sm:flex gap-2 flex-wrap">
              <Button
                onClick={handleToggleArchivedNotes}
                variant={showArchivedNotes ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Archive className="w-4 h-4" />
                <span>{showArchivedNotes ? 'Ativas' : 'Arquivadas'}</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {showArchivedNotes ? activeNotes.length : archivedNotes.length}
                </span>
              </Button>
              
              <Button
                onClick={handleSortToggle}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {sortBy === 'updated' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                <span>{sortBy === 'created' ? 'Data de Criação' : 'Última Edição'}</span>
              </Button>
            </div>
          </div>

          {/* Content Title - MOBILE OTIMIZADO */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
              {showArchivedNotes 
                ? `Notas Arquivadas (${archivedNotes.length})`
                : `Notas Ativas (${activeNotes.length})`
              }
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {sortedNotes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {/* MOBILE EMPTY STATE */}
                <div className="sm:hidden p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {showArchivedNotes ? (
                      <Archive className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {showArchivedNotes ? 'Nenhuma arquivada' : 'Caixa vazia'}
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    {showArchivedNotes ? (
                      'Suas notas arquivadas aparecerão aqui.'
                    ) : (
                      'Seu espaço privado para pensamentos livres.'
                    )}
                  </p>
                  {!showArchivedNotes && (
                    <Button 
                      onClick={() => setShowAddNote(true)}
                      className="min-h-[48px] px-6 text-base font-medium"
                    >
                      Criar primeira nota
                    </Button>
                  )}
                </div>

                {/* DESKTOP EMPTY STATE */}
                <div className="hidden sm:block p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {showArchivedNotes ? (
                      <Archive className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
                    <Button 
                      onClick={() => setShowAddNote(true)}
                      className="px-8 py-3"
                    >
                      Criar primeira nota
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {sortedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:border-gray-300 transition-colors shadow-sm"
                  >
                    {/* CONTEÚDO DA NOTA - SEMPRE NO TOPO */}
                    {editingNote === note.id && !showArchivedNotes ? (
                      <textarea
                        className="w-full min-h-[100px] p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 leading-relaxed mb-4"
                        defaultValue={note.content}
                        onBlur={(e) => updateNote.mutateAsync({ 
                          noteId: note.id, 
                          updates: { content: e.target.value } 
                        })}
                        onKeyDown={(e) => handleEditNoteKeyDown(e, note.id)}
                        autoFocus
                      />
                    ) : (
                      <div className={`leading-relaxed whitespace-pre-wrap mb-4 ${
                        showArchivedNotes ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {note.content}
                      </div>
                    )}

                    {/* MOBILE FOOTER - Layout empilhado */}
                    <div className="sm:hidden">
                      {/* Data e ícone */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-xl">📝</div>
                        <div className="flex-1">
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
                            <p className="text-xs text-blue-600">
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
                      
                      {/* Botões de ação - Mobile - JUSTIFICADOS */}
                      <div className="flex items-center justify-between gap-2">
                        {showArchivedNotes ? (
                          <>
                            <Button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'active' } })}
                              variant="outline"
                              size="sm"
                              className="flex-1 min-h-[44px] text-sm"
                              title="Reativar nota"
                            >
                              <Archive className="w-4 h-4 rotate-180 mr-2" />
                              Reativar
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700 min-h-[44px] text-sm"
                              title="Deletar definitivamente"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => setShowTransformModal(note)}
                              variant="outline"
                              size="sm"
                              className="flex-1 min-h-[44px]"
                              title="Transformar em ação"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setEditingNote(editingNote === note.id ? null : note.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 min-h-[44px]"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'archived' } })}
                              variant="outline"
                              size="sm"
                              className="flex-1 min-h-[44px]"
                              title="Arquivar"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700 min-h-[44px]"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* DESKTOP FOOTER - Layout horizontal */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">📝</div>
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
                            <p className="text-xs text-blue-600">
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
                      <div className="flex items-center gap-1 sm:gap-2">
                        {showArchivedNotes ? (
                          <>
                            <Button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'active' } })}
                              variant="outline"
                              size="sm"
                              className="p-2"
                              title="Reativar nota"
                            >
                              <Archive className="w-4 h-4 rotate-180" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.id)}
                              variant="outline"
                              size="sm"
                              className="p-2 text-red-600 hover:text-red-700"
                              title="Deletar definitivamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => setShowTransformModal(note)}
                              variant="outline"
                              size="sm"
                              className="p-2"
                              title="Transformar em ação"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setEditingNote(editingNote === note.id ? null : note.id)}
                              variant="outline"
                              size="sm"
                              className="p-2"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => updateNote.mutate({ noteId: note.id, updates: { status: 'archived' } })}
                              variant="outline"
                              size="sm"
                              className="p-2"
                              title="Arquivar"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.id)}
                              variant="outline"
                              size="sm"
                              className="p-2 text-red-600 hover:text-red-700"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
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
              className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Nova nota na caixa de areia
              </h3>
              <textarea
                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 leading-relaxed"
                placeholder="Escreva seus pensamentos livremente..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                autoFocus
              />
              <div className="flex justify-end items-center mt-6 space-x-3">
                <Button
                  onClick={() => setShowAddNote(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                >
                  Criar Nota
                </Button>
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
              className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleDeleteConfirmationKeyDown}
              tabIndex={0}
            >
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirmar exclusão
                </h3>
                <p className="text-gray-600 mb-2">
                  Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
                </p>
                <p className="text-xs text-gray-500">
                  Enter para confirmar • Esc para cancelar
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={cancelDeleteNote}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDeleteNote}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </Button>
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