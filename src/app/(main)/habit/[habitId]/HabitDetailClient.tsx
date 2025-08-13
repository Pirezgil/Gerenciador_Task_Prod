'use client';
// @ts-nocheck

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Calendar, Flame, Trophy, MessageSquare, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHabit, useHabitComments, useAddHabitComment, useCompleteHabit } from '@/hooks/api/useHabits';
import { useUpdateReminder, useDeleteReminder } from '@/hooks/api/useReminders';
import { useRemindersStore } from '@/stores/remindersStore';
import { HabitEditModal } from '@/components/shared/HabitEditModal';
import { ModernReminderModal } from '@/components/shared/ReminderModal';
import { ReminderEditModal } from '@/components/shared/ReminderEditModal';
import ReminderSectionIntegrated from '@/components/reminders/ReminderSectionIntegrated';
import type { Reminder } from '@/types/reminder';
import { format } from 'date-fns';

interface HabitDetailClientProps {
  habitId: string;
}

export function HabitDetailClient({ habitId }: HabitDetailClientProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showReminderEditModal, setShowReminderEditModal] = useState(false);
  
  const { data: habit, isLoading: habitLoading } = useHabit(habitId);
  const { data: comments = [], isLoading: commentsLoading } = useHabitComments(habitId);
  const addCommentMutation = useAddHabitComment();
  const completeHabitMutation = useCompleteHabit();
  
  // Hooks de lembretes
  // const { data: habitReminders = [] } = useHabitReminders(habitId);
  const { openReminderModal, resetReminderForm } = useRemindersStore();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  // Handlers para lembretes
  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowReminderEditModal(true);
  };

  const handleUpdateReminder = async (reminderId: string, updates: any) => {
    await updateReminderMutation.mutateAsync({ reminderId, updates });
    setShowReminderEditModal(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      await deleteReminderMutation.mutateAsync(reminderId);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (habitLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando hábito...</p>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hábito não encontrado</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-600"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // const completedToday = habit.completions?.some(c => c.date === today);
  // const todayCount = habit.completions?.filter(c => c.date === today).reduce((sum, c) => sum + c.count, 0) || 0;

  // Calcular estatísticas dos últimos 30 dias
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const completionsLast30Days = habit.completions?.filter(c => 
    last30Days.includes(c.date)
  ).length || 0;

  // const completionRate = Math.round((completionsLast30Days / 30) * 100);

  // Completar hábito
  const handleComplete = async () => {
    try {
      await completeHabitMutation.mutateAsync({
        habitId: habit.id,
        date: today,
        notes: `Completado em ${new Date().toLocaleString('pt-BR')}`
      });
    } catch (error) {
      console.error('Erro ao completar hábito:', error);
    }
  };

  // Adicionar comentário
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        habitId: habit.id,
        content: newComment,
        author: 'Você'
      });
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">{habit.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{habit.name}</h1>
                    <p className="text-green-100 mt-1">{habit.description || 'Construindo hábitos consistentes'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-2xl hover:bg-white/25 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Edit3 className="w-5 h-5" />
                <span className="font-semibold">Editar</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{habit.streak}</div>
                <div className="text-xs text-green-100">Sequência</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{habit.bestStreak}</div>
                <div className="text-xs text-green-100">Melhor Sequência</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{completionsLast30Days}</div>
                <div className="text-xs text-green-100">Últimos 30 dias</div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Estatísticas Detalhadas */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200/60 backdrop-blur-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 text-center border border-orange-200 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{habit.streak}</div>
              <div className="text-sm text-orange-700 font-medium">Sequência Atual</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 text-center border border-yellow-200 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{habit.bestStreak}</div>
              <div className="text-sm text-yellow-700 font-medium">Melhor Sequência</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 text-center border border-blue-200 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {habit.frequency?.type === 'daily' && 'Diário'}
                {habit.frequency?.type === 'weekly' && 'Semanal'}
                {habit.frequency?.type === 'custom' && 'Custom'}
              </div>
              <div className="text-sm text-blue-700 font-medium">Frequência</div>
            </div>

          </div>
        </div>

        {/* Nova Seção de Lembretes Diferenciada */}
        <ReminderSectionIntegrated
          entity={habit}
          entityType="habit"
        />

        {/* Seção de Comentários */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header da seção */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Comentários</h2>
              </div>
              <span className="bg-gray-200 text-gray-700 text-sm px-2.5 py-1 rounded-full font-medium">
                {comments.length}
              </span>
            </div>
          </div>

          {/* Conteúdo da seção */}
          <div className="p-6">
            {/* Adicionar comentário */}
            <div className="mb-6">
              <form onSubmit={handleAddComment} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.ctrlKey) {
                        e.preventDefault();
                        if (newComment.trim()) {
                          handleAddComment(e as any);
                        }
                      }
                    }}
                    placeholder="Compartilhe suas reflexões sobre este hábito..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-700 placeholder-gray-500"
                    rows={1}
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Enviar comentário"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-green-600"></div>
                  <span className="ml-3 text-gray-600">Carregando comentários...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Nenhum comentário ainda</p>
                  <p className="text-gray-400 text-xs mt-1">Seja o primeiro a compartilhar!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-4 border-green-500 bg-gray-50 pl-4 pr-4 py-3 rounded-r-lg"
                  >
                    <div className="flex items-center justify-end mb-2">
                      <time className="text-xs text-green-600 font-bold">
                        {format(new Date(comment.createdAt), "dd/MM/yy 'às' HH:mm")}
                      </time>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere">{comment.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <HabitEditModal
          habit={habit}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Modal de Lembretes */}
      <ModernReminderModal
        entityId={habitId}
        entityType="habit"
      />
      
      {/* Modal de Edição de Lembretes */}
      <ReminderEditModal
        isOpen={showReminderEditModal}
        onClose={() => {
          setShowReminderEditModal(false);
          setEditingReminder(null);
        }}
        reminder={editingReminder}
        onUpdate={handleUpdateReminder}
        isLoading={updateReminderMutation.isPending}
      />
    </div>
  );
}