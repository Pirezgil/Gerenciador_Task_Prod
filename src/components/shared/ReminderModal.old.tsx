'use client';

import React from 'react';
import { Bell, Clock, Calendar, Settings } from 'lucide-react';
import { useRemindersStore } from '@/stores/remindersStore';
import { useCreateReminder } from '@/hooks/api/useReminders';
import { StandardModal, StandardModalActions, StandardButton } from './StandardModal';
import type { CreateReminderData } from '@/types/reminder';

interface ReminderModalProps {
  entityId: string;
  entityType: 'task' | 'habit';
}

const NOTIFICATION_TYPES = [
  { value: 'push', label: 'Push', icon: Bell, description: 'Notificação no navegador' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Notificação por email' },
  { value: 'sms', label: 'SMS', icon: '📱', description: 'Mensagem de texto' }
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

export function ReminderModal({ entityId, entityType }: ReminderModalProps) {
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
    <StandardModal
      isOpen={showReminderModal}
      onClose={closeReminderModal}
      title="Novo Lembrete"
      subtitle={`Configure um lembrete para este ${entityType === 'habit' ? 'hábito' : 'tarefa'}`}
      icon={Bell}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Lembrete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Lembrete
          </label>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setReminderFormData({ type: 'scheduled' })}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                reminderFormData.type === 'scheduled'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Horário Fixo</div>
                <div className="text-sm opacity-75">Todos os dias no mesmo horário</div>
              </div>
            </button>
            
            {entityType === 'habit' && (
              <button
                type="button"
                onClick={() => setReminderFormData({ type: 'recurring' })}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                  reminderFormData.type === 'recurring'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Dias Específicos</div>
                  <div className="text-sm opacity-75">Escolha dias da semana</div>
                </div>
              </button>
            )}
            
            {entityType === 'task' && (
              <button
                type="button"
                onClick={() => setReminderFormData({ type: 'before_due' })}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                  reminderFormData.type === 'before_due'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                <Clock className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Antes do Prazo</div>
                  <div className="text-sm opacity-75">Minutos antes do vencimento</div>
                </div>
              </button>
            )}
          </div>
        </div>
    
        {/* Configurações específicas */}
        {reminderFormData.type === 'before_due' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutos antes do prazo
            </label>
            <select
              value={reminderFormData.minutesBefore}
              onChange={(e) => setReminderFormData({ minutesBefore: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value={5}>5 minutos</option>
              <option value={10}>10 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
            </select>
          </div>
        )}
        
        {(reminderFormData.type === 'scheduled' || reminderFormData.type === 'recurring') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário
            </label>
            <input
              type="time"
              value={reminderFormData.scheduledTime}
              onChange={(e) => setReminderFormData({ scheduledTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        )}
        
        {reminderFormData.type === 'recurring' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dias da Semana
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOfWeek(day.value)}
                  className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                    reminderFormData.daysOfWeek.includes(day.value)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}
    
        {/* Tipos de Notificação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Como notificar
          </label>
          <div className="space-y-2">
            {NOTIFICATION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleNotificationType(type.value as any)}
                className={`flex items-center w-full p-3 rounded-lg border transition-all duration-200 ${
                  reminderFormData.notificationTypes.includes(type.value as any)
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                <div className="mr-3 text-lg">
                  {typeof type.icon === 'string' ? type.icon : <type.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm opacity-75">{type.description}</div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  reminderFormData.notificationTypes.includes(type.value as any)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {reminderFormData.notificationTypes.includes(type.value as any) && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Mensagem Personalizada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem personalizada (opcional)
          </label>
          <textarea
            value={reminderFormData.message}
            onChange={(e) => setReminderFormData({ message: e.target.value })}
            placeholder="Digite uma mensagem personalizada para este lembrete..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            rows={3}
          />
        </div>

        <StandardModalActions>
          <StandardButton
            type="button"
            variant="secondary"
            onClick={closeReminderModal}
          >
            Cancelar
          </StandardButton>
          <StandardButton
            type="submit"
            variant="primary"
            disabled={reminderFormData.notificationTypes.length === 0}
            loading={createReminderMutation.isPending}
          >
            Criar Lembrete
          </StandardButton>
        </StandardModalActions>
      </form>
    </StandardModal>
  );
}