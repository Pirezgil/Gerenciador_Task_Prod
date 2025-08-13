'use client';

import React from 'react';
import { Bell, Clock, Calendar, Settings, Sparkles } from 'lucide-react';
import { useRemindersStore } from '@/stores/remindersStore';
import { useCreateReminder } from '@/hooks/api/useReminders';
import { ModernModal, ModernModalActions, ModernButton } from './ModernModal';
import type { CreateReminderData } from '@/types/reminder';

interface ModernReminderModalProps {
  entityId: string;
  entityType: 'task' | 'habit';
}

const NOTIFICATION_TYPES = [
  { value: 'push', label: 'Push', icon: '🔔', gradient: 'from-blue-500 to-cyan-500', description: 'Notificação instantânea no navegador' },
  { value: 'email', label: 'Email', icon: '📧', gradient: 'from-emerald-500 to-teal-500', description: 'Lembrete por email' },
  { value: 'sms', label: 'SMS', icon: '📱', gradient: 'from-orange-500 to-red-500', description: 'Mensagem de texto' }
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Seg', full: 'Segunda' },
  { value: 2, label: 'Ter', full: 'Terça' },
  { value: 3, label: 'Qua', full: 'Quarta' },
  { value: 4, label: 'Qui', full: 'Quinta' },
  { value: 5, label: 'Sex', full: 'Sexta' },
  { value: 6, label: 'Sáb', full: 'Sábado' }
];

export function ModernReminderModal({ entityId, entityType }: ModernReminderModalProps) {
  const { 
    showReminderModal, 
    closeReminderModal, 
    reminderFormData, 
    setReminderFormData 
  } = useRemindersStore();
  
  const createReminderMutation = useCreateReminder();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reminderData: CreateReminderData = {
        entityId,
        entityType,
        type: reminderFormData.type,
        scheduledTime: reminderFormData.scheduledTime,
        minutesBefore: reminderFormData.minutesBefore,
        daysOfWeek: reminderFormData.daysOfWeek,
        notificationTypes: reminderFormData.notificationTypes,
        message: reminderFormData.message || undefined,
        isActive: true
      };
      
      await createReminderMutation.mutateAsync(reminderData);
      closeReminderModal();
    } catch (error) {
      console.error('Erro ao criar lembrete:', error);
    }
  };
  
  const toggleNotificationType = (type: 'push' | 'email' | 'sms') => {
    const current = reminderFormData.notificationTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    if (updated.length > 0) {
      setReminderFormData({ notificationTypes: updated });
    }
  };
  
  const toggleDayOfWeek = (day: number) => {
    const current = reminderFormData.daysOfWeek;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    setReminderFormData({ daysOfWeek: updated });
  };
  
  return (
    <ModernModal
      isOpen={showReminderModal}
      onClose={closeReminderModal}
      title="Criar Lembrete"
      subtitle={`Nunca mais esqueça seu ${entityType === 'habit' ? 'hábito' : 'compromisso'}`}
      icon={Sparkles}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Modern Reminder Type Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900">Tipo de Lembrete</h3>
          </div>
          
          <div className="grid gap-4">
            {/* Scheduled Reminder */}
            <div
              onClick={() => setReminderFormData({ type: 'scheduled' })}
              className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                reminderFormData.type === 'scheduled'
                  ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  reminderFormData.type === 'scheduled'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    reminderFormData.type === 'scheduled' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Horário Fixo</h4>
                  <p className="text-sm text-gray-600 mt-1">Receba lembretes todos os dias no mesmo horário</p>
                </div>
                {reminderFormData.type === 'scheduled' && (
                  <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Recurring Reminder (Habits) */}
            {entityType === 'habit' && (
              <div
                onClick={() => setReminderFormData({ type: 'recurring' })}
                className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                  reminderFormData.type === 'recurring'
                    ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    reminderFormData.type === 'recurring'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Settings className={`w-6 h-6 ${
                      reminderFormData.type === 'recurring' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Dias Específicos</h4>
                    <p className="text-sm text-gray-600 mt-1">Escolha quais dias da semana receber lembretes</p>
                  </div>
                  {reminderFormData.type === 'recurring' && (
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Before Due Reminder (Tasks) */}
            {entityType === 'task' && (
              <div
                onClick={() => setReminderFormData({ type: 'before_due' })}
                className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                  reminderFormData.type === 'before_due'
                    ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    reminderFormData.type === 'before_due'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Clock className={`w-6 h-6 ${
                      reminderFormData.type === 'before_due' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Antes do Prazo</h4>
                    <p className="text-sm text-gray-600 mt-1">Receba alertas minutos antes do vencimento</p>
                  </div>
                  {reminderFormData.type === 'before_due' && (
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        {reminderFormData.type === 'before_due' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">Tempo de Antecedência</h3>
            </div>
            <select
              value={reminderFormData.minutesBefore}
              onChange={(e) => setReminderFormData({ minutesBefore: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200 text-gray-900"
            >
              <option value={5}>5 minutos antes</option>
              <option value={10}>10 minutos antes</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={120}>2 horas antes</option>
            </select>
          </div>
        )}
        
        {(reminderFormData.type === 'scheduled' || reminderFormData.type === 'recurring') && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">Horário</h3>
            </div>
            <input
              type="time"
              value={reminderFormData.scheduledTime}
              onChange={(e) => setReminderFormData({ scheduledTime: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200 text-gray-900 text-lg font-medium"
            />
          </div>
        )}
        
        {reminderFormData.type === 'recurring' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">Dias da Semana</h3>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOfWeek(day.value)}
                  className={`p-3 text-center rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105 ${
                    reminderFormData.daysOfWeek.includes(day.value)
                      ? 'border-violet-500 bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 shadow-lg'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-sm">{day.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notification Types */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900">Como Notificar</h3>
          </div>
          <div className="grid gap-4">
            {NOTIFICATION_TYPES.map(type => (
              <div
                key={type.value}
                onClick={() => toggleNotificationType(type.value as any)}
                className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 ${
                  reminderFormData.notificationTypes.includes(type.value as any)
                    ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl p-2 rounded-xl bg-gradient-to-br ${type.gradient} shadow-md`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{type.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    reminderFormData.notificationTypes.includes(type.value as any)
                      ? 'bg-violet-500 border-violet-500'
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {reminderFormData.notificationTypes.includes(type.value as any) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Custom Message */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900">Mensagem Personalizada</h3>
          </div>
          <textarea
            value={reminderFormData.message}
            onChange={(e) => setReminderFormData({ message: e.target.value })}
            placeholder="Digite uma mensagem especial para este lembrete... ✨"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200 resize-none text-gray-900"
            rows={3}
          />
        </div>

        <ModernModalActions>
          <ModernButton
            type="button"
            variant="secondary"
            onClick={closeReminderModal}
          >
            Cancelar
          </ModernButton>
          <ModernButton
            type="submit"
            variant="primary"
            disabled={reminderFormData.notificationTypes.length === 0}
            loading={createReminderMutation.isPending}
          >
            🚀 Criar Lembrete
          </ModernButton>
        </ModernModalActions>
      </form>
    </ModernModal>
  );
}