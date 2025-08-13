// ============================================================================
// SERVICE WORKER HOOK - Gerenciamento do Service Worker e notificações
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRemindersStore } from '@/stores/remindersStore';
import api from '@/lib/api';
import { useIsAuthenticated } from '@/hooks/api/useAuth';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    registration: null,
    error: null
  });

  const { requestNotificationPermission, notificationPermission } = useRemindersStore();
  const { isAuthenticated } = useIsAuthenticated();

  // Function to wait for Service Worker activation
  const waitForServiceWorkerActivation = (registration: ServiceWorkerRegistration): Promise<void> => {
    return new Promise((resolve) => {
      if (registration.active) {
        console.log('🚀 Service Worker já está ativo');
        resolve();
        return;
      }

      const worker = registration.installing || registration.waiting;
      if (worker) {
        console.log(`⏳ Aguardando ativação do Service Worker (estado: ${worker.state})`);
        
        const handleStateChange = () => {
          console.log(`🔄 Service Worker mudou para: ${worker.state}`);
          if (worker.state === 'activated') {
            worker.removeEventListener('statechange', handleStateChange);
            resolve();
          }
        };
        
        worker.addEventListener('statechange', handleStateChange);
        
        // Timeout para Firefox - se não ativar em 5 segundos, continuar
        setTimeout(() => {
          console.log('⚡ Timeout atingido - continuando mesmo sem ativação completa');
          worker.removeEventListener('statechange', handleStateChange);
          resolve();
        }, 5000);
      } else {
        console.log('⚡ Nenhum worker encontrado - aguardando...');
        setTimeout(resolve, 2000);
      }
    });
  };

  // Utility functions for subscription key conversion
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // Converter para base64url (substitui +/= por -_)
    return window.btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Função para armazenar token no IndexedDB (acessível pelo Service Worker)
  const storeTokenForServiceWorker = async (token: string): Promise<void> => {
    try {
      const request = indexedDB.open('auth-storage', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'key' });
        }
      };
      
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const transaction = db.transaction(['tokens'], 'readwrite');
      const store = transaction.objectStore('tokens');
      
      await new Promise<void>((resolve, reject) => {
        const putRequest = store.put({ key: 'auth-token', value: token, timestamp: Date.now() });
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      });
      
      console.log('🔑 Token armazenado no IndexedDB para Service Worker');
    } catch (error) {
      console.error('❌ Erro ao armazenar token no IndexedDB:', error);
    }
  };

  // Função para notificar Service Worker sobre novo token
  const notifyServiceWorkerToken = async (registration: ServiceWorkerRegistration, token: string): Promise<void> => {
    try {
      if (!registration.active) {
        console.log('⏳ Aguardando Service Worker ativar para enviar token...');
        await waitForServiceWorkerActivation(registration);
      }

      if (registration.active) {
        registration.active.postMessage({
          type: 'AUTH_TOKEN_UPDATE',
          token: token,
          timestamp: Date.now()
        });
        console.log('🔑 Token enviado para Service Worker via postMessage');
      }
    } catch (error) {
      console.error('❌ Erro ao notificar Service Worker sobre token:', error);
    }
  };

  useEffect(() => {
    // Verificar suporte a Service Workers
    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    
    // Configurar listener para mensagens do Service Worker
    const handleServiceWorkerMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SW_REQUEST_TOKEN_REFRESH') {
        console.log('🔄 Service Worker solicitou renovação de token');
        try {
          if (state.registration) {
            await attemptTokenRefresh(state.registration);
          }
        } catch (error) {
          console.error('❌ Erro ao atender solicitação de renovação do SW:', error);
        }
      }
    };
    
    if (isSupported) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    if (!isSupported) {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Service Workers não suportados neste navegador' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Registrar Service Worker
    const registerServiceWorker = async () => {
      try {
        console.log('🔧 Registrando Service Worker...');
        
        // No Firefox, às vezes é necessário aguardar um pouco
        const isFirefox = navigator.userAgent.includes('Firefox');
        if (isFirefox) {
          console.log('🔥 Navegador Firefox detectado - usando registro otimizado');
        }
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Força atualização no Firefox
        });

        console.log('✅ Service Worker registrado com sucesso:', registration);

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          error: null
        }));

        // Aguardar ativação completa do Service Worker
        await waitForServiceWorkerActivation(registration);
        
        console.log('🔔 Service Worker completamente ativo e pronto');

        // Configurar token para Service Worker se usuário estiver autenticado
        await setupServiceWorkerAuth(registration);

        // SINCRONIZAÇÃO PROATIVA: Verificar subscriptions existentes se usuário autenticado
        if (isAuthenticated) {
          console.log('🔍 Usuário autenticado - verificando subscriptions push...');
          await performProactiveSubscriptionSync();
        }

        // CORREÇÃO: Não solicitar permissão automaticamente
        // Permissões serão solicitadas apenas quando usuário estiver logado e optar por ativar
        console.log('🔔 Service Worker pronto. Notificações serão ativadas manualmente pelo usuário após login.');

      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    registerServiceWorker();
    
    // Cleanup do listener
    return () => {
      if (isSupported) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      
      // Limpar interval de token
      if ((window as any).__tokenRefreshInterval) {
        clearInterval((window as any).__tokenRefreshInterval);
      }
    };
  }, []);

  // Configurar autenticação do Service Worker
  const setupServiceWorkerAuth = async (registration: ServiceWorkerRegistration) => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        if (token && isAuthenticated) {
          // Armazenar no IndexedDB
          await storeTokenForServiceWorker(token);
          // Notificar Service Worker
          await notifyServiceWorkerToken(registration, token);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao configurar autenticação do Service Worker:', error);
    }
  };

  // Sistema melhorado de sincronização de token - OTIMIZADO
  useEffect(() => {
    if (state.registration && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      if (token) {
        setupServiceWorkerAuth(state.registration);
        
        // SINCRONIZAÇÃO PROATIVA: Executar quando autenticado
        performProactiveSubscriptionSync();
        
        // CORREÇÃO: Remover setup de interval automático
        // setupTokenRefreshInterval(state.registration, token);
        console.log('🔄 Token refresh interval desabilitado para evitar loop');
      }
    }
  }, [state.registration, isAuthenticated]);

  // SINCRONIZAÇÃO PROATIVA PERIÓDICA (apenas se usuário estiver ativo)
  useEffect(() => {
    if (!isAuthenticated || !state.registration) return;

    // Executar sincronização a cada 30 minutos
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Executando sincronização periódica de push subscriptions...');
        performProactiveSubscriptionSync();
      }
    }, 30 * 60 * 1000); // 30 minutos

    // Executar ao tornar a aba visível (usuário voltou ao app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('👁️ App ficou visível - executando sincronização proativa...');
        performProactiveSubscriptionSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, state.registration]);

  // Listener para mudanças no localStorage (sincronização entre abas)
  useEffect(() => {
    if (!state.registration) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token' && e.newValue && isAuthenticated) {
        console.log('🔄 Token atualizado em outra aba, sincronizando com Service Worker');
        setupServiceWorkerAuth(state.registration!);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.registration, isAuthenticated]);

  // Função para solicitar permissão de notificação (apenas para usuários autenticados)
  const handleNotificationPermission = async () => {
    try {
      // VERIFICAÇÃO DE SEGURANÇA: Usuário deve estar autenticado
      if (!isAuthenticated) {
        console.warn('🔒 Tentativa de solicitar permissão sem autenticação bloqueada');
        throw new Error('Usuário deve estar autenticado para ativar notificações');
      }

      // Verificar se notificações são suportadas
      if (!('Notification' in window)) {
        console.warn('⚠️ Notificações não suportadas neste navegador');
        throw new Error('Notificações não suportadas neste navegador');
      }

      // Se já temos permissão, não precisa solicitar novamente
      if (notificationPermission === 'granted') {
        console.log('✅ Permissão de notificação já concedida');
        // Mesmo assim, garantir que temos push subscription ativa
        await handlePushSubscription();
        return 'granted';
      }

      // Se foi negada, não insistir
      if (notificationPermission === 'denied') {
        console.warn('⚠️ Permissão de notificação foi negada pelo usuário');
        throw new Error('Permissão de notificação foi negada pelo usuário');
      }

      // Solicitar permissão
      console.log('🔔 Solicitando permissão para notificações...');
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permissão para notificações concedida!');
        
        // Criar assinatura push e enviar para backend
        await handlePushSubscription();
        
        // Mostrar notificação de teste
        await showWelcomeNotification();
        
        return 'granted';
      } else {
        console.warn('⚠️ Permissão para notificações não foi concedida:', permission);
        throw new Error(`Permissão não concedida: ${permission}`);
      }

    } catch (error) {
      console.error('❌ Erro ao solicitar permissão para notificações:', error);
      throw error;
    }
  };

  // Função para mostrar notificação de boas-vindas
  const showWelcomeNotification = async () => {
    try {
      if (state.registration && Notification.permission === 'granted') {
        // Garantir que o Service Worker está ativo
        if (!state.registration.active) {
          console.log('⏳ Aguardando Service Worker ativar para notificação de boas-vindas...');
          await waitForServiceWorkerActivation(state.registration);
        }

        await state.registration.showNotification('🎉 Notificações Ativadas!', {
          body: 'Você receberá lembretes sobre suas tarefas e hábitos.',
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          tag: 'welcome-notification',
          silent: false,
          timestamp: Date.now(),
          actions: [
            {
              action: 'dismiss',
              title: 'OK, entendi!'
            }
          ]
        });
        
        console.log('🔔 Notificação de boas-vindas enviada');
      }
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação de boas-vindas:', error);
    }
  };

  // Função para validar assinatura existente
  const validateExistingSubscription = async (subscription: PushSubscription): Promise<boolean> => {
    try {
      // Verificar se a assinatura ainda é válida localmente
      if (!subscription.endpoint) {
        console.log('❌ Assinatura inválida: endpoint ausente');
        return false;
      }

      // Verificar se as chaves estão presentes
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      
      if (!p256dh || !auth) {
        console.log('❌ Assinatura inválida: chaves de criptografia ausentes');
        return false;
      }

      // Verificar comprimento das chaves (detectar corrupção)
      const p256dhBase64 = arrayBufferToBase64(p256dh);
      const authBase64 = arrayBufferToBase64(auth);

      if (p256dhBase64.length !== 65) {
        console.log(`❌ Assinatura corrompida: p256dh tem comprimento ${p256dhBase64.length}, esperado 65`);
        return false;
      }

      if (authBase64.length < 16) {
        console.log(`❌ Assinatura corrompida: auth tem comprimento ${authBase64.length}, esperado >= 16`);
        return false;
      }

      console.log('✅ Assinatura push válida localmente');
      return true;
    } catch (error) {
      console.error('❌ Erro ao validar assinatura:', error);
      return false;
    }
  };

  // Função para limpar assinatura inválida no backend
  const cleanupInvalidSubscription = async (endpoint: string): Promise<void> => {
    try {
      console.log('🧹 Notificando backend sobre assinatura inválida...');
      
      // Tentar notificar o backend para remover assinatura inválida
      await api.delete('/push-subscriptions/cleanup-endpoint', {
        data: { endpoint }
      });
      
      console.log('✅ Backend notificado sobre assinatura inválida');
    } catch (error) {
      console.warn('⚠️ Falha ao notificar backend sobre assinatura inválida:', error);
      // Não é crítico se esta operação falhar
    }
  };

  // Função para sincronização proativa de subscriptions
  const performProactiveSubscriptionSync = async (): Promise<void> => {
    try {
      if (!state.registration || !isAuthenticated) {
        return;
      }

      console.log('🔄 Iniciando sincronização proativa de push subscriptions...');

      // Verificar subscription local
      const localSubscription = await state.registration.pushManager.getSubscription();
      
      if (localSubscription) {
        // Validar subscription local
        const isValidLocal = await validateExistingSubscription(localSubscription);
        
        if (!isValidLocal) {
          console.log('🚫 Subscription local inválida encontrada - removendo proativamente');
          
          // Notificar backend sobre subscription corrompida
          await cleanupInvalidSubscription(localSubscription.endpoint);
          
          // Remover localmente
          try {
            await localSubscription.unsubscribe();
            console.log('✅ Subscription inválida removida proativamente');
          } catch (error) {
            console.warn('⚠️ Erro ao remover subscription localmente:', error);
          }
        } else {
          console.log('✅ Subscription local válida');
        }
      }

      // Verificar com backend se há subscriptions inativas que precisam ser limpas
      try {
        const response = await api.get('/push-subscriptions?isActive=false');
        
        if (response.data.success && response.data.count > 0) {
          console.log(`🧹 ${response.data.count} subscription(s) inativa(s) encontrada(s) no backend`);
          
          // Se há subscriptions inativas, pode ser sinal de problema - não é crítico, apenas informativo
          console.log('ℹ️ Dica: Há subscriptions inativas no backend que serão limpas automaticamente');
        }
      } catch (error) {
        // Não é crítico se esta verificação falhar
        console.warn('⚠️ Não foi possível verificar subscriptions no backend:', error);
      }

      console.log('✅ Sincronização proativa concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização proativa:', error);
      // Não propagar erro - é uma operação de fundo
    }
  };

  // Função para criar e enviar assinatura push para o backend
  const handlePushSubscription = async () => {
    try {
      if (!state.registration) {
        console.warn('⚠️ Service Worker não está registrado');
        return;
      }

      // Garantir que o Service Worker está ativo antes de criar subscription
      if (!state.registration.active) {
        console.log('⏳ Aguardando Service Worker ativar para criar push subscription...');
        await waitForServiceWorkerActivation(state.registration);
      }

      // SINCRONIZAÇÃO PROATIVA: Verificar assinatura existente
      let subscription = await state.registration.pushManager.getSubscription();
      let needsNewSubscription = false;
      
      if (subscription) {
        console.log('🔍 Validando assinatura push existente...');
        
        const isValid = await validateExistingSubscription(subscription);
        
        if (!isValid) {
          console.log('🚫 Assinatura existente inválida, removendo...');
          
          // Limpar assinatura corrompida do backend
          await cleanupInvalidSubscription(subscription.endpoint);
          
          // Remover assinatura localmente
          try {
            await subscription.unsubscribe();
            console.log('✅ Assinatura inválida removida localmente');
          } catch (error) {
            console.warn('⚠️ Falha ao remover assinatura localmente:', error);
          }
          
          needsNewSubscription = true;
          subscription = null;
        } else {
          console.log('✅ Assinatura existente é válida');
        }
      } else {
        console.log('📭 Nenhuma assinatura push encontrada');
        needsNewSubscription = true;
      }
      
      if (needsNewSubscription || !subscription) {
        console.log('🔔 Criando nova assinatura push...');
        
        // VAPID public key (deve corresponder à chave configurada no backend)
        const vapidPublicKey = 'BEq0Fm_4no22iBlar6AF_ChbOCAQLEGiKvP69bCBgWXkgyQA18RPpXFNM0QjEZkvM9-W9g0DkR4WjV_LlpcwgYY';
        
        subscription = await state.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        console.log('✅ Nova assinatura push criada');
      }

      // Converter assinatura para formato esperado pelo backend
      const subscriptionData = {
        subscription: {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        },
        userAgent: navigator.userAgent
      };

      // Enviar para o backend
      console.log('📤 Enviando assinatura para o backend...');
      const response = await api.post('/push-subscriptions', subscriptionData);
      
      if (response.data.success) {
        console.log('✅ Assinatura push registrada no backend:', response.data.data.id);
      } else {
        console.error('❌ Falha ao registrar assinatura no backend:', response.data);
      }

    } catch (error) {
      console.error('❌ Erro ao configurar push subscription:', error);
    }
  };

  // Função para re-solicitar permissão manualmente
  const requestPermission = async () => {
    await handleNotificationPermission();
  };

  // Função para configurar intervalo de renovação de token - DESABILITADO
  const setupTokenRefreshInterval = (registration: ServiceWorkerRegistration, initialToken: string) => {
    // CORREÇÃO: Desabilitar interval agressivo que causa loop no Chrome
    console.log('⚠️ setupTokenRefreshInterval DESABILITADO para evitar loop de autenticação');
    
    // Limpar interval anterior se existir
    if ((window as any).__tokenRefreshInterval) {
      clearInterval((window as any).__tokenRefreshInterval);
      delete (window as any).__tokenRefreshInterval;
    }

    // OPCIONAL: Fazer apenas uma verificação inicial, sem interval
    const doInitialCheck = () => {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('auth-token');
      if (!currentToken) return;
      
      try {
        if (registration.active) {
          // Apenas sincronizar token atual com Service Worker, sem verificação de expiração
          registration.active.postMessage({
            type: 'AUTH_TOKEN_UPDATE',
            token: currentToken,
            timestamp: Date.now()
          });
          console.log('🔑 Token inicial sincronizado com Service Worker');
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar token inicial:', error);
      }
    };

    // Apenas uma verificação inicial, sem repetição
    setTimeout(doInitialCheck, 2000);
  };

  // Função para tentar renovar token automaticamente
  const attemptTokenRefresh = async (registration: ServiceWorkerRegistration) => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.success && response.data.data.token) {
        const newToken = response.data.data.token;
        
        // Atualizar localStorage
        localStorage.setItem('auth-token', newToken);
        
        // Notificar Service Worker
        if (registration.active) {
          registration.active.postMessage({
            type: 'AUTH_TOKEN_UPDATE',
            token: newToken,
            timestamp: Date.now()
          });
        }
        
        console.log('✅ Token renovado automaticamente');
      }
    } catch (error) {
      console.warn('⚠️ Falha ao renovar token automaticamente:', error);
      // Em caso de falha, o interceptor do axios cuidará do logout
    }
  };

  // Função para testar notificação
  const testNotification = async () => {
    try {
      if (!state.registration) {
        throw new Error('Service Worker não está registrado');
      }

      if (!state.registration.active) {
        console.log('⏳ Aguardando Service Worker ativar...');
        await waitForServiceWorkerActivation(state.registration);
      }

      if (Notification.permission !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      console.log('📤 Enviando notificação de teste...');
      
      await state.registration.showNotification('🧪 Teste de Notificação', {
        body: 'Esta é uma notificação de teste do sistema de lembretes.',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: 'test-notification',
        timestamp: Date.now(),
        requireInteraction: false,
        actions: [
          {
            action: 'close',
            title: 'Fechar'
          }
        ]
      });

      console.log('✅ Notificação de teste enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      throw error;
    }
  };

  return {
    ...state,
    requestPermission,
    testNotification,
    notificationPermission
  };
};