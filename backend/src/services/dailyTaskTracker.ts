import { prisma } from '../app';

export class DailyTaskTracker {
  /**
   * Executa diariamente para processar tarefas não realizadas
   * Deve ser chamado via cron job ou similar
   */
  static async processMissedTasks(): Promise<void> {
    try {
      const today = new Date();
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
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Incrementar contador de dias perdidos
    const newMissedDaysCount = (task.missedDaysCount || 0) + daysDiff;

    // Atualizar tarefa
    await prisma.task.update({
      where: { id: task.id },
      data: {
        missedDaysCount: newMissedDaysCount,
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
          consecutiveDays: newMissedDaysCount,
          message: `Tarefa deixou de ser realizada no dia ${formattedDate}`
        }
      }
    });

    console.log(`📝 Tarefa ${task.description.substring(0, 30)}... marcada como perdida (${newMissedDaysCount} dias)`);
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
    const today = new Date();
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
            missedDaysCount: 0,
            status: {
              in: ['pending', 'PENDING', 'postponed', 'POSTPONED']
            }
          },
          {
            status: {
              in: ['postponed', 'POSTPONED']
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


    // Tarefas atrasadas (com missedDaysCount > 0)
    const missedTasks = await prisma.task.findMany({
      where: {
        userId,
        plannedForToday: true,
        missedDaysCount: {
          gt: 0
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
        { missedDaysCount: 'desc' }, // Mais atrasadas primeiro
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
      missedTasks: missedTasks.map(this.formatTaskResponse),
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
        missedDaysCount: 0, // Reset do contador
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