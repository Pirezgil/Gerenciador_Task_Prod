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
      const payload = entityType === 'task' 
        ? { taskId: entity.id, config }
        : { habitId: entity.id, config };
      await actions.createRecurring.mutateAsync(payload as any);
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
      const deletePayload = entityType === 'task' 
        ? { reminderId, taskId: entity.id }
        : { reminderId, habitId: entity.id };
      await actions.delete.mutateAsync(deletePayload as any);
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
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
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
        {/* HEADER RESPONSIVO - Mobile vs Desktop */}
        <div className="mb-6">
          {/* MOBILE HEADER */}
          <div className="sm:hidden">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <Bell className="w-5 h-5 text-purple-600"/>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lembretes
                </h3>
                <p className="text-sm text-gray-600">
                  {formatReminderSummary(reminders)}
                </p>
              </div>
            </div>
            
            {/* Botões mobile - stack vertical em telas muito pequenas */}
            {analysis.total < 5 && (
              <div className="flex flex-col xs:flex-row gap-2">
                {canHaveSingleReminder && (
                  <Button
                    onClick={() => setActiveModal('single')}
                    size="sm"
                    variant="outline"
                    className="flex-1 min-h-[44px] text-purple-600 border-purple-300 hover:bg-purple-50 touch-manipulation"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Lembrete único</span>
                  </Button>
                )}
                
                {canHaveRecurringReminders && (
                  <Button
                    onClick={() => setActiveModal('recurring')}
                    size="sm"
                    variant="outline"
                    className="flex-1 min-h-[44px] text-purple-600 border-purple-300 hover:bg-purple-50 touch-manipulation"
                  >
                    <Repeat className="w-4 h-4 mr-2" />
                    <span className="text-sm">Recorrente</span>
                  </Button>
                )}
              </div>
            )}
            
            {analysis.total >= 5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <span className="text-sm text-amber-700 font-medium">
                  Limite máximo atingido (5/5)
                </span>
              </div>
            )}
          </div>

          {/* DESKTOP HEADER */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <Bell className="w-5 h-5 text-purple-600"/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Lembretes
                </h3>
                <p className="text-sm text-gray-600">
                  {formatReminderSummary(reminders)}
                </p>
              </div>
            </div>
            
            {/* Botões de ação desktop */}
            <div className="flex items-center space-x-2">
              {canHaveSingleReminder && analysis.total < 5 && (
                <Button
                  onClick={() => setActiveModal('single')}
                  size="sm"
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
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
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  lembrete recorrente
                </Button>
              )}
              
              {analysis.total >= 5 && (
                <span className="text-xs text-gray-500">
                  Limite máximo atingido (5/5)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lista de lembretes */}
        {reminders.length > 0 && (
          <div className="space-y-3">
            {analysis.mainReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                {/* LAYOUT MOBILE */}
                <div className="sm:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                      reminder.type === 'recurring' ? 'bg-purple-500' : 'bg-purple-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {reminder.type === 'recurring' ? 'Lembrete recorrente' : 'Lembrete único'}
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        {reminder.scheduledTime}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reminder.notificationTypes.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="min-h-[44px] px-4 py-2 text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {/* LAYOUT DESKTOP */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      reminder.type === 'recurring' ? 'bg-purple-500' : 'bg-purple-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reminder.type === 'recurring' ? 'Lembrete recorrente' : 'Lembrete único'}
                      </p>
                      <p className="text-xs text-gray-500">
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
              </div>
            ))}

            {analysis.intervalReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                {/* LAYOUT MOBILE */}
                <div className="sm:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                        Lembretes em intervalo
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        A cada {reminder.intervalMinutes} min
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        {reminder.intervalStartTime} - {reminder.intervalEndTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="min-h-[44px] px-4 py-2 text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {/* LAYOUT DESKTOP */}
                <div className="hidden sm:flex items-center justify-between">
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
            <Bell className="w-12 h-12 text-purple-300 mx-auto mb-3"/>
            <p className="text-sm text-gray-500 mb-4">
              Nenhum lembrete configurado
            </p>
            
            {/* MOBILE: Botões empilhados */}
            <div className="flex flex-col space-y-2 sm:hidden">
              {canHaveSingleReminder && (
                <Button
                  onClick={() => setActiveModal('single')}
                  size="sm"
                  className="min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white touch-manipulation"
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
                  className="min-h-[44px] text-purple-600 border-purple-300 hover:bg-purple-50 touch-manipulation"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lembrete recorrente
                </Button>
              )}
            </div>

            {/* DESKTOP: Botões lado a lado */}
            <div className="hidden sm:flex justify-center space-x-3">
              {canHaveSingleReminder && (
                <Button
                  onClick={() => setActiveModal('single')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lembrete recorrente
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modais - RESPONSIVOS */}
      {activeModal === 'single' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg">
            <SingleReminderPicker
              onSave={handleCreateSingle}
              onCancel={() => setActiveModal('none')}
              isLoading={actions.createSingle?.isPending}
            />
          </div>
        </div>
      )}

      {activeModal === 'recurring' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md sm:max-w-lg">
            <RecurringReminderPicker
              onSave={handleCreateRecurring}
              onCancel={() => setActiveModal('none')}
              isLoading={actions.createRecurring?.isPending}
              entityType={entityType}
            />
          </div>
        </div>
      )}
    </>
  );
}