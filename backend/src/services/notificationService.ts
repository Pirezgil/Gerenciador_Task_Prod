import { prisma } from '../app';
import type { ReminderResponse } from '../types/reminder';
import * as webpush from 'web-push';
import { VAPID_CONFIG } from '../config/vapid';
import * as pushSubscriptionService from './pushSubscriptionService';

// ============================================================================
// NOTIFICATION SERVICE - Serviço de envio de notificações
// ============================================================================

export interface NotificationConfig {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export interface NotificationPayload {
  type: 'push' | 'email' | 'sms';
  userId: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Configuração padrão
const defaultConfig: NotificationConfig = {
  pushEnabled: true,
  emailEnabled: false, // Desabilitado até configurar SMTP
  smsEnabled: false,   // Desabilitado até configurar Twilio
  retryAttempts: 3,
  retryDelay: 5000
};

// ============================================================================
// PUSH NOTIFICATIONS SERVICE
// ============================================================================

class PushNotificationService {
  private static instance: PushNotificationService;
  private isConfigured = false;
  
  constructor() {
    this.configure();
  }
  
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private configure(): void {
    try {
      // Configurar web-push com chaves VAPID
      webpush.setVapidDetails(
        VAPID_CONFIG.subject,
        VAPID_CONFIG.publicKey,
        VAPID_CONFIG.privateKey
      );
      
      this.isConfigured = true;
      console.log('✅ Web-push configurado com chaves VAPID');
    } catch (error) {
      console.error('❌ Erro ao configurar web-push:', error);
      this.isConfigured = false;
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Web-push não está configurado');
      }

      console.log(`🔔 Enviando push notification para usuário ${payload.userId}...`);

      // Buscar todas as assinaturas ativas do usuário
      const subscriptions = await pushSubscriptionService.getActivePushSubscriptions(payload.userId);
      
      if (subscriptions.length === 0) {
        console.log(`⚠️ Nenhuma assinatura push ativa para usuário ${payload.userId}`);
        console.log(`📝 Lembrete: ${payload.title} - ${payload.message}`);
        
        // Registrar lembrete no sistema para mostrar quando usuário abrir o app
        await this.registerInAppReminder(payload);
        
        // Retornar sucesso para não bloquear o fluxo dos lembretes
        return {
          success: true,
          messageId: `in_app_reminder_${Date.now()}`,
          error: undefined // Remove a mensagem de erro para não confundir os logs
        };
      }

      // Preparar payload da notificação
      const notificationPayload = JSON.stringify({
        title: payload.title,
        message: payload.message,
        body: payload.message,
        data: payload.data || {},
        priority: payload.priority || 'normal',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `notification-${Date.now()}`,
        timestamp: Date.now(),
        requireInteraction: payload.priority === 'high',
        actions: [
          {
            action: 'open',
            title: 'Abrir'
          },
          {
            action: 'close',
            title: 'Fechar'
          }
        ]
      });

      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          // Construir objeto subscription para web-push
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          };

          // Enviar notificação
          await webpush.sendNotification(
            pushSubscription,
            notificationPayload,
            {
              TTL: 24 * 60 * 60, // 24 horas
              urgency: payload.priority === 'high' ? 'high' : 'normal'
            }
          );

          // Marcar como enviada
          await pushSubscriptionService.markSubscriptionAsNotified(subscription.id);

