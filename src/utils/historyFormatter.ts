import type { HistoryEntry } from '@/types/task';

const fieldLabels: { [key: string]: string } = {
  description: 'Descrição',
  energyPoints: 'Energia',
  dueDate: 'Data de vencimento',
  projectId: 'Projeto',
  status: 'Status',
};

const statusLabels: { [key: string]: string } = {
  pending: 'pendente',
  completed: 'concluída',
  postponed: 'adiada',
  in_progress: 'em andamento',
};

export const formatHistoryValue = (field: string, value: string | number | null | undefined, projects?: any[]): string => {
  if (value === null || value === undefined || value === '') return 'vazio';
  
  if (field === 'dueDate' && typeof value === 'string') {
    if (value === 'Sem vencimento' || value === '') return 'sem data';
    if (value.includes('-') && value.length === 10) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    } else if (value.includes('T')) {
      const [year, month, day] = value.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    return value;
  }
  
  if (field === 'status' && statusLabels[value.toString()]) {
    return statusLabels[value.toString()];
  }
  
  if (field === 'projectId' && projects) {
    return projects.find(p => p.id === value)?.name || 'nenhum projeto';
  }
  
  return value.toString();
};

export const formatHistoryMessage = (entry: HistoryEntry, projects?: any[]): string => {
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Tarefa criada
  if (entry.action === 'created' || entry.field === 'created') {
    return `Tarefa criada dia ${dateStr} às ${timeStr}`;
  }

  // Tarefa completada
  if (entry.action === 'completed') {
    return `Tarefa concluída dia ${dateStr} às ${timeStr}`;
  }

  // Tarefa adiada - verificar tanto action quanto field
  if (entry.action === 'postponed') {
    return `Execução adiada dia ${dateStr} às ${timeStr}`;
  }

  // Mudanças de status específicas
  if (entry.field === 'status' && entry.oldValue && entry.newValue) {
    const oldStatus = statusLabels[entry.oldValue?.toString()] || entry.oldValue;
    const newStatus = statusLabels[entry.newValue?.toString()] || entry.newValue;
    
    if (entry.newValue === 'postponed') {
      return `Execução adiada dia ${dateStr} às ${timeStr}`;
    }
    if (entry.newValue === 'completed') {
      return `Tarefa concluída dia ${dateStr} às ${timeStr}`;
    }
    
    return `Status alterado de ${oldStatus} para ${newStatus}`;
  }

  // Caso legacy onde field contém a action (para compatibilidade)
  if (entry.field === 'postponed' && !entry.action) {
    return `Execução adiada dia ${dateStr} às ${timeStr}`;
  }

  // Campos específicos alterados
  if (entry.field && entry.oldValue !== undefined && entry.newValue !== undefined) {
    const fieldName = fieldLabels[entry.field] || entry.field;
    const oldValue = formatHistoryValue(entry.field, entry.oldValue, projects);
    const newValue = formatHistoryValue(entry.field, entry.newValue, projects);
    
    if (entry.field === 'dueDate') {
      return `Data de vencimento alterada de ${oldValue} para ${newValue}`;
    }
    
    if (entry.field === 'description') {
      return `Descrição alterada dia ${dateStr} às ${timeStr}`;
    }
    
    if (entry.field === 'energyPoints') {
      return `Energia alterada de ${oldValue} para ${newValue}`;
    }
    
    if (entry.field === 'projectId') {
      return `Projeto alterado de ${oldValue} para ${newValue}`;
    }
    
    return `${fieldName} alterado de ${oldValue} para ${newValue}`;
  }

  // Fallback genérico
  if (entry.action === 'edited') return `Tarefa editada dia ${dateStr} às ${timeStr}`;
  
  return `Alteração realizada dia ${dateStr} às ${timeStr}`;
};