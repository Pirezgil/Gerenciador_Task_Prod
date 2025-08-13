'use client';

// ============================================================================
// NOTIFICATION SETTINGS - Configurações de notificações
// ============================================================================

import React, { useState } from 'react';
import { Bell, Settings, TestTube } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import api from '@/lib/api';
import { useNotification } from '@/hooks/useNotification';

export function NotificationSettings() {
  const { user } = useAuth();
  const { 
    isSupported, 
    isRegistered, 
    notificationPermission, 
    requestPermission, 
    testNotification, 
    error 
  } = useServiceWorker();
  
  const [settings, setSettings] = useState({
    notifications: user?.settings.notifications || false,
  });
  
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  
  // Hook de notificação
  const { success, error: showError } = useNotification();

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // TODO: Implement settings update via API or new auth system
    if (key === 'notifications') {
      // For now, just update local state
      console.log('Settings updated:', { notifications: newSettings.notifications });
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } catch (err) {
      showError('Erro ao solicitar permissão', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'authentication'
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      // Primeiro testar via Service Worker local
      await testNotification();
      
      // Aguardar um pouco antes de testar via backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Depois testar via backend (notificação real)
      const response = await api.post('/push-subscriptions/test');
      
      if (response.data.success) {
        success('Notificação teste enviada!', {
          description: 'Verifique se a notificação apareceu no seu dispositivo',
          context: 'authentication'
        });
      } else {
        showError('Falha no teste via backend', {
          description: response.data.message || 'Verifique as configurações',
          context: 'authentication'
        });
      }
      
    } catch (err) {
      showError('Erro ao testar notificação', {
        description: err instanceof Error ? err.message : 'Verifique o console do navegador para mais detalhes',
        context: 'authentication'
      });
    } finally {
      setIsTestingNotification(false);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) return { text: 'Não Suportado', color: 'text-red-600 bg-red-50' };
    if (!isRegistered) return { text: 'Registrando...', color: 'text-yellow-600 bg-yellow-50' };
    if (notificationPermission === 'granted') return { text: 'Ativo', color: 'text-green-600 bg-green-50' };
    if (notificationPermission === 'denied') return { text: 'Negado', color: 'text-red-600 bg-red-50' };
    return { text: 'Pendente', color: 'text-yellow-600 bg-yellow-50' };
  };

  const permissionStatus = getPermissionStatus();

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


        {/* Status do Service Worker e Controles */}
        <div className="space-y-4 mt-8">
          <h3 className="font-semibold text-gray-900">Status do Sistema de Notificações</h3>
          
          {/* Status atual */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Service Worker</h4>
                <p className="text-sm text-gray-600">
                  {isSupported ? 'Suportado' : 'Não suportado'} • {isRegistered ? 'Registrado' : 'Não registrado'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${permissionStatus.color}`}>
              {permissionStatus.text}
            </span>
          </div>

          {/* Controles */}
          <div className="flex gap-3">
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission || !isSupported}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Bell className="w-4 h-4" />
                {isRequestingPermission ? 'Solicitando...' : 'Solicitar Permissão'}
              </button>
            )}
            
            {notificationPermission === 'granted' && (
              <button
                onClick={handleTestNotification}
                disabled={isTestingNotification || !isRegistered}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TestTube className="w-4 h-4" />
                {isTestingNotification ? 'Enviando...' : 'Testar Notificação'}
              </button>
            )}
          </div>

          {/* Erros */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}

          {/* Instruções para caso negado */}
          {notificationPermission === 'denied' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Notificações bloqueadas.</strong> Para reativá-las, clique no ícone de cadeado na barra de endereços e altere a permissão para "Permitir".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
