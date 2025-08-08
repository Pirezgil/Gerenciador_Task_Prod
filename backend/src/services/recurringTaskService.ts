import { prisma } from '../app';

export class RecurringTaskService {
  /**
   * Processa todas as tarefas recorrentes - executa diariamente às 00:00
   */
  static async processRecurringTasks(): Promise<void> {
    try {
      console.log('🔄 Iniciando processamento de tarefas recorrentes...');
      
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
      
      // Buscar todas as tarefas recorrentes que podem ser ativadas hoje
      const recurringTasks = await prisma.task.findMany({
        where: {
          isRecurring: true,
          isDeleted: false
        },
        include: {
          recurrence: true
        }
      });

      console.log(`📋 Encontradas ${recurringTasks.length} tarefas recorrentes para verificar`);

      let activatedCount = 0;

      for (const task of recurringTasks) {
        if (!task.recurrence) continue;

        const shouldActivateToday = this.shouldActivateTaskToday(task.recurrence, currentDayOfWeek);
        
        if (shouldActivateToday) {
          await this.activateTaskForToday(task);
          activatedCount++;
        }
      }

      console.log(`✅ Processamento concluído: ${activatedCount} tarefas ativadas para hoje`);
    } catch (error) {
      console.error('❌ Erro ao processar tarefas recorrentes:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma tarefa recorrente deve ser ativada hoje
   */
  private static shouldActivateTaskToday(recurrence: any, currentDayOfWeek: number): boolean {
    const { frequency, daysOfWeek } = recurrence;

    switch (frequency) {
      case 'daily':
        return true; // Tarefas diárias sempre aparecem

      case 'weekly':
        // Para weekly, usar o primeiro dia selecionado como referência
        return daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.includes(currentDayOfWeek);

      case 'custom':
        // Para custom, verificar se hoje está nos dias selecionados
        return daysOfWeek && daysOfWeek.includes(currentDayOfWeek);

      default:
        return false;
    }
  }

  /**
   * Ativa uma tarefa recorrente para hoje
   */
  private static async activateTaskForToday(task: any): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se a tarefa já está ativa hoje (evitar duplicação)
    if (task.status === 'pending' && task.plannedForToday && 
        task.plannedDate && new Date(task.plannedDate).toDateString() === today.toDateString()) {
      console.log(`⏭️  Tarefa "${task.description.substring(0, 30)}..." já ativa para hoje`);
      return;
    }

    // Se a tarefa foi completada, reativar para nova instância
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'pending',
        plannedForToday: true,
        plannedDate: today,
        // Resetar campos de adiamento se necessário
        postponementCount: 0,
        postponementReason: null,
        postponedAt: null,
        rescheduleDate: null
      }
    });

    // Atualizar recurrence com lastCompleted se aplicável
    if (task.status === 'completed') {
      await prisma.taskRecurrence.update({
        where: { taskId: task.id },
        data: {
          lastCompleted: task.completedAt,
          nextDue: this.calculateNextDue(task.recurrence, today)
        }
      });
    }

    // Adicionar entrada no histórico
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        action: 'recurring_activation',
        timestamp: new Date(),
        details: {
          message: 'Tarefa recorrente ativada para hoje',
          activationDate: today.toISOString(),
          frequency: task.recurrence?.frequency,
          daysOfWeek: task.recurrence?.daysOfWeek
        }
      }
    });

    console.log(`🔄 Tarefa recorrente ativada: "${task.description.substring(0, 40)}..."`);
  }

  /**
   * Calcula próxima data de vencimento para tarefas recorrentes
   */
  private static calculateNextDue(recurrence: any, fromDate: Date): Date {
    const { frequency, daysOfWeek } = recurrence;
    const nextDue = new Date(fromDate);

    switch (frequency) {
      case 'daily':
        nextDue.setDate(fromDate.getDate() + 1);
        break;

      case 'weekly':
      case 'custom':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const currentDay = fromDate.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
          
          // Encontrar próximo dia da semana
          let nextDay = sortedDays.find(day => day > currentDay);
          if (!nextDay) {
            // Se não há próximo dia esta semana, pegar primeiro da próxima
            nextDay = sortedDays[0];
            nextDue.setDate(fromDate.getDate() + (7 - currentDay + nextDay));
          } else {
            nextDue.setDate(fromDate.getDate() + (nextDay - currentDay));
          }
        }
        break;
    }

    return nextDue;
  }

  /**
   * Lida com conclusão de tarefa recorrente
   */
  static async handleRecurringTaskCompletion(task: any): Promise<void> {
    if (!task.isRecurring || !task.recurrence) return;

    const completedAt = new Date();
    
    // Atualizar dados de recorrência
    await prisma.taskRecurrence.update({
      where: { taskId: task.id },
      data: {
        lastCompleted: completedAt,
        nextDue: this.calculateNextDue(task.recurrence, completedAt)
      }
    });

    console.log(`🔄 Tarefa recorrente "${task.description.substring(0, 30)}..." completada, próxima: ${this.calculateNextDue(task.recurrence, completedAt).toLocaleDateString('pt-BR')}`);
  }

  /**
   * Lida com adiamento de tarefa recorrente
   */
  static async handleRecurringTaskPostponement(task: any): Promise<void> {
    if (!task.isRecurring) return;

    // Para tarefas recorrentes, o adiamento não afeta o ciclo
    // A tarefa voltará no próximo dia válido automaticamente
    console.log(`⏰ Tarefa recorrente "${task.description.substring(0, 30)}..." adiada, voltará no próximo ciclo`);
  }

  /**
   * Busca tarefas recorrentes do usuário com status
   */
  static async getUserRecurringTasks(userId: string): Promise<any[]> {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isRecurring: true,
        isDeleted: false
      },
      include: {
        recurrence: true,
        project: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: [
        { plannedForToday: 'desc' },
        { energyPoints: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return tasks.map(task => ({
      ...task,
      dueDate: task.dueDate?.toISOString().split('T')[0] || 'Sem vencimento',
      rescheduleDate: task.rescheduleDate?.toISOString().split('T')[0],
      plannedDate: task.plannedDate?.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      postponedAt: task.postponedAt?.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      recurrence: task.recurrence ? {
        id: task.recurrence.id,
        frequency: task.recurrence.frequency,
        daysOfWeek: task.recurrence.daysOfWeek,
        lastCompleted: task.recurrence.lastCompleted?.toISOString(),
        nextDue: task.recurrence.nextDue?.toISOString()
      } : undefined
    }));
  }
}

export default RecurringTaskService;