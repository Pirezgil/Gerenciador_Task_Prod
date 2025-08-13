'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useRemindersStore } from '@/stores/remindersStore';
import { useNotification } from '@/hooks/useNotification';
import { useIsAuthenticated } from '@/hooks/api/useAuth';

export function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSupported, isRegistered, requestPermission, testNotification } = useServiceWorker();
  const { notificationPermission } = useRemindersStore();
  const { success, error } = useNotification();
  const { isAuthenticated } = useIsAuthenticated();

  useEffect(() => {
    // CORREÇÃO DE SEGURANÇA: Mostrar banner apenas se usuário estiver autenticado
    // 1. Usuário deve estar autenticado
    // 2. Notificações são suportadas
    // 3. Service Worker está registrado
    // 4. Permissão ainda não foi solicitada (default)
    // 5. Usuário não fechou o banner permanentemente
    const shouldShow = 
      isAuthenticated &&  // <-- NOVA VERIFICAÇÃO DE SEGURANÇA
      isSupported && 
      isRegistered &&
      notificationPermission === 'default' &&
      !localStorage.getItem('notification-banner-dismissed');

    setIsVisible(shouldShow);
    
    // Debug para verificar correção
    if (!isAuthenticated && (isSupported && isRegistered && notificationPermission === 'default')) {
      console.log('🔒 Banner de notificações bloqueado - usuário não autenticado');
    }
  }, [isAuthenticated, isSupported, isRegistered, notificationPermission]);

  const handleRequestPermission = async () => {
    setIsProcessing(true);
    
    try {
      await requestPermission();
      
      // Se a permissão foi concedida, esconder o banner e mostrar sucesso
      if (Notification.permission === 'granted') {
        success('🔔 Notificações ativadas!', {
          description: 'Você receberá lembretes sobre suas tarefas',
          duration: 4000
        });
        setIsVisible(false);
        
        // Testar notificação após 2 segundos
        setTimeout(async () => {
          try {
            await testNotification();
          } catch (testError) {
            console.log('Erro no teste de notificação:', testError);
          }
        }, 2000);
      } else if (Notification.permission === 'denied') {
        error('Permissão negada', {
          description: 'Você pode ativar notificações nas configurações do navegador'
        });
        setIsVisible(false);
        // Guardar que foi negada para não insistir
        localStorage.setItem('notification-banner-dismissed', 'denied');
      }
    } catch (err) {
      error('Erro ao ativar notificações', {
        description: 'Tente novamente ou verifique as configurações do navegador'
      });
      console.error('Erro ao solicitar permissão:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('notification-banner-dismissed', 'user-dismissed');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-blue-100" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                🔔 Ative as notificações para receber lembretes das suas tarefas
              </p>
              <p className="text-xs text-blue-100 mt-1">
                Você será notificado no horário certo para não perder nada importante
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRequestPermission}
              disabled={isProcessing}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  Ativando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Ativar Notificações
                </>
              )}
            </Button>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-blue-100 hover:text-white transition-colors"
              aria-label="Fechar banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Banner para quando as notificações foram negadas
export function NotificationDeniedBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { notificationPermission } = useRemindersStore();
  const { isAuthenticated } = useIsAuthenticated();

  useEffect(() => {
    // CORREÇÃO DE SEGURANÇA: Mostrar apenas para usuários autenticados
    // Mostrar apenas se foi negada e não foi dispensada pelo usuário
    const shouldShow = 
      isAuthenticated &&  // <-- NOVA VERIFICAÇÃO DE SEGURANÇA
      notificationPermission === 'denied' &&
      !localStorage.getItem('notification-denied-banner-dismissed');

    setIsVisible(shouldShow);
  }, [isAuthenticated, notificationPermission]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('notification-denied-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-100" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                ⚠️ Notificações desativadas
              </p>
              <p className="text-xs text-orange-100 mt-1">
                Para receber lembretes, ative as notificações nas configurações do navegador
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                // Abrir instruções ou configurações
                window.open('https://support.google.com/chrome/answer/3220216?hl=pt-BR', '_blank');
              }}
              size="sm"
              className="bg-white text-orange-600 hover:bg-orange-50 text-xs"
            >
              Como ativar?
            </Button>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-orange-100 hover:text-white transition-colors"
              aria-label="Fechar banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}