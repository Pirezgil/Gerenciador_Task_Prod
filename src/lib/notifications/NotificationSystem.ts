// ============================================================================
// NOTIFICATION SYSTEM - Sistema centralizado de notificações
// ============================================================================

import { toast } from 'sonner';
import type { 
  NotificationOptions,
  NotificationType,
  NotificationContext,
  ErrorCode,
  CelebrationOptions,
  LoadingOptions,
  NotificationPreferences,
  NotificationHistoryEntry,
  NotificationState,
  ErrorMapping,
  NotificationEvent
} from '@/types/notification';

/**
 * Classe principal do sistema de notificações
 * Gerencia estado, preferências, histórico e integração com Sonner
 */
export class NotificationSystem {
  private state: NotificationState;
  private errorMappings: Map<ErrorCode, ErrorMapping> = new Map();
  private loadingToasts: Map<string, string> = new Map(); // id -> toast id
  private eventListeners: ((event: NotificationEvent) => void)[] = [];

  constructor() {
    this.state = this.initializeState();
    this.setupErrorMappings();
    this.loadPreferences();
  }

  /**
   * Inicializa o estado padrão do sistema
   */
  private initializeState(): NotificationState {
    return {
      active: new Map(),
      history: [],
      preferences: this.getDefaultPreferences(),
      paused: false,
      mutedContexts: new Set()
    };
  }

  /**
   * Retorna preferências padrão
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      position: 'top-right',
      soundEnabled: true,
      defaultDuration: 4000,
      maxConcurrent: 5,
      disabledContexts: [],
      celebrationsEnabled: true,
      animationsEnabled: true,
      theme: 'auto'
    };
  }

  /**
   * Configura mapeamentos de erro para mensagens amigáveis (sanitizado para segurança)
   */
  private setupErrorMappings(): void {
    const mappings: Array<[ErrorCode, ErrorMapping]> = [
      // Validação (mensagens genéricas para segurança)
      ['REMINDER_VALIDATION_ERROR', {
        code: 'VALIDATION_ERROR', // Genérico, não revela funcionalidade
        getMessage: () => 'Dados inválidos fornecidos', // Genérico
        getDescription: () => 'Verifique os campos e tente novamente', // Genérico
        type: 'error',
        context: 'form' // Genérico, não revela estrutura
      }],
      
      ['TASK_VALIDATION_ERROR', {
        code: 'VALIDATION_ERROR', // Genérico
        getMessage: () => 'Dados inválidos fornecidos', // Genérico
        getDescription: () => 'Verifique os campos e tente novamente', // Genérico
        type: 'error',
        context: 'form' // Genérico
      }],

      // Limites (mensagens genéricas)
      ['REMINDER_LIMIT_ERROR', {
        code: 'LIMIT_EXCEEDED', // Genérico
        getMessage: () => 'Limite atingido',
        getDescription: () => 'Exclua alguns itens antes de criar novos',
        type: 'warning',
        context: 'form' // Genérico
      }],

      ['ENERGY_LIMIT_EXCEEDED', {
        code: 'LIMIT_EXCEEDED', // Genérico
        getMessage: () => 'Limite atingido',
        getDescription: () => 'Complete algumas ações ou ajuste suas configurações',
        type: 'warning',
        context: 'form' // Genérico
      }],

      // Não encontrado (mensagens genéricas)
      ['TASK_NOT_FOUND', {
        code: 'NOT_FOUND', // Genérico
        getMessage: () => 'Item não encontrado',
        getDescription: () => 'O item solicitado não existe ou não está disponível',
        type: 'error',
        context: 'form' // Genérico
      }],

      // Rede
      ['NETWORK_ERROR', {
        code: 'NETWORK_ERROR',
        getMessage: () => 'Erro de conexão',
        getDescription: () => 'Verifique sua internet e tente novamente',
        type: 'error',
        context: 'connectivity',
        retryable: true
      }],

      ['TIMEOUT_ERROR', {
        code: 'TIMEOUT_ERROR',
        getMessage: () => 'Operação demorou muito',
        getDescription: () => 'Tente novamente em alguns momentos',
        type: 'warning',
        context: 'connectivity',
        retryable: true
      }],

      // Autenticação
      ['UNAUTHORIZED', {
        code: 'UNAUTHORIZED',
        getMessage: () => 'Sessão expirada',
        getDescription: () => 'Faça login novamente para continuar',
        type: 'warning',
        context: 'authentication'
      }],

      // Genéricos
      ['UNKNOWN_ERROR', {
        code: 'UNKNOWN_ERROR',
        getMessage: () => 'Algo deu errado',
        getDescription: () => 'Tente novamente ou contate o suporte',
        type: 'error',
        context: 'system'
      }]
    ];

    mappings.forEach(([code, mapping]) => {
      this.errorMappings.set(code, mapping);
    });
  }

