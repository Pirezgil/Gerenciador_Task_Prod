'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { Habit } from '@/types/habit';
import { Reminder } from '@/types/reminder';
import { 
  useEntityReminders, 
  useReminderActions, 
  analyzeReminders, 
  formatReminderSummary 
} from '@/hooks/api/useReminders';
import { Bell, Plus, Settings, Clock, Repeat, Calendar } from 'lucide-react';
import SingleReminderPicker from './SingleReminderPicker';
import RecurringReminderPicker from './RecurringReminderPicker';
import AppointmentReminderDisplay from './AppointmentReminderDisplay';
import { Button } from '@/components/ui/button';

interface ReminderSectionIntegratedProps {
  entity: Task | Habit;
  entityType: 'task' | 'habit';
}

type ModalType = 'none' | 'single' | 'recurring';

export default function ReminderSectionIntegrated({
  entity,
  entityType
}: ReminderSectionIntegratedProps) {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  
  const { data: reminders = [], isLoading } = useEntityReminders(entity.id, entityType);
  const actions = useReminderActions(entityType);
  const analysis = analyzeReminders(reminders);

  // Determinar que tipos de lembretes estão disponíveis
  const canHaveSingleReminder = entityType === 'task' && !('isRecurring' in entity && entity.isRecurring);
  const canHaveRecurringReminders = 
    (entityType === 'task' && 'isRecurring' in entity && entity.isRecurring) || 
    entityType === 'habit';
  const hasAutomaticReminders = 
    entityType === 'task' && 'isAppointment' in entity && entity.isAppointment;

  const handleCreateSingle = async (config: any) => {
    if (!actions.createSingle) return;
    
    try {
      await actions.createSingle.mutateAsync({
        taskId: entity.id,
        config
      });
      setActiveModal('none');
    } catch (error) {
      console.error('Erro ao criar lembrete:', error);
    }
  };

  const handleCreateRecurring = async (config: any) => {
    if (!actions.createRecurring) return;
    
    try {
      await actions.createRecurring.mutateAsync({
        [entityType === 'task' ? 'taskId' : 'habitId']: entity.id,
        config
      });
      setActiveModal('none');
    } catch (error) {
      console.error('Erro ao criar lembretes recorrentes:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      return;
    }

    try {
      await actions.delete.mutateAsync({
        reminderId,
        [entityType === 'task' ? 'taskId' : 'habitId']: entity.id
      });
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-purple-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lembretes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatReminderSummary(reminders)}
              </p>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center space-x-2">
            {canHaveSingleReminder && analysis.total < 5 && (
              <Button
                onClick={() => setActiveModal('single')}
                size="sm"
                variant="outline"
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Criar lembrete
              </Button>
            )}
            
            {canHaveRecurringReminders && analysis.total < 5 && (
              <Button
                onClick={() => setActiveModal('recurring')}
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Repeat className="w-4 h-4 mr-2" />
                lembrete recorrente
              </Button>
            )}
            
            {analysis.total >= 5 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Limite máximo atingido (5/5)
              </span>
            )}
          </div>
        </div>

        {/* Lista de lembretes */}
        {reminders.length > 0 && (
          <div className="space-y-3">
            {analysis.mainReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    reminder.type === 'recurring' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reminder.type === 'recurring' ? 'Lembrete recorrente' : 'Lembrete único'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {reminder.scheduledTime} • {reminder.notificationTypes.join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              </div>
            ))}

            {analysis.intervalReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Lembretes em intervalo
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      A cada {reminder.intervalMinutes} min, {reminder.intervalStartTime} - {reminder.intervalEndTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Lembretes automáticos para compromissos */}
        {hasAutomaticReminders && 'appointment' in entity && entity.appointment && (
          <div className="mt-4">
            <AppointmentReminderDisplay
              appointmentTime={entity.appointment.scheduledTime}
              preparationTime={entity.appointment.preparationTime || 15}
              location={entity.appointment.location}
            />
          </div>
        )}

        {/* Estado vazio */}
        {reminders.length === 0 && !hasAutomaticReminders && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Nenhum lembrete configurado
            </p>
            <div className="flex justify-center space-x-3">
              {canHaveSingleReminder && (
                <Button
                  onClick={() => setActiveModal('single')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lembrete único
                </Button>
              )}
              {canHaveRecurringReminders && (
                <Button
                  onClick={() => setActiveModal('recurring')}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lembrete recorrente
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {activeModal === 'single' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SingleReminderPicker
            onSave={handleCreateSingle}
            onCancel={() => setActiveModal('none')}
            isLoading={actions.createSingle?.isPending}
          />
        </div>
      )}

      {activeModal === 'recurring' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RecurringReminderPicker
            onSave={handleCreateRecurring}
            onCancel={() => setActiveModal('none')}
            isLoading={actions.createRecurring?.isPending}
            entityType={entityType}
          />
        </div>
      )}
    </>
  );
}