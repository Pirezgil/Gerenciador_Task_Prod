'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Clock, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReminders } from '@/hooks/api/useReminders';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'all' | 'active' | 'overdue' | 'upcoming';

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const { data: reminders = [], isLoading } = useReminders();

  const getFilteredReminders = () => {
    const now = new Date();
    
    if (!Array.isArray(reminders)) return [];
    
    switch (filter) {
      case 'active':
        return reminders.filter(r => r.isActive);
      case 'overdue':
        return reminders.filter(r => 
          r.nextScheduledAt && 
          new Date(r.nextScheduledAt) < now && 
          r.isActive
        );
      case 'upcoming':
        return reminders.filter(r => 
          r.nextScheduledAt && 
          new Date(r.nextScheduledAt) > now && 
          r.isActive
        );
      default:
        return reminders;
    }
  };

  const filteredReminders = getFilteredReminders();
  const overdueCount = Array.isArray(reminders) ? reminders.filter(r => 
    r.nextScheduledAt && 
    new Date(r.nextScheduledAt) < new Date() && 
    r.isActive
  ).length : 0;

  const upcomingCount = Array.isArray(reminders) ? reminders.filter(r => 
    r.nextScheduledAt && 
    new Date(r.nextScheduledAt) > new Date() && 
    r.isActive
  ).length : 0;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `há ${diffHours}h`;
    if (diffMins > 0) return `há ${diffMins}min`;
    return 'agora';
  };

  const formatUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `em ${diffHours}h`;
    if (diffMins > 0) return `em ${diffMins}min`;
    return 'agora';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface/95 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-primary" />
                {overdueCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-semibold">
                      {overdueCount > 9 ? '9+' : overdueCount}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Central de Notificações
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 space-y-3 border-b border-border bg-surface/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                count={Array.isArray(reminders) ? reminders.length : 0}
              >
                Todos
              </FilterButton>
              
              <FilterButton
                active={filter === 'overdue'}
                onClick={() => setFilter('overdue')}
                count={overdueCount}
                variant="danger"
              >
                Não executados
              </FilterButton>
              
              <FilterButton
                active={filter === 'upcoming'}
                onClick={() => setFilter('upcoming')}
                count={upcomingCount}
                variant="success"
              >
                Próximos
              </FilterButton>
              
              <FilterButton
                active={filter === 'active'}
                onClick={() => setFilter('active')}
                count={Array.isArray(reminders) ? reminders.filter(r => r.isActive).length : 0}
              >
                Ativos
              </FilterButton>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                <div className="font-semibold text-green-700 dark:text-green-400">
                  {upcomingCount}
                </div>
                <div className="text-green-600 dark:text-green-500">Próximos</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                <div className="font-semibold text-red-700 dark:text-red-400">
                  {overdueCount}
                </div>
                <div className="text-red-600 dark:text-red-500">Não executados</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-text-secondary">
                  {filter === 'all' ? 'Nenhum lembrete encontrado' : 
                   filter === 'overdue' ? 'Nenhum lembrete não executado' :
                   filter === 'upcoming' ? 'Nenhum lembrete próximo' :
                   'Nenhum lembrete ativo'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReminders.map((reminder) => {
                  const isOverdue = reminder.nextScheduledAt && 
                    new Date(reminder.nextScheduledAt) < new Date();
                  
                  return (
                    <motion.div
                      key={reminder.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-4 rounded-xl border transition-all duration-200',
                        isOverdue && reminder.isActive
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-surface border-border hover:border-primary/30',
                        !reminder.isActive && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'mt-1 w-2 h-2 rounded-full shrink-0',
                          reminder.isActive 
                            ? isOverdue 
                              ? 'bg-red-500' 
                              : 'bg-green-500'
                            : 'bg-gray-400'
                        )} />
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={
                              reminder.type === 'before_due' ? 'destructive' :
                              reminder.type === 'recurring' ? 'default' : 'secondary'
                            }>
                              {reminder.entityType === 'task' ? '📋' : '💪'} 
                              {reminder.type === 'scheduled' ? 'Agendado' :
                               reminder.type === 'before_due' ? 'Prazo' : 'Recorrente'}
                            </Badge>
                            
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              <MoreVertical className="w-3 h-3 text-text-secondary" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-text-primary font-medium line-clamp-2">
                            {reminder.message || 'Lembrete personalizado'}
                          </p>
                          
                          {reminder.nextScheduledAt && (
                            <div className="flex items-center gap-1 text-xs text-text-secondary">
                              <Clock className="w-3 h-3" />
                              {isOverdue ? (
                                <span className="text-red-600">
                                  Não executado {formatTimeAgo(reminder.nextScheduledAt)}
                                </span>
                              ) : (
                                <span>
                                  {formatUpcoming(reminder.nextScheduledAt)}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {reminder.notificationTypes.length > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              {reminder.notificationTypes.map(type => {
                                const icons = { push: '🔔', email: '📧', sms: '📱' };
                                return (
                                  <span key={type} title={type}>
                                    {icons[type as keyof typeof icons]}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  variant?: 'default' | 'danger' | 'success';
  children: React.ReactNode;
}

function FilterButton({ 
  active, 
  onClick, 
  count, 
  variant = 'default',
  children 
}: FilterButtonProps) {
  const variants = {
    default: active 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700',
    danger: active 
      ? 'bg-red-500 text-white' 
      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
    success: active 
      ? 'bg-green-500 text-white' 
      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
        variants[variant]
      )}
    >
      {children}
      {count > 0 && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
          active 
            ? 'bg-white/20 text-current' 
            : 'bg-gray-200 dark:bg-gray-700 text-text-secondary'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}