          console.log(`✅ Notificação enviada para subscription ${subscription.id}`);
          return { success: true, subscriptionId: subscription.id };

        } catch (error: any) {
          console.error(`❌ Erro ao enviar para subscription ${subscription.id}:`, error);
          console.error(`   - Status Code: ${error.statusCode}`);
          console.error(`   - Message: ${error.message}`);
          console.error(`   - Body: ${JSON.stringify(error.body)}`);
          console.error(`   - Headers: ${JSON.stringify(error.headers)}`);
          console.error(`   - Endpoint: ${subscription.endpoint}`);

          // Tratar automaticamente inscrições inválidas ou corrompidas
          const shouldDeactivate = this.shouldDeactivateSubscription(error);
          if (shouldDeactivate) {
            console.log(`🚫 Desativando subscription inválida: ${subscription.id} (Motivo: ${shouldDeactivate})`);
            try {
              await pushSubscriptionService.deactivateInvalidSubscription(subscription.endpoint);
              console.log(`✅ Subscription ${subscription.id} removida automaticamente`);
            } catch (deactivationError) {
              console.error(`❌ Erro ao remover subscription ${subscription.id}:`, deactivationError);
            }
          }

          return { 
            success: false, 
            subscriptionId: subscription.id, 
            error: `${error.statusCode || 'NO_STATUS'}: ${error.message}` 
          };
        }
      });

      const results = await Promise.allSettled(sendPromises);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const total = results.length;

      if (successful > 0) {
        console.log(`✅ Push notifications enviadas: ${successful}/${total} sucessos`);
        return {
          success: true,
          messageId: `push_${Date.now()}_${successful}of${total}`
        };
      } else {
        return {
          success: false,
          error: `Falha ao enviar para todas as ${total} assinaturas`
        };
      }

    } catch (error) {
      console.error('❌ Erro geral ao enviar push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Determina se uma subscription deve ser desativada baseada no erro recebido
   */
  private shouldDeactivateSubscription(error: any): string | null {
    // Endpoint inválido ou expirado (HTTP 410 Gone)
    if (error.statusCode === 410) {
      return 'Endpoint expirado (410 Gone)';
    }

    // Endpoint não encontrado (HTTP 404)
    if (error.statusCode === 404) {
      return 'Endpoint não encontrado (404 Not Found)';
    }

    // Chave pública inválida para a curva especificada (erro criptográfico)
    if (error.code === 'ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY' || 
        error.message?.includes('Public key is not valid for specified curve')) {
      return 'Chave pública corrompida (ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY)';
    }

    // Erro de formato de chave inválido
    if (error.message?.includes('Invalid key format') || 
        error.message?.includes('Invalid p256dh key') ||
        error.message?.includes('Invalid auth key')) {
      return 'Formato de chave inválido';
    }

    // Erro de endpoint inválido
    if (error.message?.includes('Invalid endpoint') || 
        error.message?.includes('Malformed endpoint')) {
      return 'Formato de endpoint inválido';
    }

    // Subscription não autorizada
    if (error.statusCode === 403) {
      return 'Subscription não autorizada (403 Forbidden)';
    }

    // Bad Request com indicação de subscription inválida
    if (error.statusCode === 400 && 
        (error.message?.includes('Invalid subscription') || 
         error.body?.includes('InvalidRegistration'))) {
      return 'Subscription inválida (400 Bad Request)';
    }

    // Não deve desativar para outros tipos de erro
    return null;
  }

  /**
   * Registra um lembrete como log estruturado para ser mostrado quando necessário
   */
  private async registerInAppReminder(payload: NotificationPayload): Promise<void> {
    try {
      // Por enquanto, apenas registrar no log de forma estruturada
      // Em uma versão futura, isso pode ser salvo em uma tabela dedicada
      console.log(`📝 LEMBRETE IN-APP [${new Date().toLocaleString('pt-BR')}]`);
      console.log(`👤 Usuário: ${payload.userId}`);
      console.log(`🔔 Título: ${payload.title}`);
      console.log(`💬 Mensagem: ${payload.message}`);
      console.log(`📊 Prioridade: ${payload.priority || 'normal'}`);
      
      if (payload.data && Object.keys(payload.data).length > 0) {
        console.log(`📋 Dados:`, JSON.stringify(payload.data, null, 2));
      }
      
      console.log(`ℹ️ Dica: Configure push notifications para receber lembretes em tempo real`);
      console.log('─'.repeat(60));
      
    } catch (error) {
      console.log(`📝 Lembrete: ${payload.title} - ${payload.message}`);
    }
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    const results = await Promise.allSettled(
      payloads.map(payload => this.send(payload))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: result.reason }
    );
  }
}

// ============================================================================
// EMAIL NOTIFICATIONS SERVICE
// ============================================================================

