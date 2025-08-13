'use client';

import { useState } from 'react';
import { RecurringTaskReminderConfig } from '@/types/reminder';
import IntervalReminderConfig from './IntervalReminderConfig';

interface RecurringReminderPickerProps {
  onSave: (config: RecurringTaskReminderConfig) => void;
  onCancel: () => void;
  initialConfig?: Partial<RecurringTaskReminderConfig>;
  isLoading?: boolean;
  entityType?: 'task' | 'habit';
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function RecurringReminderPicker({
  onSave,
  onCancel,
  initialConfig = {},
  isLoading = false,
  entityType = 'task'
}: RecurringReminderPickerProps) {
  const [config, setConfig] = useState<RecurringTaskReminderConfig>({
    enabled: initialConfig.enabled ?? true,
    recurrenceType: initialConfig.recurrenceType ?? 'specific_days',
    daysOfWeek: initialConfig.daysOfWeek ?? [1, 2, 3, 4, 5], // Segunda a sexta por padrão
    reminderTime: initialConfig.reminderTime ?? '09:00',
    intervalEnabled: initialConfig.intervalEnabled ?? false,
    intervalMinutes: initialConfig.intervalMinutes ?? 60,
    intervalStartTime: initialConfig.intervalStartTime ?? '09:00',
    intervalEndTime: initialConfig.intervalEndTime ?? '18:00',
    notificationTypes: initialConfig.notificationTypes ?? ['push']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const toggleDayOfWeek = (day: number) => {
    setConfig(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  const selectAllDays = () => {
    setConfig(prev => ({ ...prev, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }));
  };

  const selectWeekdays = () => {
    setConfig(prev => ({ ...prev, daysOfWeek: [1, 2, 3, 4, 5] }));
  };

  const selectWeekends = () => {
    setConfig(prev => ({ ...prev, daysOfWeek: [0, 6] }));
  };

  const toggleNotificationType = (type: 'push' | 'email') => {
    setConfig(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter(t => t !== type)
        : [...prev.notificationTypes, type]
    }));
  };

  const getDaysPreview = () => {
    if (config.daysOfWeek.length === 7) return 'Todos os dias';
    if (config.daysOfWeek.length === 5 && config.daysOfWeek.every(d => d >= 1 && d <= 5)) {
      return 'Dias úteis (Segunda a Sexta)';
    }
    if (config.daysOfWeek.length === 2 && config.daysOfWeek.includes(0) && config.daysOfWeek.includes(6)) {
      return 'Fins de semana (Sábado e Domingo)';
    }
    return config.daysOfWeek.map(d => dayNames[d]).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configurar Lembretes Recorrentes
        </h3>
        <p className="text-sm text-gray-600">
          Configure lembretes que se repetem para {entityType === 'task' ? 'esta tarefa' : 'este hábito'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Habilitado */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Lembretes ativos
          </label>
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.enabled && (
          <>
            {/* Seleção dos dias da semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Em quais dias você quer receber lembretes?
              </label>
              
              {/* Botões de seleção rápida */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Todos os dias
                </button>
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Dias úteis
                </button>
                <button
                  type="button"
                  onClick={selectWeekends}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Fins de semana
                </button>
              </div>

              {/* Seleção individual dos dias */}
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDayOfWeek(index)}
                    className={`p-2 text-xs font-medium rounded-lg border-2 transition-colors duration-200 ${
                      config.daysOfWeek.includes(index)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Horário principal do lembrete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário principal do lembrete
              </label>
              <input
                type="time"
                value={config.reminderTime}
                onChange={(e) => setConfig(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Configuração de intervalos */}
            <IntervalReminderConfig
              config={{
                intervalEnabled: config.intervalEnabled,
                intervalMinutes: config.intervalMinutes,
                intervalStartTime: config.intervalStartTime,
                intervalEndTime: config.intervalEndTime
              }}
              onChange={(intervalConfig) => setConfig(prev => ({ ...prev, ...intervalConfig }))}
            />

            {/* Tipos de notificação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como você quer ser notificado?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notificationTypes.includes('push')}
                    onChange={() => toggleNotificationType('push')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Notificação push
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notificationTypes.includes('email')}
                    onChange={() => toggleNotificationType('email')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Email
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || (config.enabled && (config.daysOfWeek.length === 0 || config.notificationTypes.length === 0))}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : 'Salvar lembretes'}
          </button>
        </div>
      </form>

      {/* Preview dos lembretes */}
      {config.enabled && config.daysOfWeek.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Preview dos lembretes:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>
              <strong>Principal:</strong> {getDaysPreview()} às {config.reminderTime}
            </p>
            {config.intervalEnabled && (
              <p>
                <strong>Intervalos:</strong> A cada {config.intervalMinutes} minutos entre{' '}
                {config.intervalStartTime} e {config.intervalEndTime}
              </p>
            )}
            <p>
              <strong>Notificações:</strong> Via{' '}
              {config.notificationTypes.map(type => 
                type === 'push' ? 'notificação' : 'email'
              ).join(' e ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}