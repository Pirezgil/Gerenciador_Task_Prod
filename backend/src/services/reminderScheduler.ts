import * as cron from 'node-cron';
import { prisma } from '../app';
import { notificationService } from './notificationService';
import * as reminderService from './reminderService';
import { ReminderSchedulerError } from '../lib/errors';

// ============================================================================
// REMINDER SCHEDULER - Agendador de lembretes
// ============================================================================

export interface SchedulerConfig {
  enabled: boolean;
  checkInterval: string; // Cron expression
  batchSize: number;
  timeoutMs: number;
}

export interface SchedulerStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  lastRun: string | null;
  nextRun: string | null;
  isRunning: boolean;
}

class ReminderScheduler {
  private static instance: ReminderScheduler;
  private config: SchedulerConfig;
  private task: cron.ScheduledTask | null = null;
  private stats: SchedulerStats;
  private isProcessing = false;

  private constructor() {
    this.config = {
      enabled: true,
      checkInterval: '*/1 * * * *', // A cada minuto
      batchSize: 50,
      timeoutMs: 30000 // 30 segundos
    };

    this.stats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      lastRun: null,
      nextRun: null,
      isRunning: false
    };
  }

  static getInstance(): ReminderScheduler {
    if (!ReminderScheduler.instance) {
      ReminderScheduler.instance = new ReminderScheduler();
    }
    return ReminderScheduler.instance;
  }

  start(): void {
    if (this.task) {
      console.log('⏰ Scheduler já está em execução');
      return;
    }

    if (!this.config.enabled) {
      console.log('⏰ Scheduler está desabilitado');
      return;
    }

    console.log(`⏰ Iniciando Reminder Scheduler (intervalo: ${this.config.checkInterval})`);

    this.task = cron.schedule(this.config.checkInterval, async () => {
      if (this.isProcessing) {
        console.log('⏰ Scheduler já está processando, pulando execução');
        return;
      }

      await this.processReminders();
    }, {
      timezone: 'America/Sao_Paulo'
    });

    this.updateNextRunTime();
    console.log('✅ Reminder Scheduler iniciado com sucesso');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.stats.nextRun = null;
      console.log('⛔ Reminder Scheduler parado');
    }
  }

  restart(): void {
    this.stop();
    this.start();
  }

  private async processReminders(): Promise<void> {
    const startTime = Date.now();
    this.isProcessing = true;
    this.stats.isRunning = true;

    try {
      console.log(`🔄 Processando lembretes... (${new Date().toISOString()})`);

      // Buscar lembretes ativos que precisam ser enviados
      const activeReminders = await reminderService.getActiveReminders();
      
      if (activeReminders.length === 0) {
        console.log('✅ Nenhum lembrete para processar');
        return;
      }

      console.log(`📋 ${activeReminders.length} lembrete(s) encontrado(s) para processamento`);

      // Processar em lotes para evitar sobrecarga
      const batches = this.chunkArray(activeReminders, this.config.batchSize);
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const batch of batches) {
        const batchPromises = batch.map(async (reminder) => {
          try {
            // Enviar notificação
            const results = await notificationService.sendReminderNotification(reminder);
            
            // Verificar se pelo menos uma notificação foi enviada com sucesso
            const hasSuccess = results.some(result => result.success);
            
            if (hasSuccess) {
              // Marcar como enviado e calcular próximo agendamento
              await reminderService.markReminderAsSent(reminder.id);
              successCount++;
              
              console.log(`✅ Lembrete ${reminder.id} enviado com sucesso`);
            } else {
              errorCount++;
              console.error(`❌ Falha ao enviar lembrete ${reminder.id}:`, results);
            }
            
            processedCount++;
          } catch (error) {
            errorCount++;
            console.error(`❌ Erro ao processar lembrete ${reminder.id}:`, error);
          }
        });

        // Aguardar processamento do lote com timeout
        await Promise.race([
          Promise.allSettled(batchPromises),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout do lote')), this.config.timeoutMs)
          )
        ]).catch((error) => {
          console.error('⚠️ Timeout ou erro no processamento do lote:', error);
        });
      }

      // Atualizar estatísticas
      this.stats.totalProcessed += processedCount;
      this.stats.successCount += successCount;
      this.stats.errorCount += errorCount;

      const duration = Date.now() - startTime;
      console.log(`✅ Processamento concluído: ${processedCount} processados (${successCount} sucessos, ${errorCount} erros) em ${duration}ms`);

    } catch (error) {
      console.error('❌ Erro geral no processamento de lembretes:', error);
      this.stats.errorCount++;
    } finally {
      this.isProcessing = false;
      this.stats.isRunning = false;
      this.stats.lastRun = new Date().toISOString();
      this.updateNextRunTime();
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private updateNextRunTime(): void {
    if (this.task) {
      // Calcular próxima execução baseada no cron expression
      try {
        // Calcular próxima execução (aproximada)
        const now = new Date();
        const nextDate = new Date(now.getTime() + 60000); // Próxima execução em 1 minuto (aproximado)
        this.stats.nextRun = nextDate.toISOString();
      } catch (error) {
        console.error('Erro ao calcular próxima execução:', error);
        this.stats.nextRun = null;
      }
    }
  }

  // Métodos públicos para controle e monitoramento
  
  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Se o intervalo mudou, reiniciar o scheduler
    if (oldConfig.checkInterval !== this.config.checkInterval) {
      console.log(`🔄 Intervalo alterado de ${oldConfig.checkInterval} para ${this.config.checkInterval}`);
      if (this.task) {
        this.restart();
      }
    }

    // Se foi habilitado/desabilitado
    if (oldConfig.enabled !== this.config.enabled) {
      if (this.config.enabled && !this.task) {
        this.start();
      } else if (!this.config.enabled && this.task) {
        this.stop();
      }
    }

    console.log('⚙️ Configuração do scheduler atualizada:', this.config);
  }

  isRunning(): boolean {
    return this.task !== null;
  }

  resetStats(): void {
    this.stats = {
      ...this.stats,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0
    };
    console.log('📊 Estatísticas do scheduler resetadas');
  }

  // Método para execução manual (útil para testes)
  async runOnce(): Promise<void> {
    if (this.isProcessing) {
      throw new ReminderSchedulerError('Scheduler já está processando', 'processReminders');
    }

    console.log('🔧 Execução manual do scheduler iniciada');
    await this.processReminders();
  }

  // Método para validar próximos lembretes (útil para debug)
  async getUpcomingReminders(limit: number = 10): Promise<any[]> {
    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          nextScheduledAt: {
            not: null
          }
        },
        orderBy: {
          nextScheduledAt: 'asc'
        },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              settings: {
                select: {
                  notifications: true
                }
              }
            }
          }
        }
      });

      return reminders.map(reminder => ({
        id: reminder.id,
        type: reminder.type,
        entityType: reminder.entityType,
        nextScheduledAt: reminder.nextScheduledAt,
        user: reminder.user.name,
        notificationsEnabled: reminder.user.settings?.notifications ?? true
      }));
    } catch (error) {
      console.error('Erro ao buscar próximos lembretes:', error);
      return [];
    }
  }
}

// ============================================================================
// HEALTH CHECK E MONITORING
// ============================================================================

export const schedulerHealthCheck = {
  async getStatus() {
    const scheduler = ReminderScheduler.getInstance();
    const stats = scheduler.getStats();
    const config = scheduler.getConfig();
    
    return {
      status: scheduler.isRunning() ? 'running' : 'stopped',
      config,
      stats,
      upcomingReminders: await scheduler.getUpcomingReminders(5)
    };
  },

  async getMetrics() {
    const scheduler = ReminderScheduler.getInstance();
    const stats = scheduler.getStats();
    
    const successRate = stats.totalProcessed > 0 
      ? Math.round((stats.successCount / stats.totalProcessed) * 100) 
      : 0;

    return {
      totalProcessed: stats.totalProcessed,
      successCount: stats.successCount,
      errorCount: stats.errorCount,
      successRate: `${successRate}%`,
      lastRun: stats.lastRun,
      nextRun: stats.nextRun,
      isRunning: stats.isRunning
    };
  }
};

// Exportar instância singleton
export const reminderScheduler = ReminderScheduler.getInstance();
export default ReminderScheduler;