import * as cron from 'node-cron';
import { RecurringTaskService } from './recurringTaskService';
import { DailyTaskTracker } from './dailyTaskTracker';

export class DailyTaskScheduler {
  private static jobs: cron.ScheduledTask[] = [];
  
  /**
   * Inicia todos os jobs de agendamento diário
   */
  static start(): void {
    console.log('🕐 Iniciando agendador de tarefas diárias...');
    
    // Job principal: processamento diário às 00:00
    const dailyJob = cron.schedule('0 0 * * *', async () => {
      console.log('🌅 Executando processamento diário às 00:00');
      
      try {
        // 1. Processar tarefas recorrentes (ativar para hoje)
        await RecurringTaskService.processRecurringTasks();
        
        // 2. Processar tarefas perdidas (marcar como perdidas)
        await DailyTaskTracker.processMissedTasks();
        
        console.log('✅ Processamento diário concluído com sucesso');
      } catch (error) {
        console.error('❌ Erro no processamento diário:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });
    
    this.jobs.push(dailyJob);
    
    // Job complementar: verificação a cada 6 horas (para redundância)
    const redundancyJob = cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Verificação de redundância (a cada 6h)');
      
      try {
        // Processar apenas tarefas recorrentes que podem ter falhado
        await RecurringTaskService.processRecurringTasks();
      } catch (error) {
        console.error('❌ Erro na verificação de redundância:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });
    
    this.jobs.push(redundancyJob);
    
    console.log('✅ Agendador iniciado com sucesso:');
    console.log('  - Job diário: 00:00 (processamento completo)');
    console.log('  - Job redundância: a cada 6h (verificação de segurança)');
    console.log(`  - Timezone: America/Sao_Paulo`);
  }
  
  /**
   * Para todos os jobs agendados
   */
  static stop(): void {
    console.log('🛑 Parando agendador de tarefas...');
    
    this.jobs.forEach((job, index) => {
      job.stop();
      job.destroy();
      console.log(`  - Job ${index + 1} parado`);
    });
    
    this.jobs = [];
    console.log('✅ Agendador parado com sucesso');
  }
  
  /**
   * Força execução manual do processamento diário (para testes)
   */
  static async runManually(): Promise<void> {
    console.log('🔧 Executando processamento diário manualmente...');
    
    try {
      await RecurringTaskService.processRecurringTasks();
      await DailyTaskTracker.processMissedTasks();
      console.log('✅ Processamento manual concluído');
    } catch (error) {
      console.error('❌ Erro no processamento manual:', error);
      throw error;
    }
  }
  
  /**
   * Retorna status dos jobs
   */
  static getStatus(): { isRunning: boolean; jobCount: number; nextRun?: string } {
    const isRunning = this.jobs.length > 0;
    
    return {
      isRunning,
      jobCount: this.jobs.length,
      nextRun: isRunning ? 'Próximo às 00:00 (America/Sao_Paulo)' : undefined
    };
  }
}

export default DailyTaskScheduler;