// ============================================================================
// USE NOTIFICATION HOOK - Interface principal para componentes
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { notificationSystem } from '@/lib/notifications/NotificationSystem';
import type { 
  NotificationOptions,
  CelebrationOptions,
  LoadingOptions,
  NotificationPreferences,
  NotificationHistoryEntry,
  UseNotificationReturn,
  NotificationContext,
  NotificationEvent
} from '@/types/notification';

/**
 * Hook principal para usar o sistema de notificações
 * Fornece interface simples e reativa para componentes
 */
export function useNotification(): UseNotificationReturn {
  // Estado reativo das preferências
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationSystem.getPreferences()
  );

  // Estado reativo do histórico
  const [history, setHistory] = useState<NotificationHistoryEntry[]>(
    notificationSystem.getHistory()
  );

  // Estado reativo de pausa
  const [isPaused, setIsPaused] = useState(notificationSystem.isPaused());

  // Listener para mudanças no sistema
  useEffect(() => {
    const listener = (event: NotificationEvent) => {
      switch (event.type) {
        case 'preferences_updated':
          setPreferences(notificationSystem.getPreferences());
          break;
        case 'notification_created':
          if (event.payload.notificationId) {
            setHistory(notificationSystem.getHistory());
          }
          break;
        case 'notification_dismissed':
          setHistory(notificationSystem.getHistory());
          break;
      }
    };

    notificationSystem.addEventListener(listener);

    return () => {
      notificationSystem.removeEventListener(listener);
    };
  }, []);

  // Métodos principais - Memoizados para estabilidade
  const success = useCallback((title: string, options?: NotificationOptions): string => {
    return notificationSystem.success(title, options);
  }, []);

  const error = useCallback((title: string, options?: NotificationOptions): string => {
    return notificationSystem.error(title, options);
  }, []);

  const warning = useCallback((title: string, options?: NotificationOptions): string => {
    return notificationSystem.warning(title, options);
  }, []);

  const info = useCallback((title: string, options?: NotificationOptions): string => {
    return notificationSystem.info(title, options);
  }, []);

  const loading = useCallback((title: string, options?: LoadingOptions): string => {
    return notificationSystem.loading(title, options);
  }, []);

  const celebrate = useCallback((title: string, options?: CelebrationOptions): string => {
    return notificationSystem.celebrate(title, options);
  }, []);

  // Controles de notificação
  const dismiss = useCallback((id: string): void => {
    notificationSystem.dismiss(id);
  }, []);

  const dismissAll = useCallback((): void => {
    notificationSystem.dismissAll();
  }, []);

  const update = useCallback((
    id: string, 
    updates: Partial<NotificationOptions & { title?: string }>
  ): void => {
    notificationSystem.update(id, updates);
  }, []);

  // Gerenciamento de preferências
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>): void => {
    notificationSystem.updatePreferences(updates);
  }, []);

  // Controle de histórico
  const markAsRead = useCallback((id: string): void => {
    notificationSystem.markAsRead(id);
    setHistory(notificationSystem.getHistory());
  }, []);

  const clearHistory = useCallback((): void => {
    notificationSystem.clearHistory();
    setHistory([]);
  }, []);

  // Controle de contexto
  const muteContext = useCallback((context: NotificationContext, duration?: number): void => {
    notificationSystem.muteContext(context, duration);
  }, []);

  const unmuteContext = useCallback((context: NotificationContext): void => {
    notificationSystem.unmuteContext(context);
  }, []);

  // Controle geral
  const pause = useCallback((): void => {
    notificationSystem.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback((): void => {
    notificationSystem.resume();
    setIsPaused(false);
  }, []);

  return {
    // Métodos principais
    success,
    error,
    warning,
    info,
    loading,
    celebrate,

    // Controle avançado
    dismiss,
    dismissAll,
    update,

    // Estado e configuração
    preferences,
    updatePreferences,

    // Histórico
    history,
    markAsRead,
    clearHistory,

    // Controle de contexto
    muteContext,
    unmuteContext,

    // Utilitários
    pause,
    resume,
    isPaused
  };
}

// ============================================================================
// HOOKS ESPECIALIZADOS PARA CONTEXTOS ESPECÍFICOS
// ============================================================================

/**
 * Hook especializado para notificações de tarefas
 */
export function useTaskNotifications() {
  const notification = useNotification();

  const taskCreated = useCallback((taskTitle: string) => {
    return notification.success(`Tarefa "${taskTitle}" criada!`, {
      description: 'Nova tarefa adicionada à sua lista',
      context: 'task_crud',
      duration: 3000
    });
  }, [notification]);

  const taskCompleted = useCallback((taskTitle: string, energyGained?: number) => {
    return notification.celebrate(`"${taskTitle}" concluída!`, {
      description: energyGained ? `+${energyGained} pontos de energia` : 'Parabéns pela conclusão!',
      celebrationType: 'task_completion',
      intensity: 'normal',
      visualEffects: true,
      sound: true
    });
  }, [notification]);

  const taskUpdated = useCallback((taskTitle: string) => {
    return notification.info(`Tarefa "${taskTitle}" atualizada`, {
      context: 'task_crud',
      duration: 2000
    });
  }, [notification]);

  const taskDeleted = useCallback((taskTitle: string) => {
    return notification.warning(`Tarefa "${taskTitle}" excluída`, {
      context: 'task_crud',
      duration: 3000
    });
  }, [notification]);

  const energyExceeded = useCallback(() => {
    return notification.warning('Orçamento de energia esgotado', {
      description: 'Complete algumas tarefas ou ajuste seu orçamento diário',
      context: 'energy_system',
      important: true
    });
  }, [notification]);

  return {
    taskCreated,
    taskCompleted,
    taskUpdated,
    taskDeleted,
    energyExceeded
  };
}

/**
 * Hook especializado para notificações de hábitos
 */
export function useHabitNotifications() {
  const notification = useNotification();

  const habitCreated = useCallback((habitName: string) => {
    return notification.success(`Hábito "${habitName}" criado!`, {
      description: 'Novo hábito adicionado à sua rotina',
      context: 'habit_crud'
    });
  }, [notification]);

  const habitCompleted = useCallback((habitName: string, streakCount?: number) => {
    const title = streakCount && streakCount > 1 
      ? `${streakCount} dias seguidos de "${habitName}"!`
      : `"${habitName}" praticado hoje!`;
      
    const intensity = streakCount && streakCount >= 7 
      ? 'intense' 
      : streakCount && streakCount >= 3 
      ? 'normal' 
      : 'subtle';

    return notification.celebrate(title, {
      description: 'Continue assim, você está no caminho certo!',
      celebrationType: 'habit_streak',
      intensity: intensity as CelebrationOptions['intensity'],
      visualEffects: true,
      sound: streakCount && streakCount >= 7
    });
  }, [notification]);

  const streakLost = useCallback((habitName: string, lastStreak: number) => {
    return notification.info(`Sequência de "${habitName}" reiniciada`, {
      description: `Última sequência: ${lastStreak} dias. Recomeçe hoje!`,
      context: 'habit_crud',
      duration: 5000
    });
  }, [notification]);

  return {
    habitCreated,
    habitCompleted,
    streakLost
  };
}

/**
 * Hook especializado para autenticação
 */
export function useAuthNotifications() {
  const notification = useNotification();

  const loginSuccess = useCallback((userName: string) => {
    return notification.success(`Bem-vindo, ${userName}!`, {
      description: 'Login realizado com sucesso',
      context: 'authentication',
      duration: 3000
    });
  }, [notification]);

  const loginError = useCallback((error?: string) => {
    return notification.error('Erro no login', {
      description: error || 'Verifique suas credenciais',
      context: 'authentication',
      duration: 5000
    });
  }, [notification]);

  const sessionExpired = useCallback(() => {
    return notification.warning('Sessão expirada', {
      description: 'Faça login novamente para continuar',
      context: 'authentication',
      important: true,
      action: {
        label: 'Fazer login',
        onClick: () => window.location.href = '/auth'
      }
    });
  }, [notification]);

  const logoutSuccess = useCallback(() => {
    return notification.info('Logout realizado', {
      description: 'Até breve!',
      context: 'authentication',
      duration: 2000
    });
  }, [notification]);

  return {
    loginSuccess,
    loginError,
    sessionExpired,
    logoutSuccess
  };
}

/**
 * Hook para operações assíncronas com loading
 */
export function useAsyncNotification() {
  const notification = useNotification();

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    messages: {
      loading: string;
      success: string;
      error?: string;
    },
    options?: LoadingOptions
  ): Promise<T> => {
    const loadingId = notification.loading(messages.loading, options);

    try {
      const result = await operation();
      
      notification.update(loadingId, {
        title: messages.success
      });

      return result;
    } catch (error) {
      notification.dismiss(loadingId);
      notification.error(messages.error || 'Operação falhou', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        context: options?.context
      });
      throw error;
    }
  }, [notification]);

  return {
    withLoading
  };
}

// Export padrão do hook principal
export default useNotification;