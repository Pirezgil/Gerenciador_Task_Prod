import { prisma } from '../app';

export class ReminderCleanupService {
  /**
   * Remove lembretes antigos para manter a performance da tabela
   */
  static async cleanupOldReminders(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const result = await prisma.reminder.deleteMany({
        where: {
          OR: [
            // Lembretes únicos já enviados há mais de 30 dias
            {
              type: 'scheduled',
              lastSentAt: { lt: thirtyDaysAgo },
              nextScheduledAt: null
            },
            // Lembretes inativos há mais de 30 dias
            {
              isActive: false,
              updatedAt: { lt: thirtyDaysAgo }
            },
            // Lembretes before_due que já passaram da data há mais de 30 dias
            {
              type: 'before_due',
              lastSentAt: { lt: thirtyDaysAgo },
              nextScheduledAt: null
            }
          ]
        }
      });
      
      console.log(`✅ Limpeza: ${result.count} lembretes antigos removidos`);
      return result.count;
    } catch (error) {
      console.error('❌ Erro na limpeza de lembretes antigos:', error);
      return 0;
    }
  }
  
  /**
   * Remove lembretes órfãos (associados a tarefas/hábitos que não existem mais)
   */
  static async cleanupOrphanedReminders(): Promise<number> {
    try {
      let totalCleaned = 0;
      
      // Buscar IDs de tarefas existentes
      const existingTaskIds = await prisma.task.findMany({
        select: { id: true }
      }).then(tasks => tasks.map(t => t.id));
      
      // Buscar IDs de hábitos existentes
      const existingHabitIds = await prisma.habit.findMany({
        select: { id: true }
      }).then(habits => habits.map(h => h.id));
      
      // Remover lembretes de tarefas órfãs
      if (existingTaskIds.length > 0) {
        const orphanedTaskReminders = await prisma.reminder.deleteMany({
          where: {
            entityType: 'task',
            entityId: {
              notIn: existingTaskIds
            }
          }
        });
        totalCleaned += orphanedTaskReminders.count;
      }
      
      // Remover lembretes de hábitos órfãos
      if (existingHabitIds.length > 0) {
        const orphanedHabitReminders = await prisma.reminder.deleteMany({
          where: {
            entityType: 'habit',
            entityId: {
              notIn: existingHabitIds
            }
          }
        });
        totalCleaned += orphanedHabitReminders.count;
      }
      
      console.log(`✅ Limpeza: ${totalCleaned} lembretes órfãos removidos`);
      return totalCleaned;
    } catch (error) {
      console.error('❌ Erro na limpeza de lembretes órfãos:', error);
      return 0;
    }
  }
  
  /**
   * Otimiza lembretes de intervalo antigos convertendo-os em registros únicos
   * quando não são mais necessários múltiplos registros
   */
  static async optimizeIntervalReminders(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    try {
      // Buscar lembretes de intervalo antigos que já passaram
      const oldIntervalReminders = await prisma.reminder.findMany({
        where: {
          intervalEnabled: true,
          nextScheduledAt: { lt: sevenDaysAgo },
          isActive: false
        }
      });
      
      let optimized = 0;
      
      for (const reminder of oldIntervalReminders) {
        // Converter lembrete de intervalo em lembrete simples (remover metadados de intervalo)
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            intervalEnabled: false,
            intervalMinutes: null,
            intervalStartTime: null,
            intervalEndTime: null
          }
        });
        optimized++;
      }
      
      console.log(`✅ Otimização: ${optimized} lembretes de intervalo otimizados`);
      return optimized;
    } catch (error) {
      console.error('❌ Erro na otimização de lembretes de intervalo:', error);
      return 0;
    }
  }
  
  /**
   * Analisa o uso de lembretes e gera estatísticas
   */
  static async generateUsageStats(): Promise<{
    totalReminders: number;
    activeReminders: number;
    intervalReminders: number;
    appointmentReminders: number;
    averageRemindersPerUser: number;
    heaviestUsers: { userId: string; count: number }[];
  }> {
    try {
      const totalReminders = await prisma.reminder.count();
      
      const activeReminders = await prisma.reminder.count({
        where: { isActive: true }
      });
      
      const intervalReminders = await prisma.reminder.count({
        where: { intervalEnabled: true, isActive: true }
      });
      
      const appointmentReminders = await prisma.reminder.count({
        where: { 
          subType: { in: ['prepare', 'urgent'] },
          isActive: true 
        }
      });
      
      // Usuários com mais lembretes
      const heaviestUsers = await prisma.reminder.groupBy({
        by: ['userId'],
        where: { isActive: true },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }).then(results => results.map(r => ({
        userId: r.userId,
        count: r._count.userId
      })));
      
      const userCount = await prisma.user.count();
      const averageRemindersPerUser = userCount > 0 ? activeReminders / userCount : 0;
      
      const stats = {
        totalReminders,
        activeReminders,
        intervalReminders,
        appointmentReminders,
        averageRemindersPerUser: Math.round(averageRemindersPerUser * 100) / 100,
        heaviestUsers
      };
      
      console.log('📊 Estatísticas de lembretes:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao gerar estatísticas:', error);
      return {
        totalReminders: 0,
        activeReminders: 0,
        intervalReminders: 0,
        appointmentReminders: 0,
        averageRemindersPerUser: 0,
        heaviestUsers: []
      };
    }
  }
  
  /**
   * Executa limpeza completa (todos os tipos)
   */
  static async fullCleanup(): Promise<{
    oldReminders: number;
    orphanedReminders: number;
    optimizedIntervals: number;
    stats: any;
  }> {
    console.log('🧹 Iniciando limpeza completa de lembretes...');
    
    const startTime = Date.now();
    
    const oldReminders = await this.cleanupOldReminders();
    const orphanedReminders = await this.cleanupOrphanedReminders();
    const optimizedIntervals = await this.optimizeIntervalReminders();
    const stats = await this.generateUsageStats();
    
    const duration = Date.now() - startTime;
    const totalCleaned = oldReminders + orphanedReminders + optimizedIntervals;
    
    console.log(`✅ Limpeza completa finalizada em ${duration}ms`);
    console.log(`📊 Total de registros processados: ${totalCleaned}`);
    
    return {
      oldReminders,
      orphanedReminders,
      optimizedIntervals,
      stats
    };
  }
  
  /**
   * Verifica se há usuários com muitos lembretes (potencial problema de performance)
   */
  static async checkForPerformanceIssues(): Promise<{
    heavyUsers: string[];
    totalIssues: number;
    recommendations: string[];
  }> {
    try {
      const heavyUsers = await prisma.reminder.groupBy({
        by: ['userId'],
        where: { isActive: true },
        _count: { userId: true },
        having: { userId: { _count: { gt: 50 } } }
      }).then(results => results.map(r => r.userId));
      
      const recommendations = [];
      
      if (heavyUsers.length > 0) {
        recommendations.push(`${heavyUsers.length} usuários com mais de 50 lembretes ativos`);
        recommendations.push('Considere implementar limites mais rígidos ou alertas para usuários');
      }
      
      // Verificar lembretes de intervalo com intervalos muito curtos
      const shortIntervals = await prisma.reminder.count({
        where: {
          intervalEnabled: true,
          intervalMinutes: { lt: 30 },
          isActive: true
        }
      });
      
      if (shortIntervals > 10) {
        recommendations.push(`${shortIntervals} lembretes com intervalos < 30 min podem impactar performance`);
      }
      
      return {
        heavyUsers,
        totalIssues: heavyUsers.length + (shortIntervals > 10 ? 1 : 0),
        recommendations
      };
    } catch (error) {
      console.error('❌ Erro ao verificar problemas de performance:', error);
      return { heavyUsers: [], totalIssues: 0, recommendations: [] };
    }
  }
}