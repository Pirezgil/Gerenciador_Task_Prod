import { prisma } from '../app';
import { addMissedDaysCountToTasks } from '../utils/taskUtils';

export class DailyTaskTracker {
  /**
   * Limpa tarefas completadas em dias anteriores que ainda estão marcadas como plannedForToday
   * Resolve inconsistências no cálculo de energia
   */
  static async cleanupCompletedTasksFromPreviousDays(): Promise<void> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      // Buscar tarefas completadas ANTES de hoje que ainda estão marcadas como plannedForToday
      const tasksToCleanup = await prisma.task.updateMany({
        where: {
          status: 'completed',
          plannedForToday: true,
          completedAt: {
            lt: today // Completadas antes de hoje
          },
          isDeleted: false
        },
        data: {
          plannedForToday: false
        }
      });

      console.log(`🧹 Limpeza de energia: ${tasksToCleanup.count} tarefas antigas removidas do orçamento atual`);
      
    } catch (error) {
      console.error('❌ Erro na limpeza de energia:', error);
      throw error;
    }
  }

  /**
   * Executa diariamente para processar tarefas não realizadas
   * Deve ser chamado via cron job ou similar
   */
  static async processMissedTasks(): Promise<void> {
    try {
      // Primeiro, executar limpeza de energia
      await this.cleanupCompletedTasksFromPreviousDays();
      
      const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      // Buscar tarefas que estavam planejadas para ontem mas não foram completadas
      const missedTasks = await prisma.task.findMany({
        where: {
          plannedForToday: true,
          plannedDate: {
            lt: today, // Data planejada menor que hoje
          },
          status: {
            in: ['pending', 'postponed']
          },
          isDeleted: false
        }
      });

      console.log(`🔍 Encontradas ${missedTasks.length} tarefas não realizadas`);

      for (const task of missedTasks) {
        await this.processTaskMissedDay(task);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar tarefas perdidas:', error);
      throw error;
    }
  }

  /**
   * Processa uma tarefa que não foi realizada no dia planejado
   */
  private static async processTaskMissedDay(task: any): Promise<void> {
    const plannedDate = new Date(task.plannedDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));

    // missedDaysCount agora é calculado dinamicamente - não precisamos mais atualizar

    // Atualizar tarefa
    await prisma.task.update({
      where: { id: task.id },
      data: {
        // Manter plannedForToday = true para aparecer na página bombeiro
        plannedForToday: true,
      }
    });

    // Adicionar comentário no histórico
    const formattedDate = plannedDate.toLocaleDateString('pt-BR');
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        action: 'missed_day',
        timestamp: new Date(),
        details: {
          missedDate: formattedDate,
          message: `Tarefa deixou de ser realizada no dia ${formattedDate}`
        }
      }
    });

    console.log(`📝 Tarefa ${task.description.substring(0, 30)}... será calculada dinamicamente`);
  }

  /**
   * Processa tarefas recorrentes específicas do usuário para hoje
   */
  private static async processRecurringTasksForUser(userId: string, today: Date): Promise<void> {
    try {
      const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
      
      // Buscar tarefas recorrentes do usuário que podem precisar ser ativadas
      const recurringTasks = await prisma.task.findMany({
        where: {
          userId,
          isRecurring: true,
          isDeleted: false
        },
        include: {
          recurrence: true
        }
      });

      for (const task of recurringTasks) {
        if (!task.recurrence) continue;

        // Verificar se deve ser ativada hoje usando as regras do RecurringTaskService
        const shouldActivateToday = this.shouldActivateTaskToday(task.recurrence, currentDayOfWeek, today);
        
        if (shouldActivateToday) {
          await this.activateRecurringTaskForToday(task, today);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar tarefas recorrentes do usuário:', error);
      // Não re-lançar o erro para não quebrar o fluxo principal do getBombeiroTasks
    }
  }

  /**
   * Verifica se uma tarefa recorrente deve ser ativada hoje
   */
  private static shouldActivateTaskToday(recurrence: any, currentDayOfWeek: number, today: Date): boolean {
    const { frequency, daysOfWeek, nextDue } = recurrence;

    // Se há nextDue definido, verificar se é hoje ou anterior
    if (nextDue) {
      const nextDueDate = new Date(nextDue);
      nextDueDate.setHours(0, 0, 0, 0);
      return nextDueDate <= today;
    }

    // Fallback para lógica de frequência se nextDue não estiver definido
    switch (frequency) {
      case 'daily':
        return true; // Tarefas diárias sempre aparecem

      case 'weekly':
      case 'custom':
        return daysOfWeek && daysOfWeek.includes(currentDayOfWeek);

      default:
        return false;
    }
  }

  /**
   * Ativa uma tarefa recorrente para hoje (versão otimizada para Bombeiro)
   */
  private static async activateRecurringTaskForToday(task: any, today: Date): Promise<void> {
    // Verificar se a tarefa já está ativa hoje (evitar duplicação)
    if (task.status === 'pending' && task.plannedForToday && 
        task.plannedDate && new Date(task.plannedDate).toDateString() === today.toDateString()) {
      return; // Já está ativa para hoje
    }

    // Só reativar se estiver completada ou não estiver planejada para hoje
    if (task.status === 'completed' || !task.plannedForToday) {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'pending',
          plannedForToday: true,
          plannedDate: today,
          // Resetar campos de adiamento
          postponementCount: 0,
          postponementReason: null,
          postponedAt: null,
          rescheduleDate: null,
          // Limpar completedAt para nova instância
          completedAt: null
        }
      });

      // Atualizar nextDue na recurrence
      if (task.recurrence) {
        const nextDue = this.calculateNextDue(task.recurrence, today);
        await prisma.taskRecurrence.update({
          where: { taskId: task.id },
          data: {
            lastCompleted: task.status === 'completed' ? task.completedAt : null,
            nextDue: nextDue
          }
        });
      }
    }
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
   * Busca tarefas que devem aparecer na página bombeiro
   * Inclui tarefas planejadas para hoje + tarefas atrasadas + tarefas completadas hoje
   */
  static async getBombeiroTasks(userId: string): Promise<{
    todayTasks: any[];
    missedTasks: any[];
    completedTasks: any[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Primeiro, processar tarefas recorrentes para hoje (se necessário)
    await this.processRecurringTasksForUser(userId, today);

    // Tarefas planejadas para hoje
    const todayTasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          {
            plannedForToday: true,
            status: {
              in: ['pending', 'PENDING']
            }
          },
          {
            status: {
              in: ['postponed', 'POSTPONED']
            },
            postponedAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // até final do dia
            }
          }
        ],
        isDeleted: false
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        history: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { energyPoints: 'desc' },
        { createdAt: 'asc' }
      ]
    });


    // Tarefas atrasadas (plannedDate anterior a hoje)
    // Usar a variável today já definida acima
    
    const missedTasks = await prisma.task.findMany({
      where: {
        userId,
        plannedForToday: true,
        plannedDate: {
          lt: today
        },
        status: {
          in: ['pending', 'PENDING', 'postponed', 'POSTPONED']
        },
        isDeleted: false
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        history: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { plannedDate: 'asc' }, // Mais antigas primeiro (mais atrasadas)
        { energyPoints: 'desc' }
      ]
    });

    // Tarefas completadas hoje
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        isDeleted: false
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        history: {
          orderBy: { timestamp: 'desc' },
          take: 3
        }
      },
      orderBy: [
        { completedAt: 'desc' }, // Mais recentes primeiro
        { energyPoints: 'desc' }
      ]
    });

    return {
      todayTasks: todayTasks.map(this.formatTaskResponse),
      missedTasks: addMissedDaysCountToTasks(missedTasks).map(this.formatTaskResponse),
      completedTasks: completedTasks.map(this.formatTaskResponse)
    };
  }

  /**
   * Formata resposta da tarefa
   */
  private static formatTaskResponse(task: any): any {
    return {
      ...task,
      dueDate: task.dueDate?.toISOString().split('T')[0],
      rescheduleDate: task.rescheduleDate?.toISOString().split('T')[0],
      plannedDate: task.plannedDate?.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      postponedAt: task.postponedAt?.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * Marca uma tarefa como realizada e reseta contadores
   */
  static async markTaskCompleted(taskId: string, userId: string): Promise<void> {
    await prisma.task.update({
      where: { 
        id: taskId,
        userId 
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
        plannedForToday: false,
        history: {
          create: {
            action: 'completed',
            timestamp: new Date(),
            details: {
              message: 'Tarefa concluída com sucesso'
            }
          }
        }
      }
    });
  }
}

export default DailyTaskTracker;