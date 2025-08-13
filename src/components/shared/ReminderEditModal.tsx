'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Settings } from 'lucide-react';
import { StandardModal, StandardModalActions, StandardButton } from './StandardModal';
import type { Reminder, UpdateReminderData } from '@/types/reminder';

interface ReminderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder | null;
  onUpdate: (reminderId: string, data: UpdateReminderData) => Promise<void>;
  isLoading?: boolean;
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

export function ReminderEditModal({
  isOpen,
  onClose,
  reminder,
  onUpdate,
  isLoading = false
}: ReminderEditModalProps) {
  const [formData, setFormData] = useState({
    type: 'scheduled' as 'scheduled' | 'recurring' | 'before_due',
    scheduledTime: '09:00',
    minutesBefore: 15,
    daysOfWeek: [] as number[],
    notificationTypes: ['push'] as ('push' | 'email' | 'sms')[],
    message: '',
    isActive: true
  });

  // Preencher formulário quando o reminder mudar
  useEffect(() => {
    if (reminder) {
      setFormData({
        type: reminder.type,
        scheduledTime: reminder.scheduledTime || '09:00',
        minutesBefore: reminder.minutesBefore || 15,
        daysOfWeek: reminder.daysOfWeek || [],
        notificationTypes: reminder.notificationTypes,
        message: reminder.message || '',
        isActive: reminder.isActive
      });
    }
  }, [reminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reminder) return;

    try {
      const updateData: UpdateReminderData = {
        type: formData.type,
        scheduledTime: formData.type === 'scheduled' || formData.type === 'recurring' 
          ? formData.scheduledTime 
          : undefined,
        minutesBefore: formData.type === 'before_due' ? formData.minutesBefore : undefined,
        daysOfWeek: formData.type === 'recurring' ? formData.daysOfWeek : [],
        notificationTypes: formData.notificationTypes,
        message: formData.message || undefined,
        isActive: formData.isActive
      };
      
      await onUpdate(reminder.id, updateData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
    }
  };

  const toggleNotificationType = (type: 'push' | 'email' | 'sms') => {
    const current = formData.notificationTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    if (updated.length > 0) {
      setFormData({ ...formData, notificationTypes: updated });
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const current = formData.daysOfWeek;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    setFormData({ ...formData, daysOfWeek: updated });
  };

  if (!reminder) return null;

  const entityType = reminder.entityType;
  
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Lembrete"
      subtitle={`Modifique as configurações deste lembrete`}
      icon={Bell}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status do Lembrete */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Lembrete ativo
            </span>
          </label>
        </div>

        {/* Tipo de Lembrete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Lembrete
          </label>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'scheduled' })}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                formData.type === 'scheduled'
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
                onClick={() => setFormData({ ...formData, type: 'recurring' })}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                  formData.type === 'recurring'
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
                onClick={() => setFormData({ ...formData, type: 'before_due' })}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                  formData.type === 'before_due'
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
        {formData.type === 'before_due' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutos antes do prazo
            </label>
            <select
              value={formData.minutesBefore}
              onChange={(e) => setFormData({ ...formData, minutesBefore: Number(e.target.value) })}
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
        
        {(formData.type === 'scheduled' || formData.type === 'recurring') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        )}
        
        {formData.type === 'recurring' && (
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
                    formData.daysOfWeek.includes(day.value)
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
                  formData.notificationTypes.includes(type.value as any)
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
                  formData.notificationTypes.includes(type.value as any)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.notificationTypes.includes(type.value as any) && (
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
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Digite uma mensagem personalizada para este lembrete..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            rows={3}
          />
        </div>

        <StandardModalActions>
          <StandardButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </StandardButton>
          <StandardButton
            type="submit"
            variant="primary"
            disabled={formData.notificationTypes.length === 0}
            loading={isLoading}
          >
            Salvar Alterações
          </StandardButton>
        </StandardModalActions>
      </form>
    </StandardModal>
  );
}