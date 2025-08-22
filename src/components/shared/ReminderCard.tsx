'use client';

import { motion } from 'framer-motion';
import { Clock, Calendar, Bell, Trash2, Edit3, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUpdateReminder, useDeleteReminder } from '@/hooks/api/useReminders';
import { useRemindersStore } from '@/stores/remindersStore';
import type { Reminder } from '@/types/reminder';

interface ReminderCardProps {
  reminder: Reminder;
  showActions?: boolean;
  compact?: boolean;
}

export function ReminderCard({ 
  reminder, 
  showActions = true, 
  compact = false 
}: ReminderCardProps) {
  const { mutate: updateReminder } = useUpdateReminder();
  const { mutate: deleteReminder } = useDeleteReminder();
  const { openReminderModal, setReminderFormData } = useRemindersStore();

  const handleToggleActive = () => {
    updateReminder({
      reminderId: reminder.id,
      updates: { isActive: !reminder.isActive }
    });
  };

  const handleEdit = () => {
    setReminderFormData({
      enabled: reminder.isActive,
      type: reminder.type,
      scheduledTime: reminder.scheduledTime || '',
      minutesBefore: reminder.minutesBefore || 0,
      daysOfWeek: reminder.daysOfWeek,
      notificationTypes: reminder.notificationTypes,
      message: reminder.message || '',
      intervalEnabled: reminder.intervalEnabled,
      intervalMinutes: reminder.intervalMinutes || 30,
      intervalStartTime: reminder.intervalStartTime || '',
      intervalEndTime: reminder.intervalEndTime || ''
    });
    openReminderModal();
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este lembrete?')) {
      deleteReminder(reminder.id);
    }
  };

  const getTypeIcon = () => {
    switch (reminder.type) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'before_due': return <Calendar className="w-4 h-4" />;
      case 'recurring': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (reminder.type) {
      case 'scheduled': return 'Agendado';
      case 'before_due': return 'Antes do prazo';
      case 'recurring': return 'Recorrente';
      default: return 'Lembrete';
    }
  };

  const getEntityTypeLabel = () => {
    switch (reminder.entityType) {
      case 'task': return '📋 Tarefa';
      case 'habit': return '💪 Hábito';
      default: return '📝 Geral';
    }
  };

  const formatNextScheduled = () => {
    if (!reminder.nextScheduledAt) return null;
    
    const date = new Date(reminder.nextScheduledAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `em ${diffHours}h`;
    if (diffMins > 0) return `em ${diffMins}min`;
    return 'agora';
  };

  const isOverdue = reminder.nextScheduledAt && new Date(reminder.nextScheduledAt) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-200',
        !reminder.isActive && 'opacity-60',
        isOverdue && 'border-red-500/30 bg-red-50/5',
        compact && 'p-3'
      )}>
        <CardHeader className={cn('pb-3', compact && 'p-0 pb-2')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={cn(
                'p-1.5 rounded-lg bg-primary/10',
                !reminder.isActive && 'bg-gray-500/10'
              )}>
                {getTypeIcon()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={reminder.isActive ? "default" : "secondary"}>
                    {getTypeLabel()}
                  </Badge>
                  <span className="text-xs text-text-secondary">
                    {getEntityTypeLabel()}
                  </span>
                </div>
                {!compact && (
                  <p className="text-sm text-text-primary line-clamp-2">
                    {reminder.message || 'Lembrete personalizado'}
                  </p>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleToggleActive}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    reminder.isActive 
                      ? 'hover:bg-yellow-100 text-yellow-600' 
                      : 'hover:bg-green-100 text-green-600'
                  )}
                  title={reminder.isActive ? 'Pausar' : 'Ativar'}
                >
                  {reminder.isActive ? 
                    <Pause className="w-3.5 h-3.5" /> : 
                    <Play className="w-3.5 h-3.5" />
                  }
                </button>
                
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn('pt-0', compact && 'p-0')}>
          <div className="space-y-2">
            {/* Próximo agendamento */}
            {reminder.nextScheduledAt && (
              <div className={cn(
                'flex items-center gap-2 text-xs',
                isOverdue ? 'text-red-600' : 'text-text-secondary'
              )}>
                <Clock className="w-3 h-3" />
                <span>
                  {isOverdue ? 'Atrasado' : 'Próximo'}: {formatNextScheduled()}
                </span>
              </div>
            )}

            {/* Tipos de notificação */}
            {reminder.notificationTypes.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {reminder.notificationTypes.map((type) => {
                  const icons = {
                    push: '🔔',
                    email: '📧',
                    sms: '📱'
                  };
                  
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      {icons[type as keyof typeof icons]} {type}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Configurações específicas */}
            <div className="text-xs text-text-secondary space-y-1">
              {reminder.scheduledTime && (
                <div>📅 {reminder.scheduledTime}</div>
              )}
              
              {reminder.minutesBefore !== null && (
                <div>⏰ {reminder.minutesBefore} min antes</div>
              )}
              
              {reminder.daysOfWeek.length > 0 && (
                <div>
                  📆 {reminder.daysOfWeek.map(day => {
                    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    return days[day];
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Indicador de status */}
        <div className={cn(
          'absolute top-0 right-0 w-2 h-full transition-colors',
          reminder.isActive ? 'bg-primary' : 'bg-gray-400',
          isOverdue && 'bg-red-500'
        )} />
      </Card>
    </motion.div>
  );
}