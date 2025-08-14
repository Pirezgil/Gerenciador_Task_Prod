/**
 * Utilitários para cálculos relacionados a tarefas
 */

/**
 * Calcula o número de dias não executadas baseado na data planejada
 * @param plannedDate - Data quando a tarefa foi planejada
 * @param currentDate - Data atual (opcional, padrão = hoje)
 * @returns Número de dias não executadas (0 se não estiver não executada)
 */
export function calculateMissedDays(plannedDate: Date | string | null, currentDate?: Date): number {
  if (!plannedDate) {
    return 0;
  }

  const today = currentDate || new Date();
  const planned = new Date(plannedDate);

  // Usar apenas as datas em formato YYYY-MM-DD para evitar problemas de fuso horário
  const todayDateString = today.toISOString().split('T')[0]; // "2025-08-14"
  const plannedDateString = planned.toISOString().split('T')[0]; // "2025-08-12"

  // Converter de volta para Date UTC para cálculo preciso
  const todayUTC = new Date(todayDateString + 'T00:00:00.000Z');
  const plannedUTC = new Date(plannedDateString + 'T00:00:00.000Z');

  // Se a data planejada é hoje ou no futuro, não está não executada
  if (plannedUTC.getTime() >= todayUTC.getTime()) {
    return 0;
  }

  // Calcular diferença em dias
  const daysDiff = Math.floor((todayUTC.getTime() - plannedUTC.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysDiff);
}

/**
 * Adiciona o campo missedDaysCount calculado a uma tarefa
 * @param task - Tarefa do banco de dados
 * @returns Tarefa com missedDaysCount calculado
 */
export function addMissedDaysCount<T extends { plannedDate?: Date | string | null }>(
  task: T
): T & { missedDaysCount: number } {
  return {
    ...task,
    missedDaysCount: calculateMissedDays(task.plannedDate)
  };
}

/**
 * Adiciona o campo missedDaysCount calculado a uma lista de tarefas
 * @param tasks - Lista de tarefas do banco de dados
 * @returns Lista de tarefas com missedDaysCount calculado
 */
export function addMissedDaysCountToTasks<T extends { plannedDate?: Date | string | null }>(
  tasks: T[]
): (T & { missedDaysCount: number })[] {
  return tasks.map(task => addMissedDaysCount(task));
}