  /**
   * Mensagens específicas para campos de validação
   */
  private getFieldValidationMessage(field: string): string {
    const messages: Record<string, string> = {
      scheduledTime: 'Informe um horário válido para o lembrete',
      daysOfWeek: 'Selecione pelo menos um dia da semana',
      minutesBefore: 'Informe quantos minutos antes ser lembrado',
      notificationTypes: 'Escolha pelo menos um tipo de notificação',
      title: 'O título é obrigatório',
      description: 'A descrição não pode estar vazia',
      energyPoints: 'Selecione o nível de energia necessário'
    };

    return messages[field] || `Campo ${field} inválido`;
  }

  /**
   * Carrega preferências do localStorage
   */
  private loadPreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('notification-preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.state.preferences = { ...this.state.preferences, ...preferences };
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências de notificação:', error);
    }
  }

  /**
   * Salva preferências no localStorage
   */
  private savePreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('notification-preferences', JSON.stringify(this.state.preferences));
    } catch (error) {
      console.warn('Erro ao salvar preferências de notificação:', error);
    }
  }

  /**
   * Gera ID único para notificação
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se deve mostrar notificação baseado nas preferências
   */
  private shouldShowNotification(context: NotificationContext): boolean {
    if (!this.state.preferences.enabled || this.state.paused) {
      return false;
    }

    if (this.state.preferences.disabledContexts.includes(context)) {
      return false;
    }

    if (this.state.mutedContexts.has(context)) {
      return false;
    }

    return true;
  }

  /**
   * Emite evento para listeners
   */
  private emitEvent(type: NotificationEvent['type'], payload: NotificationEvent['payload']): void {
    const event: NotificationEvent = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Erro em listener de evento de notificação:', error);
      }
    });
  }

  /**
   * Adiciona entrada ao histórico
   */
  private addToHistory(
    id: string, 
    type: NotificationType, 
    title: string, 
    options: NotificationOptions
  ): void {
    if (!options.persistent) return;

    const entry: NotificationHistoryEntry = {
      id,
      type,
      title,
      description: options.description,
      context: options.context || 'system',
      timestamp: new Date().toISOString(),
      read: false,
      persistent: true
    };

    this.state.history.unshift(entry);
    
    // Limita histórico a 100 entradas
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(0, 100);
    }
  }

  /**
   * Método principal para criar notificações
   */
  public show(
    type: NotificationType,
    title: string,
    options: NotificationOptions = {}
  ): string {
    const id = options.id || this.generateId();
    const context = options.context || 'system';

    // Verifica se deve mostrar
    if (!this.shouldShowNotification(context)) {
      return id;
    }

    // Aplica duração padrão se não especificada
    const duration = options.duration !== undefined 
      ? options.duration 
      : this.state.preferences.defaultDuration;

    // Configura opções do Sonner
    const sonnerOptions: any = {
      id,
      description: options.description,
      duration: duration === 0 ? Infinity : duration,
      dismissible: options.dismissible !== false,
      important: options.important || false,
      action: options.action ? {
        label: options.action.label,
        onClick: async () => {
          try {
            await options.action!.onClick();
          } catch (error) {
            console.error('Erro ao executar ação de notificação:', error);
          }
        }
      } : undefined
    };

    // Mostra notificação baseada no tipo
    let toastId: string;
    switch (type) {
      case 'success':
        toastId = toast.success(title, sonnerOptions);
        break;
      case 'error':
        toastId = toast.error(title, sonnerOptions);
        break;
      case 'warning':
        toastId = toast.warning(title, sonnerOptions);
        break;
      case 'info':
        toastId = toast.info(title, sonnerOptions);
        break;
      case 'loading':
        toastId = toast.loading(title, sonnerOptions);
        break;
      case 'celebration':
        // Para celebrações, usa success com estilo especial
        toastId = toast.success(title, {
          ...sonnerOptions,
          className: 'celebration-toast'
        });
        break;
      default:
        toastId = toast(title, sonnerOptions);
    }

    // Armazena no estado ativo
    this.state.active.set(id, {
      id,
      type,
      title,
      options,
      timestamp: new Date().toISOString()
    });

    // Adiciona ao histórico se necessário
    this.addToHistory(id, type, title, options);

    // Emite evento
    this.emitEvent('notification_created', {
      notificationId: id,
      notificationType: type,
      context
    });

    return id;
  }

  /**
   * Métodos de conveniência
   */
  public success(title: string, options?: NotificationOptions): string {
    return this.show('success', title, options);
  }

  public error(title: string, options?: NotificationOptions): string {
    return this.show('error', title, options);
  }

  public warning(title: string, options?: NotificationOptions): string {
    return this.show('warning', title, options);
  }

  public info(title: string, options?: NotificationOptions): string {
    return this.show('info', title, options);
  }

  public loading(title: string, options?: LoadingOptions): string {
    const id = this.show('loading', title, options);
    
    if (options?.onComplete || options?.onError) {
      this.loadingToasts.set(id, id);
    }
    
    return id;
  }

  public celebrate(title: string, options?: CelebrationOptions): string {
    if (!this.state.preferences.celebrationsEnabled) {
      return this.success(title, options);
    }

    return this.show('celebration', title, {
      ...options,
      context: 'celebration',
      important: true,
      duration: options?.duration || 6000
    });
  }

  /**
   * Trata erros automaticamente baseado no código
   */
  public handleError(error: any, context?: NotificationContext): string {
    try {
      // Tenta extrair código de erro
      const errorCode = error?.response?.data?.error?.code || 
                       error?.code || 
                       'UNKNOWN_ERROR';
      
      const mapping = this.errorMappings.get(errorCode as ErrorCode);
      
      if (mapping) {
        return this.show(mapping.type, mapping.getMessage(error), {
          description: mapping.getDescription?.(error),
          context: context || mapping.context,
          action: mapping.retryable ? {
            label: 'Tentar novamente',
            onClick: () => window.location.reload()
          } : undefined
        });
      }

      // Fallback para erro genérico
      return this.error('Algo deu errado', {
        description: error?.message || 'Erro desconhecido',
        context: context || 'system'
      });

    } catch (handlingError) {
      console.error('Erro ao tratar notificação de erro:', handlingError);
      return this.error('Erro interno do sistema');
    }
  }

  /**
   * Controles de notificação
   */
  public dismiss(id: string): void {
    toast.dismiss(id);
    this.state.active.delete(id);
    this.loadingToasts.delete(id);
    
    this.emitEvent('notification_dismissed', {
      notificationId: id
    });
  }

  public dismissAll(): void {
    toast.dismiss();
    this.state.active.clear();
    this.loadingToasts.clear();
  }

  public update(id: string, updates: Partial<NotificationOptions & { title?: string }>): void {
    const existing = this.state.active.get(id);
    if (!existing) return;

    // Para loading que complete com sucesso/erro
    if (existing.type === 'loading') {
      if (updates.title) {
        toast.success(updates.title, {
          id, // Substitui o loading toast
          description: updates.description
        });
        
        this.state.active.set(id, {
          ...existing,
          type: 'success',
          title: updates.title
        });
        
        this.loadingToasts.delete(id);
        return;
      }
    }

    // Atualização geral (limitada pelo Sonner)
    if (updates.title || updates.description) {
      console.warn('Sonner não suporta atualização de título/descrição após criação');
    }
  }

  /**
   * Gerenciamento de preferências
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.state.preferences };
  }

  public updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...updates };
    this.savePreferences();
    
    this.emitEvent('preferences_updated', {
      preferences: updates
    });
  }

  /**
   * Controle de contexto
   */
  public muteContext(context: NotificationContext, duration?: number): void {
    this.state.mutedContexts.add(context);
    
    if (duration && duration > 0) {
      setTimeout(() => {
        this.state.mutedContexts.delete(context);
      }, duration);
    }
  }

  public unmuteContext(context: NotificationContext): void {
    this.state.mutedContexts.delete(context);
  }

  /**
   * Controle geral
   */
  public pause(): void {
    this.state.paused = true;
  }

  public resume(): void {
    this.state.paused = false;
  }

  public isPaused(): boolean {
    return this.state.paused;
  }

  /**
   * Histórico
   */
  public getHistory(): NotificationHistoryEntry[] {
    return [...this.state.history];
  }

  public markAsRead(id: string): void {
    const entry = this.state.history.find(h => h.id === id);
    if (entry) {
      entry.read = true;
    }
  }

  public clearHistory(): void {
    this.state.history = [];
  }

  /**
   * Event listeners
   */
  public addEventListener(listener: (event: NotificationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  public removeEventListener(listener: (event: NotificationEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }
}

// Instância singleton
export const notificationSystem = new NotificationSystem();
export default notificationSystem;