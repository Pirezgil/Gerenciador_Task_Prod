'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  Clock,
  Battery,
  Brain,
  Zap,
  Circle,
  CalendarDays,
  CalendarRange,
  CalendarCheck
} from 'lucide-react';
import { useTasks } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: any[];
}

type ViewType = 'month' | 'week' | 'day';

export function CalendarPageClient() {
  const router = useRouter();
  const { data: allTasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');

  const getEnergyIcon = (points: number) => {
    switch (points) {
      case 1: return <Battery className="w-3 h-3 text-green-500" />;
      case 3: return <Brain className="w-3 h-3 text-blue-500" />;
      case 5: return <Zap className="w-3 h-3 text-purple-500" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return allTasks.filter(task => {
      if (!task) return false;
      
      // Tarefas com data de vencimento específica
      if (task.dueDate && task.dueDate !== 'Sem vencimento') {
        const taskDateStr = task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate;
        if (taskDateStr === dateStr) return true;
      }
      
      // Tarefas recorrentes
      if (task.isRecurring && task.recurrenceType) {
        const taskCreatedDate = new Date(task.createdAt);
        const daysDiff = Math.floor((date.getTime() - taskCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (task.recurrenceType) {
          case 'daily':
            return daysDiff >= 0;
          case 'weekly':
            return daysDiff >= 0 && daysDiff % 7 === 0;
          case 'monthly':
            return daysDiff >= 0 && date.getDate() === taskCreatedDate.getDate();
          default:
            return false;
        }
      }
      
      return false;
    });
  };

  const calendarDays = useMemo(() => {
    if (viewType !== 'month') return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Adicionar dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        tasks: getTasksForDate(date)
      });
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date)
      });
    }

    // Completar com dias do próximo mês para preencher a grade
    const totalDays = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        tasks: getTasksForDate(date)
      });
    }

    return days;
  }, [currentDate, allTasks, viewType]);

  const weekDays = useMemo(() => {
    if (viewType !== 'week') return [];
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date)
      });
    }

    return days;
  }, [currentDate, allTasks, viewType]);

  const dayTasks = useMemo(() => {
    if (viewType !== 'day') return [];
    return getTasksForDate(currentDate);
  }, [currentDate, allTasks, viewType]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="p-4 text-center">Carregando calendário...</div>
      </div>
    );
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calendário de Tarefas</h1>
                <p className="text-blue-100 mt-1">Visualize suas tarefas organizadas por data</p>
              </div>
            </div>
            
            <Link
              href="/tarefas"
              className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-2xl hover:bg-white/25 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Target className="w-5 h-5" />
              <span className="font-semibold">Voltar às Tarefas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigateMonth('prev')}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {viewType === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewType === 'week' && (() => {
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} até ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
              })()}
              {viewType === 'day' && `${currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </h2>
            
            <Button
              onClick={() => navigateMonth('next')}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewType('month')}
                variant={viewType === 'month' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-1.5 text-xs ${
                  viewType === 'month' 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <CalendarDays className="w-3 h-3 mr-1" />
                Mês
              </Button>
              <Button
                onClick={() => setViewType('week')}
                variant={viewType === 'week' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-1.5 text-xs ${
                  viewType === 'week' 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <CalendarRange className="w-3 h-3 mr-1" />
                Semana
              </Button>
              <Button
                onClick={() => setViewType('day')}
                variant={viewType === 'day' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-1.5 text-xs ${
                  viewType === 'day' 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <CalendarCheck className="w-3 h-3 mr-1" />
                Dia
              </Button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <motion.div
        key={`${viewType}-${currentDate.getMonth()}-${currentDate.getFullYear()}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Month View */}
        {viewType === 'month' && (
          <>
            {/* Week days header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-100 relative ${
                    !day.isCurrentMonth ? 'bg-gray-50' : ''
                  } ${
                    day.isToday ? 'bg-green-50 border-green-300 ring-1 ring-green-200' : ''
                  }`}
                >
                  {/* Day number */}
                  <div className={`text-sm font-medium mb-2 ${
                    !day.isCurrentMonth ? 'text-gray-400' : 
                    day.isToday ? 'text-green-700 font-bold' : 'text-gray-900'
                  }`}>
                    {day.dayNumber}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-700 line-through' 
                            : task.status === 'postponed'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                        title={task.description}
                      >
                        <div className="flex items-center space-x-1">
                          {getEnergyIcon(task.energyPoints)}
                          <span className="truncate flex-1">{task.description}</span>
                        </div>
                      </div>
                    ))}

                    {/* More tasks indicator */}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{day.tasks.length - 3} mais
                      </div>
                    )}
                  </div>

                  {/* Task count indicator */}
                  {day.tasks.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        day.tasks.length > 5 ? 'bg-red-500 text-white' :
                        day.tasks.length > 2 ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {day.tasks.length}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Week View */}
        {viewType === 'week' && (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day, index) => (
                <div key={index} className={`p-4 text-center border-r border-gray-200 ${
                  day.isToday ? 'bg-green-50 border-green-300' : 'bg-gray-50'
                }`}>
                  <div className="text-xs text-gray-500">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index]}
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${
                    day.isToday ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {day.dayNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {day.tasks.length} tarefas
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className={`border-r border-gray-200 p-3 ${
                  day.isToday ? 'bg-green-50/30' : ''
                }`}>
                  <div className="space-y-2">
                    {day.tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-xs">Sem tarefas</div>
                      </div>
                    ) : (
                      day.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          onClick={() => handleTaskClick(task.id)}
                          className={`text-xs p-2 rounded cursor-pointer hover:shadow-sm transition-all border ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-700 border-green-200 line-through' 
                              : task.status === 'postponed'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                          title={task.description}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            {getEnergyIcon(task.energyPoints)}
                            <span className="font-medium truncate">{task.description}</span>
                          </div>
                          {/* Data removida conforme solicitação */}
                          {task.project && (
                            <div className="text-xs opacity-70 mt-1">
                              📁 {task.project.name}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Day View */}
        {viewType === 'day' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {dayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma tarefa para este dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                        task.status === 'completed' 
                          ? 'bg-green-50 border border-green-200' 
                          : task.status === 'postponed'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getEnergyIcon(task.energyPoints)}
                          <div>
                            <h3 className={`font-semibold ${
                              task.status === 'completed' ? 'line-through text-gray-500' : ''
                            }`}>
                              {task.description}
                            </h3>
                            {task.project && (
                              <p className="text-sm text-gray-600">
                                📁 {task.project.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {/* Data removida conforme solicitação */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Tarefas Pendentes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Tarefas Concluídas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Tarefas Adiadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>Dia Atual</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Energia das Tarefas</h4>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Battery className="w-3 h-3 text-green-500" />
              <span>Baixa</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3 text-blue-500" />
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-500" />
              <span>Alta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}