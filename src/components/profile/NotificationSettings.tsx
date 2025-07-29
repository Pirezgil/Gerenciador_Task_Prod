'use client';

// ============================================================================
// NOTIFICATION SETTINGS - Configurações de notificações
// ============================================================================

import React, { useState } from 'react';
import { Bell, BellOff, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function NotificationSettings() {
  const { user, updateSettings } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: user?.settings.notifications || false,
    taskReminders: true,
    dailyRecap: true,
    weeklyReport: false,
    energyAlerts: true,
    postponeWarnings: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (key === 'notifications') {
      updateSettings({ notifications: newSettings.notifications });
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Configurações de Notificações</h2>
      
      <div className="space-y-6">
        {/* Notificações gerais */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Notificações Gerais</h3>
              <p className="text-sm text-gray-600">Ativar ou desativar todas as notificações</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Configurações específicas */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Tipos de Notificação</h3>
          
          {[
            { key: 'taskReminders', label: 'Lembretes de Tarefas', desc: 'Notificações sobre tarefas próximas do vencimento', icon: Clock },
            { key: 'dailyRecap', label: 'Resumo Diário', desc: 'Resumo das atividades do dia', icon: Calendar },
            { key: 'weeklyReport', label: 'Relatório Semanal', desc: 'Relatório de produtividade semanal', icon: CheckCircle },
            { key: 'energyAlerts', label: 'Alertas de Energia', desc: 'Avisos quando a energia estiver baixa', icon: BellOff },
            { key: 'postponeWarnings', label: 'Avisos de Adiamento', desc: 'Alertas sobre tarefas adiadas frequentemente', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key as keyof typeof settings)}
                  disabled={!settings.notifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!settings.notifications ? 'opacity-50 cursor-not-allowed' : ''} ${settings.notifications && settings[item.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications && settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