class EmailNotificationService {
  private static instance: EmailNotificationService;
  
  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Por enquanto, simular envio (em produção integraria com SendGrid/Nodemailer)
      console.log(`📧 Email enviado para usuário ${payload.userId}:`, {
        subject: payload.title,
        body: payload.message
      });

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        success: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// ============================================================================
// SMS NOTIFICATIONS SERVICE
// ============================================================================

class SmsNotificationService {
  private static instance: SmsNotificationService;
  
  static getInstance(): SmsNotificationService {
    if (!SmsNotificationService.instance) {
      SmsNotificationService.instance = new SmsNotificationService();
    }
    return SmsNotificationService.instance;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Por enquanto, simular envio (em produção integraria com Twilio)
      console.log(`📱 SMS enviado para usuário ${payload.userId}:`, {
        message: `${payload.title}: ${payload.message}`
      });

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// ============================================================================
// MAIN NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig;
  private pushService: PushNotificationService;
  private emailService: EmailNotificationService;
  private smsService: SmsNotificationService;

  private constructor(config: NotificationConfig = defaultConfig) {
    this.config = config;
    this.pushService = PushNotificationService.getInstance();
    this.emailService = EmailNotificationService.getInstance();
    this.smsService = SmsNotificationService.getInstance();
  }

  static getInstance(config?: NotificationConfig): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  async sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    const { type } = payload;

    // Verificar se o tipo está habilitado
    if (type === 'push' && !this.config.pushEnabled) {
      return { success: false, error: 'Push notifications desabilitadas' };
    }
    if (type === 'email' && !this.config.emailEnabled) {
      return { success: false, error: 'Email notifications desabilitadas' };
    }
    if (type === 'sms' && !this.config.smsEnabled) {
      return { success: false, error: 'SMS notifications desabilitadas' };
    }

    // Enviar notificação com retry
    return this.sendWithRetry(payload);
  }

  async sendReminderNotification(reminder: ReminderResponse): Promise<NotificationResult[]> {
    try {
      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: reminder.userId },
        include: {
          settings: true
        }
      });

      if (!user || user.settings?.notifications === false) {
        return [{ success: false, error: 'Usuário não encontrado ou notificações desabilitadas' }];
      }

      // Preparar dados da entidade (tarefa ou hábito)
      let entityData: any = null;
      if (reminder.entityId && reminder.entityType === 'task') {
        entityData = await prisma.task.findUnique({
          where: { id: reminder.entityId },
          include: { 
            project: true,
            recurrence: true,
            appointment: true
          }
        });
      } else if (reminder.entityId && reminder.entityType === 'habit') {
        entityData = await prisma.habit.findUnique({
          where: { id: reminder.entityId }
        });
      }

      // Gerar título e mensagem
      const { title, message } = this.generateNotificationContent(reminder, entityData);

      // Se não há tipos de notificação configurados, usar push como padrão
      const notificationTypes = reminder.notificationTypes.length > 0 
        ? reminder.notificationTypes 
        : ['push'];

      // Enviar para todos os tipos configurados no lembrete
      const notifications: NotificationPayload[] = notificationTypes.map(type => ({
        type: type as 'push' | 'email' | 'sms',
        userId: reminder.userId,
        title,
        message,
        data: {
          reminderId: reminder.id,
          entityId: reminder.entityId,
          entityType: reminder.entityType,
          type: reminder.type
        },
        priority: reminder.type === 'before_due' ? 'high' : 'normal'
      }));

      const results = await Promise.all(
        notifications.map(notification => this.sendNotification(notification))
      );

