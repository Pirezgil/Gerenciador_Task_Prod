// ============================================================================
// SERVICE WORKER - Notificações Push e Cache
// ============================================================================

const CACHE_NAME = 'gerenciador-task-v1';
const API_BASE_URL = 'http://localhost:3001/api';

// Armazenamento em memória para token (fallback)
let currentAuthToken = null;

// ============================================================================
// INSTALLATION E ACTIVATION
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  
  // Instalação mais simples para compatibilidade com Firefox
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('✅ Service Worker instalado com sucesso');
    })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativando...');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      loadTokenFromIndexedDB()
    ]).then(() => {
      console.log('🚀 Service Worker totalmente ativo com autenticação configurada');
    })
  );
});

// ============================================================================
// MESSAGE HANDLING - Comunicação com main thread
// ============================================================================

self.addEventListener('message', (event) => {
  const { type, token, timestamp, action } = event.data || {};
  
  if (type === 'AUTH_TOKEN_UPDATE' && token) {
    currentAuthToken = token;
    console.log('🔑 Token de autenticação atualizado no Service Worker');
    
    // Armazenar no IndexedDB como backup
    storeTokenInIndexedDB(token, timestamp);
  } else if (type === 'REQUEST_TOKEN_REFRESH') {
    // Solicitar renovação de token via main thread
    requestTokenRefresh();
  } else if (type === 'TOKEN_VALIDATION_REQUEST') {
    // Validar token atual e responder
    validateAndRespondToken(event);
  }
});

// ============================================================================
// AUTH TOKEN MANAGEMENT
// ============================================================================

// Carregar token do IndexedDB na inicialização
async function loadTokenFromIndexedDB() {
  try {
    const request = indexedDB.open('auth-storage', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tokens')) {
        db.createObjectStore('tokens', { keyPath: 'key' });
      }
    };
    
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['tokens'], 'readonly');
    const store = transaction.objectStore('tokens');
    const getRequest = store.get('auth-token');
    
    const result = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });
    
    if (result && result.value) {
      // Verificar se token não está expirado (margem de 5 minutos)
      const tokenAge = Date.now() - (result.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (tokenAge < maxAge) {
        currentAuthToken = result.value;
        console.log('🔑 Token carregado do IndexedDB no Service Worker');
      } else {
        console.log('⚠️ Token no IndexedDB está muito antigo, ignorando');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar token do IndexedDB:', error);
  }
}

// Armazenar token no IndexedDB
async function storeTokenInIndexedDB(token, timestamp) {
  try {
    const request = indexedDB.open('auth-storage', 1);
    
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['tokens'], 'readwrite');
    const store = transaction.objectStore('tokens');
    
    await new Promise((resolve, reject) => {
      const putRequest = store.put({ 
        key: 'auth-token', 
        value: token, 
        timestamp: timestamp || Date.now() 
      });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
    
    console.log('💾 Token salvo no IndexedDB pelo Service Worker');
  } catch (error) {
    console.error('❌ Erro ao salvar token no IndexedDB:', error);
  }
}

// Função melhorada para obter token armazenado
function getStoredToken() {
  return currentAuthToken;
}

// Verificar se token está expirado
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    // Margem de 1 minuto para evitar race conditions
    return payload.exp < (now + 60);
  } catch (error) {
    console.error('❌ Erro ao verificar expiração do token:', error);
    return true;
  }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('🔔 Push recebido:', event);
  
  let notificationData = {
    title: '🔔 Lembrete',
    body: 'Você tem uma nova notificação',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'reminder-notification',
    data: {}
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.message || payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || `reminder-${Date.now()}`,
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: payload.priority === 'high',
        silent: payload.priority === 'low'
      };
    } catch (error) {
      console.error('Erro ao processar payload do push:', error);
    }
  }
  
  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    }
  );
  
  event.waitUntil(notificationPromise);
});

// ============================================================================
// NOTIFICATION INTERACTIONS
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  let urlToOpen = '/';
  
  // Determinar URL baseada no tipo de lembrete
  if (data.entityType === 'task' && data.entityId) {
    urlToOpen = `/task/${data.entityId}`;
  } else if (data.entityType === 'habit' && data.entityId) {
    urlToOpen = `/habit/${data.entityId}`;
  } else if (data.reminderId) {
    urlToOpen = `/reminders/${data.reminderId}`;
  }
  
  // Ações específicas
  if (action === 'mark-done' && data.entityId) {
    // Marcar como concluído via API (versão com retry)
    event.waitUntil(handleMarkAsDoneWithRetry(data.entityType, data.entityId));
    return;
  } else if (action === 'snooze' && data.reminderId) {
    // Adiar lembrete
    event.waitUntil(handleSnoozeReminder(data.reminderId));
    return;
  } else if (action === 'open-app') {
    // Ação de abrir app (para erros de autenticação)
    urlToOpen = '/auth';
  }
  
  // Abrir aplicação
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Verificar se já existe uma aba aberta
      for (let client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Abrir nova aba
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada:', event.notification.tag);
  
  // Analytics ou tracking aqui se necessário
  const data = event.notification.data || {};
  if (data.reminderId) {
    // Registrar que a notificação foi fechada
    trackNotificationClose(data.reminderId);
  }
});

