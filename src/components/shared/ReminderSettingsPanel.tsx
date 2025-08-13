'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Volume2, 
  VolumeX, 
  Save, 
  TestTube,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReminderSettingsPanelProps {
  className?: string;
}

interface NotificationSettings {
  push: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  email: {
    enabled: boolean;
    digest: boolean;
    immediate: boolean;
  };
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
  };
  preferences: {
    defaultReminderTime: number; // minutes before
    batchNotifications: boolean;
    snoozeDefault: number; // minutes
    maxRetries: number;
  };
}

export function ReminderSettingsPanel({ className }: ReminderSettingsPanelProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    push: {
      enabled: true,
      sound: true,
      vibration: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      }
    },
    email: {
      enabled: false,
      digest: true,
      immediate: false
    },
    sms: {
      enabled: false,
      emergencyOnly: true
    },
    preferences: {
      defaultReminderTime: 15,
      batchNotifications: false,
      snoozeDefault: 10,
      maxRetries: 3
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState<string | null>(null);

  const handleSettingChange = (
    category: keyof NotificationSettings,
    setting: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (
    category: keyof NotificationSettings,
    nested: string,
    setting: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nested]: {
          ...(prev[category] as any)[nested],
          [setting]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Configurações salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (type: 'push' | 'email' | 'sms') => {
    setTestingNotification(type);
    try {
      // Simular teste de notificação
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Teste de notificação ${type} enviado`);
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
    } finally {
      setTestingNotification(null);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Configurações de Lembretes
            </h2>
            <p className="text-sm text-text-secondary">
              Personalize como você recebe suas notificações
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notificações Push
            <Badge variant={settings.push.enabled ? "default" : "secondary"}>
              {settings.push.enabled ? 'Ativas' : 'Desativadas'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Ativar notificações push</p>
              <p className="text-sm text-text-secondary">
                Receba lembretes diretamente no navegador
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.push.enabled}
                onChange={(e) => handleSettingChange('push', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.push.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.push.sound ? (
                    <Volume2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">Som de notificação</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.sound}
                    onChange={(e) => handleSettingChange('push', 'sound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Vibração (mobile)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.vibration}
                    onChange={(e) => handleSettingChange('push', 'vibration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Quiet Hours */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">Modo silencioso</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.push.quietHours.enabled}
                      onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.push.quietHours.enabled && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Moon className="w-3 h-3" />
                      <label>De:</label>
                      <input
                        type="time"
                        value={settings.push.quietHours.start}
                        onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-3 h-3" />
                      <label>Até:</label>
                      <input
                        type="time"
                        value={settings.push.quietHours.end}
                        onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('push')}
                disabled={testingNotification === 'push'}
                className="gap-2"
              >
                <TestTube className="w-3 h-3" />
                {testingNotification === 'push' ? 'Enviando...' : 'Testar notificação'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Notificações por Email
            <Badge variant={settings.email.enabled ? "default" : "secondary"}>
              {settings.email.enabled ? 'Ativas' : 'Desativadas'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Ativar emails</p>
              <p className="text-sm text-text-secondary">
                Receba lembretes por email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.enabled}
                onChange={(e) => handleSettingChange('email', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {settings.email.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-green-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">Emails imediatos</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.immediate}
                    onChange={(e) => handleSettingChange('email', 'immediate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Resumo diário</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.digest}
                    onChange={(e) => handleSettingChange('email', 'digest', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('email')}
                disabled={testingNotification === 'email'}
                className="gap-2"
              >
                <TestTube className="w-3 h-3" />
                {testingNotification === 'email' ? 'Enviando...' : 'Testar email'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-600" />
            Notificações por SMS
            <Badge variant={settings.sms.enabled ? "default" : "secondary"}>
              {settings.sms.enabled ? 'Ativas' : 'Desativadas'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Ativar SMS</p>
              <p className="text-sm text-text-secondary">
                Receba lembretes por mensagem de texto
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sms.enabled}
                onChange={(e) => handleSettingChange('sms', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {settings.sms.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-orange-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">Apenas emergências</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms.emergencyOnly}
                    onChange={(e) => handleSettingChange('sms', 'emergencyOnly', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('sms')}
                disabled={testingNotification === 'sms'}
                className="gap-2"
              >
                <TestTube className="w-3 h-3" />
                {testingNotification === 'sms' ? 'Enviando...' : 'Testar SMS'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Preferências Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tempo padrão de lembrete (minutos antes)
              </label>
              <select
                value={settings.preferences.defaultReminderTime}
                onChange={(e) => handleSettingChange('preferences', 'defaultReminderTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:border-primary outline-none"
              >
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={1440}>1 dia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tempo padrão de soneca (minutos)
              </label>
              <select
                value={settings.preferences.snoozeDefault}
                onChange={(e) => handleSettingChange('preferences', 'snoozeDefault', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:border-primary outline-none"
              >
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Agrupar notificações</p>
              <p className="text-sm text-text-secondary">
                Combinar várias notificações em uma única
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.batchNotifications}
                onChange={(e) => handleSettingChange('preferences', 'batchNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}