      return results;
    } catch (error) {
      console.error('Erro ao enviar notificação de lembrete:', error);
      return [{ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }];
    }
  }

  private async sendWithRetry(payload: NotificationPayload, attempt: number = 1): Promise<NotificationResult> {
    try {
      let result: NotificationResult;

      switch (payload.type) {
        case 'push':
          result = await this.pushService.send(payload);
          break;
        case 'email':
          result = await this.emailService.send(payload);
          break;
        case 'sms':
          result = await this.smsService.send(payload);
          break;
        default:
          return { success: false, error: 'Tipo de notificação inválido' };
      }

      if (!result.success && attempt < this.config.retryAttempts) {
        console.log(`Tentativa ${attempt} falhou, tentando novamente em ${this.config.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.sendWithRetry(payload, attempt + 1);
      }

      return result;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.sendWithRetry(payload, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private generateNotificationContent(reminder: ReminderResponse, entityData: any): { title: string; message: string } {
    // Usar mensagem personalizada se disponível
    if (reminder.message) {
      return {
        title: this.getDefaultTitle(reminder, entityData),
        message: reminder.message
      };
    }

    // Gerar conteúdo baseado no tipo de entidade
    if (reminder.entityType === 'task' && entityData) {
      return this.generateTaskNotificationContent(reminder, entityData);
    }

    if (reminder.entityType === 'habit' && entityData) {
      return {
        title: '💪 Hora do Seu Hábito!',
        message: `É hora de praticar: ${entityData.name}`
      };
    }

    // Fallback
    return {
      title: '🔔 Lembrete',
      message: 'Você tem uma atividade programada!'
    };
  }

  private generateTaskNotificationContent(reminder: ReminderResponse, entityData: any): { title: string; message: string } {
    const isRecurring = entityData.isRecurring;
    const isAppointment = entityData.isAppointment;
    const taskType = entityData.type || 'task';
    const isBrick = taskType === 'brick';
    const projectName = entityData.project?.name;

    // Mensagens para tarefas de compromisso
    if (isAppointment) {
      if (reminder.type === 'before_due') {
        return {
          title: '📅 Compromisso se aproximando!',
          message: `Prepare-se para: ${entityData.description}${projectName ? ` (${projectName})` : ''}${entityData.appointment?.location ? ` - Local: ${entityData.appointment.location}` : ''}`
        };
      }
      return {
        title: '⏰ Hora do Compromisso!',
        message: `Chegou a hora: ${entityData.description}${entityData.appointment?.location ? ` - Local: ${entityData.appointment.location}` : ''}`
      };
    }

    // Mensagens para tarefas recorrentes
    if (isRecurring) {
      const frequency = entityData.recurrence?.frequency || 'regular';
      const frequencyText = frequency === 'daily' ? 'diária' : frequency === 'weekly' ? 'semanal' : 'periódica';
      
      return {
        title: '🔄 Tarefa Recorrente!',
        message: `Sua atividade ${frequencyText}: ${entityData.description}${projectName ? ` (${projectName})` : ''}`
      };
    }

    // Mensagens para tarefas de tijolo
    if (isBrick) {
      return {
        title: '🧱 Tijolo do Dia!',
        message: `Hora de construir: ${entityData.description}${projectName ? ` (${projectName})` : ''}`
      };
    }

    // Mensagens para tarefas normais
    return {
      title: '🔔 Lembrete de Tarefa',
      message: `Não esqueça: ${entityData.description}${projectName ? ` (${projectName})` : ''}`
    };
  }

  private getDefaultTitle(reminder: ReminderResponse, entityData: any): string {
    if (reminder.entityType === 'habit') {
      return '💪 Hora do Seu Hábito!';
    }
    
    if (reminder.entityType === 'task' && entityData) {
      const isAppointment = entityData.isAppointment;
      const isRecurring = entityData.isRecurring;
      const taskType = entityData.type || 'task';
      const isBrick = taskType === 'brick';

      if (isAppointment) {
        return reminder.type === 'before_due' ? '📅 Compromisso se aproximando!' : '⏰ Hora do Compromisso!';
      }
      if (isRecurring) {
        return '🔄 Tarefa Recorrente!';
      }
      if (isBrick) {
        return '🧱 Tijolo do Dia!';
      }
      if (reminder.type === 'before_due') {
        return '⏰ Prazo se aproximando';
      }
      return '🔔 Lembrete de Tarefa';
    }
    
    return '🔔 Lembrete';
  }

  // Métodos utilitários para configuração
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Método para testar notificações
  async testNotification(userId: string, type: 'push' | 'email' | 'sms'): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type,
      userId,
      title: '🧪 Teste de Notificação',
      message: 'Esta é uma notificação de teste do sistema de lembretes.',
      data: { test: true },
      priority: 'low'
    };

    return this.sendNotification(payload);
  }
}

// Exportar instância singleton
export const notificationService = NotificationService.getInstance();