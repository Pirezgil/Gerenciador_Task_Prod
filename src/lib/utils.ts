// ============================================================================
// UTILS - FunÃ§Ãµes utilitÃ¡rias para o CÃ©rebro-CompatÃ­vel
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EnergyLevel, Task, EnergyBudget } from '@/types';

/**
 * Combina classes CSS com Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gera ID Ãºnico
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Formata data para exibiÃ§Ã£o
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
  
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formata hora para exibiÃ§Ã£o
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calcula orÃ§amento de energia
 */
export function calculateEnergyBudget(tasks: Task[], totalBudget: number = 12): EnergyBudget {
  const used = tasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  
  const remaining = Math.max(0, totalBudget - used);
  const percentage = Math.min((used / totalBudget) * 100, 100);
  
  return {
    used,
    total: totalBudget,
    remaining,
    percentage,
    isOverBudget: used > totalBudget,
    isComplete: used === totalBudget,
  };
}

/**
 * Retorna mensagem de encorajamento baseada no orÃ§amento de energia
 */
export function getEncouragementMessage(budget: EnergyBudget): string {
  if (budget.isOverBudget) {
    return 'Dia um pouco cheio! Considere reorganizar algumas tarefas.';
  }
  
  if (budget.isComplete) {
    return 'Perfeito! Seu dia estÃ¡ completo. Energia totalmente alocada.';
  }
  
  if (budget.percentage > 80) {
    return 'Quase lÃ¡! VocÃª estÃ¡ no limite ideal de energia.';
  }
  
  if (budget.percentage > 60) {
    return 'Bom ritmo! VocÃª estÃ¡ conseguindo manter o equilÃ­brio.';
  }
  
  return 'Energia preservada! EspaÃ§o para mais atividades se surgir algo importante.';
}

/**
 * Retorna cor CSS baseada no orÃ§amento de energia
 */
export function getEnergyColor(budget: EnergyBudget): string {
  if (budget.isOverBudget) {
    return 'text-orange-600';
  }
  
  if (budget.percentage > 80) {
    return 'text-yellow-600';
  }
  
  if (budget.percentage > 60) {
    return 'text-blue-600';
  }
  
  return 'text-green-600';
}

/**
 * Retorna Ã­cone de energia baseado no nÃ­vel
 */
export function getEnergyIcon(level: EnergyLevel): string {
  const icons = {
    1: 'ðŸ”‹', // Bateria Fraca
    3: 'ðŸ§ ', // CÃ©rebro Normal  
    5: 'âš¡', // CÃ©rebro Ligado
  };
  
  return icons[level];
}

/**
 * Retorna label de energia baseado no nÃ­vel
 */
export function getEnergyLabel(level: EnergyLevel): string {
  const labels = {
    1: 'Bateria Fraca',
    3: 'CÃ©rebro Normal',
    5: 'CÃ©rebro Ligado',
  };
  
  return labels[level];
}

/**
 * Retorna cores CSS baseadas no nÃ­vel de energia
 */
export function getEnergyColors(level: EnergyLevel): string {
  const colors = {
    1: 'from-orange-100 to-orange-200 text-orange-700 border-orange-200',
    3: 'from-blue-100 to-blue-200 text-blue-700 border-blue-200',
    5: 'from-purple-100 to-purple-200 text-purple-700 border-purple-200',
  };
  
  return colors[level];
}

/**
 * Valida se uma tarefa pode ser adicionada ao orÃ§amento
 */
export function canAddTask(energyBudget: EnergyBudget, energyPoints: EnergyLevel): boolean {
  return (energyBudget.used + energyPoints) <= energyBudget.total;
}

/**
 * Calcula dias atÃ© deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Retorna saudaÃ§Ã£o baseada no horÃ¡rio
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Trunca texto para um tamanho mÃ¡ximo
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function para otimizaÃ§Ã£o de performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza string para uso em IDs
 */
export function sanitizeId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calcula progresso percentual
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Ordena array por propriedade
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Agrupa array por propriedade
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
