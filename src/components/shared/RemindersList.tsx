'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Grid, List, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReminders } from '@/hooks/api/useReminders';
import { useRemindersStore } from '@/stores/remindersStore';
import { ReminderCard } from './ReminderCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'created' | 'scheduled' | 'type' | 'entity';
type FilterBy = 'all' | 'active' | 'inactive' | 'task' | 'habit' | 'overdue' | 'upcoming';

export function RemindersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('scheduled');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  
  const { data: reminders = [], isLoading, error } = useReminders();
  const { openReminderModal, resetReminderFormData } = useRemindersStore();

  const handleNewReminder = () => {
    resetReminderFormData();
    openReminderModal();
  };

  const getFilteredAndSortedReminders = () => {
    let filtered = reminders;
    const now = new Date();

    // Filter
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(r => r.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(r => !r.isActive);
        break;
      case 'task':
        filtered = filtered.filter(r => r.entityType === 'task');
        break;
      case 'habit':
        filtered = filtered.filter(r => r.entityType === 'habit');
        break;
      case 'overdue':
        filtered = filtered.filter(r => 
          r.nextScheduledAt && 
          new Date(r.nextScheduledAt) < now && 
          r.isActive
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(r => 
          r.nextScheduledAt && 
          new Date(r.nextScheduledAt) > now && 
          r.isActive
        );
        break;
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.message?.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search) ||
        r.entityType.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case 'scheduled':
        filtered.sort((a, b) => {
          if (!a.nextScheduledAt && !b.nextScheduledAt) return 0;
          if (!a.nextScheduledAt) return 1;
          if (!b.nextScheduledAt) return -1;
          return new Date(a.nextScheduledAt).getTime() - new Date(b.nextScheduledAt).getTime();
        });
        break;
      case 'created':
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'entity':
        filtered.sort((a, b) => a.entityType.localeCompare(b.entityType));
        break;
    }

    return filtered;
  };

  const filteredReminders = getFilteredAndSortedReminders();
  
  const stats = {
    total: reminders.length,
    active: reminders.filter(r => r.isActive).length,
    overdue: reminders.filter(r => 
      r.nextScheduledAt && 
      new Date(r.nextScheduledAt) < new Date() && 
      r.isActive
    ).length,
    upcoming: reminders.filter(r => 
      r.nextScheduledAt && 
      new Date(r.nextScheduledAt) > new Date() && 
      r.isActive
    ).length
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Erro ao carregar lembretes</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Meus Lembretes</h1>
          <p className="text-text-secondary mt-1">
            Gerencie seus lembretes de tarefas e hábitos
          </p>
        </div>
        <Button onClick={handleNewReminder} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Lembrete
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
          <div className="text-sm text-text-secondary">Total</div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-text-secondary">Ativos</div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-text-secondary">Atrasados</div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-text-secondary">Próximos</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-surface text-text-primary placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-text-secondary" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:border-primary outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="overdue">Atrasados</option>
              <option value="upcoming">Próximos</option>
              <option value="task">Tarefas</option>
              <option value="habit">Hábitos</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:border-primary outline-none"
          >
            <option value="scheduled">Por agendamento</option>
            <option value="created">Criação</option>
            <option value="type">Tipo</option>
            <option value="entity">Entidade</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {(filterBy !== 'all' || searchTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-secondary">Filtros ativos:</span>
          {filterBy !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filterBy}
              <button 
                onClick={() => setFilterBy('all')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              "{searchTerm}"
              <button 
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || filterBy !== 'all' 
                ? 'Nenhum lembrete encontrado'
                : 'Nenhum lembrete criado'
              }
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || filterBy !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro lembrete para começar'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <Button onClick={handleNewReminder} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Lembrete
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            layout
            className={cn(
              'grid gap-4',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 max-w-2xl'
            )}
          >
            <AnimatePresence>
              {filteredReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  compact={viewMode === 'list'}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Results info */}
      {!isLoading && filteredReminders.length > 0 && (
        <div className="text-center text-sm text-text-secondary">
          Exibindo {filteredReminders.length} de {reminders.length} lembretes
        </div>
      )}
    </div>
  );
}