// ============================================================================
// BACKGROUND SYNC (para ações offline)
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'mark-task-done') {
    event.waitUntil(processPendingActions());
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function handleMarkAsDone(entityType, entityId) {
  try {
    const token = getStoredToken();
    
    // Verificar se temos token válido
    if (!token) {
      console.error('❌ Nenhum token de autenticação disponível');
      await showAuthenticationError('Token de autenticação não disponível');
      return;
    }
    
    if (isTokenExpired(token)) {
      console.error('❌ Token de autenticação expirado');
      await showAuthenticationError('Sua sessão expirou. Abra o app para fazer login novamente');
      return;
    }
    
    const endpoint = entityType === 'task' 
      ? `${API_BASE_URL}/tasks/${entityId}/complete`
      : `${API_BASE_URL}/habits/${entityId}/complete`;
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        date: new Date().toISOString().split('T')[0],
        completedViaNotification: true 
      })
    });
    
    if (response.ok) {
      // Mostrar notificação de sucesso
      await self.registration.showNotification('✅ Concluído!', {
        body: `${entityType === 'task' ? 'Tarefa' : 'Hábito'} marcado como concluído`,
        icon: '/icons/success-icon.png',
        tag: 'completion-success',
        silent: true,
        timestamp: Date.now()
      });
      console.log(`✅ ${entityType} ${entityId} marcado como concluído com sucesso`);
    } else if (response.status === 401) {
      // Token inválido ou expirado
      console.error('❌ Erro de autenticação:', response.status);
      await showAuthenticationError('Sua sessão expirou. Abra o app para continuar');
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao marcar como concluído:', error);
    
    // Salvar ação para tentar novamente quando online
    await saveOfflineAction('mark-done', { entityType, entityId });
    
    // Registrar para background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('mark-task-done');
    }
    
    // Mostrar notificação de erro
    await self.registration.showNotification('❌ Erro ao completar', {
      body: 'Ação será tentada novamente quando você abrir o app',
      icon: '/icons/error-icon.png',
      tag: 'completion-error',
      timestamp: Date.now()
    });
  }
}

async function handleSnoozeReminder(reminderId) {
  try {
    const token = getStoredToken();
    
    // Verificar se temos token válido
    if (!token) {
      console.error('❌ Nenhum token de autenticação disponível');
      await showAuthenticationError('Token de autenticação não disponível');
      return;
    }
    
    if (isTokenExpired(token)) {
      console.error('❌ Token de autenticação expirado');
      await showAuthenticationError('Sua sessão expirou. Abra o app para fazer login novamente');
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        // Adiar por 10 minutos
        nextScheduledAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      })
    });
    
    if (response.ok) {
      await self.registration.showNotification('⏰ Adiado!', {
        body: 'Lembrete adiado por 10 minutos',
        icon: '/icons/snooze-icon.png',
        tag: 'snooze-success',
        silent: true,
        timestamp: Date.now()
      });
      console.log(`⏰ Lembrete ${reminderId} adiado com sucesso`);
    } else if (response.status === 401) {
      // Token inválido ou expirado
      console.error('❌ Erro de autenticação:', response.status);
      await showAuthenticationError('Sua sessão expirou. Abra o app para continuar');
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao adiar lembrete:', error);
    
    // Mostrar notificação de erro
    await self.registration.showNotification('❌ Erro ao adiar', {
      body: 'Não foi possível adiar o lembrete. Tente abrir o app',
      icon: '/icons/error-icon.png',
      tag: 'snooze-error',
      timestamp: Date.now()
    });
  }
}

// Função movida para seção AUTH TOKEN MANAGEMENT acima

async function saveOfflineAction(type, data) {
  // Salvar ação no IndexedDB para executar quando voltar online
  return new Promise((resolve) => {
    const request = indexedDB.open('offline-actions', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      store.add({
        type,
        data,
        timestamp: Date.now()
      });
      
      resolve();
    };
  });
}

