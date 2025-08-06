import { prisma } from '../app';

/**
 * Remove permanentemente tarefas excluídas há mais de 360 dias
 * Esta função deve ser chamada periodicamente (ex: diariamente via cron job)
 */
export const cleanupDeletedTasks = async (): Promise<void> => {
  try {
    // Calcular data limite (360 dias atrás)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 360);

    console.log(`🧹 Iniciando limpeza de tarefas excluídas antes de ${cutoffDate.toISOString()}`);

    // Buscar tarefas que devem ser removidas permanentemente
    const tasksToDelete = await prisma.task.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: cutoffDate
        }
      },
      select: {
        id: true,
        description: true,
        deletedAt: true,
        userId: true
      }
    });

    if (tasksToDelete.length === 0) {
      console.log('✅ Nenhuma tarefa antiga encontrada para limpeza');
      return;
    }

    console.log(`🗑️  Encontradas ${tasksToDelete.length} tarefas para remoção permanente`);

    // Remover permanentemente do banco (hard delete)
    const deletedCount = await prisma.task.deleteMany({
      where: {
        id: {
          in: tasksToDelete.map(task => task.id)
        }
      }
    });

    console.log(`✅ Limpeza concluída: ${deletedCount.count} tarefas removidas permanentemente`);

    // Log das tarefas removidas (para auditoria)
    tasksToDelete.forEach(task => {
      console.log(`   - Tarefa "${task.description}" (ID: ${task.id}) do usuário ${task.userId} excluída em ${task.deletedAt}`);
    });

  } catch (error) {
    console.error('❌ Erro durante limpeza de tarefas:', error);
    throw error;
  }
};

/**
 * Função para obter estatísticas de tarefas excluídas
 * Útil para monitoramento e relatórios administrativos
 */
export const getDeletedTasksStats = async () => {
  try {
    const stats = await prisma.task.groupBy({
      by: ['userId'],
      where: {
        isDeleted: true
      },
      _count: {
        id: true
      },
      _min: {
        deletedAt: true
      },
      _max: {
        deletedAt: true
      }
    });

    const totalDeleted = await prisma.task.count({
      where: {
        isDeleted: true
      }
    });

    // Calcular quantas estão elegíveis para limpeza
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 360);

    const eligibleForCleanup = await prisma.task.count({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: cutoffDate
        }
      }
    });

    return {
      totalDeletedTasks: totalDeleted,
      eligibleForCleanup,
      userStats: stats.map(stat => ({
        userId: stat.userId,
        deletedTasksCount: stat._count.id,
        oldestDeletion: stat._min.deletedAt,
        newestDeletion: stat._max.deletedAt
      }))
    };

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de tarefas excluídas:', error);
    throw error;
  }
};