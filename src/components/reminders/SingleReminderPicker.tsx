'use client';

import { useState } from 'react';
import { TaskReminderConfig } from '@/types/reminder';

interface SingleReminderPickerProps {
  onSave: (config: TaskReminderConfig) => void;
  onCancel: () => void;
  initialConfig?: Partial<TaskReminderConfig>;
  isLoading?: boolean;
}

export default function SingleReminderPicker({
  onSave,
  onCancel,
  initialConfig = {},
  isLoading = false
}: SingleReminderPickerProps) {
  const [config, setConfig] = useState<TaskReminderConfig>({
    enabled: initialConfig.enabled ?? true,
    reminderDate: initialConfig.reminderDate ?? new Date().toISOString().split('T')[0],
    reminderTime: initialConfig.reminderTime ?? '09:00',
    notificationTypes: initialConfig.notificationTypes ?? ['push'],
    message: initialConfig.message ?? ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const toggleNotificationType = (type: 'push' | 'email') => {
    setConfig(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter(t => t !== type)
        : [...prev.notificationTypes, type]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configurar Lembrete Único
        </h3>
        <p className="text-sm text-gray-600">
          Configure um lembrete específico para esta tarefa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Habilitado */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Lembrete ativo
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
            {/* Data do lembrete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do lembrete
              </label>
              <input
                type="date"
                value={config.reminderDate}
                onChange={(e) => setConfig(prev => ({ ...prev, reminderDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Horário do lembrete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário do lembrete
              </label>
              <input
                type="time"
                value={config.reminderTime}
                onChange={(e) => setConfig(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

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

            {/* Mensagem personalizada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem personalizada (opcional)
              </label>
              <textarea
                value={config.message}
                onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite uma mensagem especial para este lembrete..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {config.message.length}/200 caracteres
              </p>
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
            disabled={isLoading || (config.enabled && config.notificationTypes.length === 0)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : 'Salvar lembrete'}
          </button>
        </div>
      </form>

      {/* Preview do lembrete */}
      {config.enabled && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Você receberá um lembrete em{' '}
            {new Date(config.reminderDate).toLocaleDateString('pt-BR')} às{' '}
            {config.reminderTime} via{' '}
            {config.notificationTypes.map(type => 
              type === 'push' ? 'notificação' : 'email'
            ).join(' e ')}.
            {config.message && (
              <>
                <br />
                <strong>Mensagem:</strong> "{config.message}"
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}