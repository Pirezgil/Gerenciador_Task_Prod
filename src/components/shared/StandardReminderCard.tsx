'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Settings, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reminder } from '@/types/reminder';

// ============================================================================
// INTERFACES
// ============================================================================

export interface StandardReminderCardProps {
  reminder: Reminder;
  index?: number;
  onToggleActive?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
  onEdit?: (reminder: Reminder) => void;
  showActions?: boolean;
  compact?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getReminderTypeIcon = (type: string) => {
  switch (type) {
    case 'before_due': return Clock;
    case 'scheduled': return Calendar;
    case 'recurring': return Settings;
    default: return Bell;
  }
};

const getReminderTypeText = (reminder: Reminder) => {
  if (reminder.type === 'before_due') {
    return `${reminder.minutesBefore} min antes do prazo`;
  }
  if (reminder.type === 'scheduled') {
    return `Diariamente às ${reminder.scheduledTime}`;
  }
  if (reminder.type === 'recurring') {
    const days = reminder.daysOfWeek?.map(d => 
      ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d]
    ).join(', ') || '';
    return `${days} às ${reminder.scheduledTime}`;
  }
  return 'Lembrete personalizado';
};

const getNotificationTypeConfig = (type: string) => {
  const configs = {
    push: { label: 'Push', emoji: '🔔' },
    email: { label: 'Email', emoji: '📧' },
    sms: { label: 'SMS', emoji: '📱' }
  };
  return configs[type as keyof typeof configs] || { label: type, emoji: '🔔' };
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function StandardReminderCard({
  reminder,
  index = 0,
  onToggleActive,
  onDelete,
  onEdit,
  showActions = true,
  compact = false
}: StandardReminderCardProps) {
  const Icon = getReminderTypeIcon(reminder.type);
  const typeText = getReminderTypeText(reminder);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md',
        reminder.isActive
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-lg'
          : 'bg-gray-50 border-gray-200 opacity-70 hover:opacity-90',
        compact ? 'p-3' : 'p-4'
      )}
      onClick={() => onEdit?.(reminder)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Ícone do Tipo */}
          <div className={cn(
            'p-2 rounded-lg flex-shrink-0',
            reminder.isActive
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          )}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Texto Principal */}
            <div className={cn(
              'font-medium text-sm truncate',
              reminder.isActive ? 'text-gray-900' : 'text-gray-500'
            )}>
              {typeText}
            </div>
            
            {/* Tipos de Notificação */}
            <div className="flex items-center space-x-2 mt-1">
              {reminder.notificationTypes.map(type => {
                const config = getNotificationTypeConfig(type);
                return (
                  <span 
                    key={type} 
                    className={cn(
                      'text-xs px-2 py-1 rounded border inline-flex items-center space-x-1',
                      reminder.isActive
                        ? 'bg-white border-green-200 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500'
                    )}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </span>
                );
              })}
            </div>
            
            {/* Mensagem Personalizada */}
            {reminder.message && !compact && (
              <p className={cn(
                'text-xs mt-2 italic truncate',
                reminder.isActive ? 'text-gray-600' : 'text-gray-400'
              )}>
                &quot;{reminder.message}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        {showActions && (
          <div className="flex items-center space-x-2 ml-3">
            {/* Indicador de Status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive?.(reminder.id);
              }}
              className={cn(
                'w-3 h-3 rounded-full border-2 transition-all duration-200 hover:scale-110',
                reminder.isActive
                  ? 'bg-green-500 border-green-500'
                  : 'bg-gray-300 border-gray-300 hover:border-gray-400'
              )}
              title={reminder.isActive ? 'Desativar lembrete' : 'Ativar lembrete'}
            />
            
            {/* Botão de Excluir */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(reminder.id);
                }}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir lembrete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE DE LISTA PADRONIZADA
// ============================================================================

export interface StandardReminderListProps {
  reminders: Reminder[];
  onToggleActive?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
  onEdit?: (reminder: Reminder) => void;
  showActions?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export function StandardReminderList({
  reminders,
  onToggleActive,
  onDelete,
  onEdit,
  showActions = true,
  compact = false,
  emptyMessage = 'Nenhum lembrete configurado',
  emptySubMessage = 'Clique em "Novo" para criar seu primeiro lembrete'
}: StandardReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 text-sm">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {reminders.map((reminder, index) => (
        <StandardReminderCard
          key={reminder.id}
          reminder={reminder}
          index={index}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
          onEdit={onEdit}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE SEÇÃO PADRONIZADA
// ============================================================================

export interface StandardReminderSectionProps {
  title?: string;
  reminders: Reminder[];
  activeCount?: number;
  onToggleActive?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
  onEdit?: (reminder: Reminder) => void;
  onAddNew?: () => void;
  showActions?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function StandardReminderSection({
  title = 'Lembretes',
  reminders,
  activeCount,
  onToggleActive,
  onDelete,
  onEdit,
  onAddNew,
  showActions = true,
  isLoading = false,
  children
}: StandardReminderSectionProps) {
  const displayActiveCount = activeCount ?? reminders.filter(r => r.isActive).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <span className="bg-blue-100 text-blue-700 text-sm px-2.5 py-1 rounded-full font-medium">
              {displayActiveCount}
            </span>
          </div>
          
          {showActions && onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Novo</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando lembretes...</span>
          </div>
        ) : (
          <>
            <StandardReminderList
              reminders={reminders}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
              onEdit={onEdit}
              showActions={showActions}
            />
            
            {children && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                {children}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}