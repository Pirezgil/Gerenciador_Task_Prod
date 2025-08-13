'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Bell, Calendar, Smartphone, Mail, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CreateReminderData } from '@/types/reminder';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface ReminderPickerProps {
  entityType: 'task' | 'habit';
  onRemindersChange: (reminders: CreateReminderData[]) => void;
  initialReminders?: CreateReminderData[];
  disabled?: boolean;
  maxReminders?: number;
}

interface ReminderFormData {
  type: 'before_due' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  minutesBefore?: number;
  daysOfWeek?: number[];
  notificationTypes: ('push' | 'email' | 'sms')[];
  message?: string;
  isActive: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MINUTES_OPTIONS = [5, 10, 15, 30, 60, 120, 240] as const;
const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Seg', full: 'Segunda' },
  { value: 2, label: 'Ter', full: 'Terça' },
  { value: 3, label: 'Qua', full: 'Quarta' },
  { value: 4, label: 'Qui', full: 'Quinta' },
  { value: 5, label: 'Sex', full: 'Sexta' },
  { value: 6, label: 'Sáb', full: 'Sábado' },
] as const;

const NOTIFICATION_TYPES = [
  { value: 'push', label: 'Push', icon: Bell, description: 'Notificação no navegador' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Notificação por email' },
  { value: 'sms', label: 'SMS', icon: Smartphone, description: 'Mensagem de texto' },
] as const;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ReminderPicker({ 
  entityType, 
  onRemindersChange, 
  initialReminders = [], 
  disabled = false,
  maxReminders = 5 
}: ReminderPickerProps) {
  const [reminders, setReminders] = useState<CreateReminderData[]>(initialReminders);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    type: entityType === 'task' ? 'before_due' : 'scheduled',
    minutesBefore: 15,
    scheduledTime: '09:00',
    daysOfWeek: entityType === 'habit' ? [1, 2, 3, 4, 5] : [], // Segunda a sexta para hábitos
    notificationTypes: ['push'],
    message: '',
    isActive: true
  });

  // Sincronizar com parent component
  useEffect(() => {
    onRemindersChange(reminders);
  }, [reminders, onRemindersChange]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddReminder = () => {
    if (reminders.length >= maxReminders) return;

    const newReminder: CreateReminderData = {
      entityType,
      type: formData.type,
      scheduledTime: formData.type === 'scheduled' || formData.type === 'recurring' 
        ? formData.scheduledTime 
        : undefined,
      minutesBefore: formData.type === 'before_due' ? formData.minutesBefore : undefined,
      daysOfWeek: formData.type === 'recurring' ? formData.daysOfWeek || [] : [],
      notificationTypes: formData.notificationTypes,
      message: formData.message || undefined,
      isActive: formData.isActive
    };

    setReminders([...reminders, newReminder]);
    setShowAddForm(false);
    
    // Reset form para próximo lembrete
    setFormData({
      type: entityType === 'task' ? 'before_due' : 'scheduled',
      minutesBefore: 15,
      scheduledTime: '09:00',
      daysOfWeek: entityType === 'habit' ? [1, 2, 3, 4, 5] : [],
      notificationTypes: ['push'],
      message: '',
      isActive: true
    });
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleToggleReminderActive = (index: number) => {
    setReminders(reminders.map((reminder, i) => 
      i === index ? { ...reminder, isActive: !reminder.isActive } : reminder
    ));
  };

  const handleFormChange = (field: keyof ReminderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotificationType = (type: 'push' | 'email' | 'sms') => {
    const current = formData.notificationTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    // Garantir que pelo menos um tipo está selecionado
    if (updated.length > 0) {
      handleFormChange('notificationTypes', updated);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const current = formData.daysOfWeek || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    handleFormChange('daysOfWeek', updated);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderReminderSummary = (reminder: CreateReminderData, index: number) => {
    const getSummaryText = () => {
      if (reminder.type === 'before_due') {
        return `${reminder.minutesBefore} min antes do prazo`;
      }
      if (reminder.type === 'scheduled') {
        return `Diariamente às ${reminder.scheduledTime}`;
      }
      if (reminder.type === 'recurring') {
        const days = reminder.daysOfWeek?.map(d => DAYS_OF_WEEK[d]?.label).join(', ') || '';
        return `${days} às ${reminder.scheduledTime}`;
      }
      return 'Lembrete personalizado';
    };

    const getTypeIcon = () => {
      switch (reminder.type) {
        case 'before_due': return <Clock className="w-4 h-4" />;
        case 'scheduled': return <Calendar className="w-4 h-4" />;
        case 'recurring': return <Settings className="w-4 h-4" />;
        default: return <Bell className="w-4 h-4" />;
      }
    };

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border',
          reminder.isActive 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-1.5 rounded-md',
            reminder.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          )}>
            {getTypeIcon()}
          </div>
          
          <div className="flex-1">
            <div className={cn(
              'font-medium text-sm',
              reminder.isActive ? 'text-gray-900' : 'text-gray-500'
            )}>
              {getSummaryText()}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              {reminder.notificationTypes.map(type => {
                const config = NOTIFICATION_TYPES.find(nt => nt.value === type);
                const Icon = config?.icon || Bell;
                return (
                  <Badge key={type} variant="secondary" className="h-5 px-1.5 text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {config?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleReminderActive(index)}
            className="h-8 w-8 p-0"
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 transition-colors',
              reminder.isActive 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-gray-300'
            )} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveReminder(index)}
            disabled={disabled}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderAddForm = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Novo Lembrete</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(false)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tipo de Lembrete */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Lembrete
        </label>
        <div className="flex space-x-2">
          {entityType === 'task' && (
            <Button
              variant={formData.type === 'before_due' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFormChange('type', 'before_due')}
            >
              <Clock className="w-4 h-4 mr-1" />
              Antes do Prazo
            </Button>
          )}
          
          <Button
            variant={formData.type === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFormChange('type', 'scheduled')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Horário Fixo
          </Button>
          
          {entityType === 'habit' && (
            <Button
              variant={formData.type === 'recurring' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFormChange('type', 'recurring')}
            >
              <Settings className="w-4 h-4 mr-1" />
              Recorrente
            </Button>
          )}
        </div>
      </div>

      {/* Configurações específicas por tipo */}
      {formData.type === 'before_due' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Minutos antes do prazo
          </label>
          <div className="flex flex-wrap gap-2">
            {MINUTES_OPTIONS.map(minutes => (
              <Button
                key={minutes}
                variant={formData.minutesBefore === minutes ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFormChange('minutesBefore', minutes)}
              >
                {minutes}min
              </Button>
            ))}
          </div>
        </div>
      )}

      {(formData.type === 'scheduled' || formData.type === 'recurring') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Horário
          </label>
          <input
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {formData.type === 'recurring' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Dias da Semana
          </label>
          <div className="flex space-x-2">
            {DAYS_OF_WEEK.map(day => (
              <Button
                key={day.value}
                variant={(formData.daysOfWeek || []).includes(day.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDayOfWeek(day.value)}
                className="h-9 w-12 p-0 text-xs"
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tipos de Notificação */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Como notificar
        </label>
        <div className="space-y-2">
          {NOTIFICATION_TYPES.map(type => {
            const Icon = type.icon;
            const isSelected = formData.notificationTypes.includes(type.value as any);
            
            return (
              <div
                key={type.value}
                className={cn(
                  'flex items-center p-2 rounded-md border cursor-pointer transition-colors',
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                )}
                onClick={() => toggleNotificationType(type.value as any)}
              >
                <div className={cn(
                  'w-4 h-4 rounded border-2 mr-3 flex items-center justify-center',
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                )}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                
                <Icon className="w-4 h-4 mr-2" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensagem Personalizada */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mensagem personalizada (opcional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleFormChange('message', e.target.value)}
          placeholder="Digite uma mensagem personalizada para este lembrete..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
        />
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(false)}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleAddReminder}
          disabled={formData.notificationTypes.length === 0}
        >
          <Bell className="w-4 h-4 mr-1" />
          Adicionar Lembrete
        </Button>
      </div>
    </motion.div>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Lembretes</span>
          {reminders.length > 0 && (
            <Badge variant="secondary" className="h-5 px-2">
              {reminders.filter(r => r.isActive).length}/{reminders.length}
            </Badge>
          )}
        </div>
        
        {!disabled && reminders.length < maxReminders && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="h-8 px-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Lista de Lembretes */}
      <AnimatePresence>
        {reminders.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {reminders.map((reminder, index) => renderReminderSummary(reminder, index))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form de Adicionar */}
      <AnimatePresence>
        {showAddForm && renderAddForm()}
      </AnimatePresence>

      {/* Estado Vazio */}
      {reminders.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum lembrete configurado</p>
          {!disabled && (
            <p className="text-xs mt-1">Clique em "Adicionar" para criar seu primeiro lembrete</p>
          )}
        </div>
      )}

      {/* Limite atingido */}
      {reminders.length >= maxReminders && (
        <div className="text-center py-2">
          <p className="text-xs text-amber-600">
            Limite máximo de {maxReminders} lembretes atingido
          </p>
        </div>
      )}
    </div>
  );
}