async function processPendingActions() {
  // Processar ações pendentes quando voltar online
  return new Promise((resolve) => {
    const request = indexedDB.open('offline-actions', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const actions = getAllRequest.result;
        
        for (const action of actions) {
          try {
            if (action.type === 'mark-done') {
              await handleMarkAsDone(action.data.entityType, action.data.entityId);
            }
            
            // Remover ação após processamento bem-sucedido
            store.delete(action.id);
          } catch (error) {
            console.error('Erro ao processar ação offline:', error);
          }
        }
        
        resolve();
      };
    };
  });
}

// Função para mostrar erro de autenticação
async function showAuthenticationError(message) {
  await self.registration.showNotification('🔒 Autenticação necessária', {
    body: message,
    icon: '/icons/auth-error-icon.png',
    tag: 'auth-error',
    requireInteraction: true,
    actions: [
      {
        action: 'open-app',
        title: 'Abrir App'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ],
    timestamp: Date.now()
  });
}

function trackNotificationClose(reminderId) {
  // Enviar analytics de notificação fechada
  console.log(`📊 Notificação do lembrete ${reminderId} foi fechada`);
}

// ============================================================================
// TOKEN MANAGEMENT IMPROVEMENTS
// ============================================================================

// Solicitar renovação de token via main thread
async function requestTokenRefresh() {
  try {
    // Comunicar com todas as abas abertas para solicitar renovação
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    
    for (const client of clients) {
      client.postMessage({
        type: 'SW_REQUEST_TOKEN_REFRESH',
        timestamp: Date.now()
      });
    }
    
    console.log('🔄 Solicitação de renovação de token enviada para main thread');
  } catch (error) {
    console.error('❌ Erro ao solicitar renovação de token:', error);
  }
}

// Validar token e responder ao main thread
async function validateAndRespondToken(event) {
  const token = getStoredToken();
  const isValid = token && !isTokenExpired(token);
  
  event.ports[0].postMessage({
    type: 'TOKEN_VALIDATION_RESPONSE',
    isValid,
    token: isValid ? token : null,
    timestamp: Date.now()
  });
}

// Versão melhorada da função handleMarkAsDone com retry automático
async function handleMarkAsDoneWithRetry(entityType, entityId, maxRetries = 2) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    
    try {
      let token = getStoredToken();
      
      // Se não temos token ou está expirado, tentar obter novo
      if (!token || isTokenExpired(token)) {
        console.log(`🔄 Token inválido na tentativa ${attempts}, solicitando renovação...`);
        await requestTokenRefresh();
        
        // Aguardar um pouco para dar tempo da renovação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        token = getStoredToken();
        if (!token || isTokenExpired(token)) {
          throw new Error('Token ainda inválido após renovação');
        }
      }
      
      const endpoint = entityType === 'task' 
        ? `${API_BASE_URL}/tasks/${entityId}/complete`
        : `${API_BASE_URL}/habits/${entityId}/complete`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          date: new Date().toISOString().split('T')[0],
          completedViaNotification: true 
        })
      });
      
      if (response.ok) {
        await self.registration.showNotification('✅ Concluído!', {
          body: `${entityType === 'task' ? 'Tarefa' : 'Hábito'} marcado como concluído`,
          icon: '/icons/success-icon.png',
          tag: 'completion-success',
          silent: true,
          timestamp: Date.now()
        });
        console.log(`✅ ${entityType} ${entityId} marcado como concluído com sucesso`);
        return; // Sucesso - sair da função
      } else if (response.status === 401 && attempts < maxRetries) {
        // Token inválido - tentar novamente
        console.log(`⚠️ Falha de autenticação na tentativa ${attempts}, tentando novamente...`);
        currentAuthToken = null; // Invalidar token atual
        continue;
      } else if (response.status === 401) {
        // Última tentativa falhou por autenticação
        await showAuthenticationError('Sua sessão expirou. Abra o app para continuar');
        return;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (attempts < maxRetries) {
        console.log(`⚠️ Erro na tentativa ${attempts}, tentando novamente:`, error.message);
        continue;
      } else {
        // Última tentativa - tratar erro
        console.error('❌ Todas as tentativas falharam:', error);
        
        await saveOfflineAction('mark-done', { entityType, entityId });
        
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          await self.registration.sync.register('mark-task-done');
        }
        
        await self.registration.showNotification('❌ Erro ao completar', {
          body: 'Ação será tentada novamente quando você abrir o app',
          icon: '/icons/error-icon.png',
          tag: 'completion-error',
          timestamp: Date.now()
        });
        return;
      }
    }
  }
}