'use client';

import { useEffect, useState } from 'react';
import { AppointmentAutoReminder } from '@/types/reminder';

interface AppointmentReminderDisplayProps {
  appointmentTime: string;
  preparationTime: number;
  location?: string;
}

export default function AppointmentReminderDisplay({
  appointmentTime,
  preparationTime,
  location
}: AppointmentReminderDisplayProps) {
  const [reminderTimes, setReminderTimes] = useState<AppointmentAutoReminder | null>(null);

  useEffect(() => {
    // Calcular os horários dos lembretes automáticos
    const calculateReminders = () => {
      try {
        const today = new Date();
        const [hour, minute] = appointmentTime.split(':').map(Number);
        
        const appointment = new Date(today);
        appointment.setHours(hour, minute, 0, 0);
        
        const doublePrep = preparationTime * 2;
        
        // Lembrete "Prepare-se": compromisso - (2 * preparationTime + 10min)
        const prepareTime = new Date(appointment.getTime() - (doublePrep + 10) * 60000);
        
        // Lembrete "Ultra Urgente": compromisso - (2 * preparationTime)
        const urgentTime = new Date(appointment.getTime() - doublePrep * 60000);
        
        setReminderTimes({
          prepareReminder: {
            time: `${prepareTime.getHours().toString().padStart(2, '0')}:${prepareTime.getMinutes().toString().padStart(2, '0')}`,
            message: 'Prepare-se para seu compromisso',
            type: 'prepare'
          },
          urgentReminder: {
            time: `${urgentTime.getHours().toString().padStart(2, '0')}:${urgentTime.getMinutes().toString().padStart(2, '0')}`,
            message: 'Compromisso ultra urgente!',
            type: 'urgent'
          }
        });
      } catch (error) {
        console.error('Erro ao calcular horários dos lembretes:', error);
        setReminderTimes(null);
      }
    };

    calculateReminders();
  }, [appointmentTime, preparationTime]);

  if (!reminderTimes) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Erro ao calcular os lembretes automáticos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-600 text-white text-xs rounded-full">
              🔔
            </span>
            Lembretes Automáticos
          </h4>
          <p className="text-xs text-purple-700 mt-1">
            Criados automaticamente para compromissos
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Ativo
        </span>
      </div>

      <div className="space-y-3">
        {/* Informações do compromisso */}
        <div className="p-3 bg-white rounded-md border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Compromisso</span>
            <span className="text-sm font-semibold text-purple-600">{appointmentTime}</span>
          </div>
          {location && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <span>📍</span>
              {location}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Tempo de preparação: {preparationTime} minutos
          </p>
        </div>

        {/* Lembrete de preparação */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Prepare-se
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {reminderTimes.prepareReminder.time}
            </span>
          </div>
          <p className="text-xs text-blue-700">
            {reminderTimes.prepareReminder.message}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {preparationTime * 2 + 10} minutos antes do compromisso
          </p>
        </div>

        {/* Lembrete urgente */}
        <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-md border border-red-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-red-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Ultra Urgente
            </span>
            <span className="text-sm font-semibold text-red-600">
              {reminderTimes.urgentReminder.time}
            </span>
          </div>
          <p className="text-xs text-red-700">
            {reminderTimes.urgentReminder.message}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {preparationTime * 2} minutos antes do compromisso
          </p>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 p-3 bg-purple-100 rounded-md">
        <h5 className="text-xs font-medium text-purple-800 mb-2">
          ℹ️ Como funcionam os lembretes automáticos:
        </h5>
        <div className="space-y-1 text-xs text-purple-700">
          <p>• <strong>Prepare-se:</strong> {preparationTime * 2 + 10} min antes - Tempo para se organizar</p>
          <p>• <strong>Ultra Urgente:</strong> {preparationTime * 2} min antes - Último aviso para sair</p>
          <p>• Baseados no tempo de preparação configurado ({preparationTime} min)</p>
          <p>• Criados automaticamente - não precisam ser configurados</p>
        </div>
      </div>

      {/* Timeline visual */}
      <div className="mt-4">
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-px bg-purple-200"></div>
          
          {/* Ponto: Lembrete de preparação */}
          <div className="relative flex items-center mb-2">
            <div className="absolute -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="ml-4">
              <span className="text-xs text-blue-600 font-medium">
                {reminderTimes.prepareReminder.time}
              </span>
              <span className="text-xs text-gray-500 ml-2">Prepare-se</span>
            </div>
          </div>
          
          {/* Ponto: Lembrete urgente */}
          <div className="relative flex items-center mb-2">
            <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="ml-4">
              <span className="text-xs text-red-600 font-medium">
                {reminderTimes.urgentReminder.time}
              </span>
              <span className="text-xs text-gray-500 ml-2">Ultra Urgente</span>
            </div>
          </div>
          
          {/* Ponto: Compromisso */}
          <div className="relative flex items-center">
            <div className="absolute -left-2 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">🎯</span>
            </div>
            <div className="ml-4">
              <span className="text-sm text-purple-600 font-semibold">
                {appointmentTime}
              </span>
              <span className="text-sm text-gray-700 ml-2 font-medium">Compromisso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}