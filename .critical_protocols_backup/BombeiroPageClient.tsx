'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, CheckCircle, Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasksStore } from '@/stores/tasksStore';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { EnergyMeter } from './EnergyMeter';
import { TaskItem } from './TaskItem';
import { PostponedTasksRoom } from './PostponedTasksRoom';
import WeeklyStats from './WeeklyStats';
import { UltraRewardingCelebration } from './UltraRewardingCelebration';

export function BombeiroPageClient() {
  // Store state
  const {
    todayTasks,
    addTaskToToday,
    completeTask,
    openTaskEditModal,
    updateTaskEditData,
    saveTaskEdit,
    deleteTask,
    taskEditModal,
    setTaskEditModal,
    calculateEnergyBudget
  } = useTasksStore();

  // Local state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Derived state
  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const completedTasks = todayTasks.filter(task => task.status === 'done');
  const completedToday = completedTasks.filter(task => {
    const today = new Date().toDateString();
    return task.completedAt && new Date(task.completedAt).toDateString() === today;
  });
  
  const energyBudget = calculateEnergyBudget();

  // Event handlers
  const handleTaskComplete = useCallback(async (taskId: string) => {
    completeTask(taskId);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  }, [completeTask]);

  const handleNewTask = useCallback((task: any) => {
    const success = addTaskToToday(task.description, task.energyPoints, task.projectId);
    if (success) {
      setShowNewTaskModal(false);
    }
  }, [addTaskToToday]);

  const handleTaskEdit = useCallback((task: any) => {
    openTaskEditModal(task);
  }, [openTaskEditModal]);

  const handleUpdateTask = useCallback((taskId: string, updates: any) => {
    saveTaskEdit({ taskId, ...updates });
    setTaskEditModal({ ...taskEditModal, isOpen: false });
  }, [saveTaskEdit, setTaskEditModal, taskEditModal]);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
    setTaskEditModal({ ...taskEditModal, isOpen: false });
  }, [deleteTask, setTaskEditModal, taskEditModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-red-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-orange-200 dark:border-red-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  🚒 Painel do Bombeiro
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                  Extintor de tarefas • Resgate de produtividade
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-orange-200 dark:border-red-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Pendentes
                  </p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingTasks.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Hoje
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {completedToday.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Energia
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {energyBudget.remaining}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {todayTasks.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Meter */}
        <EnergyMeter />

        {/* Weekly Stats */}
        <WeeklyStats />

        {/* Tasks Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Tasks */}
          <Card className="border-orange-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5 text-orange-500" />
                Tarefas Pendentes
                <Badge variant="secondary" className="ml-auto">
                  {pendingTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma tarefa pendente!</p>
                  <p className="text-xs">Você está em dia com suas tarefas 🎉</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleTaskComplete}
                    onEdit={handleTaskEdit}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Incêndios Controlados
                <Badge variant="secondary" className="ml-auto">
                  {completedTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Ainda não há conquistas hoje</p>
                  <p className="text-xs">Complete sua primeira tarefa!</p>
                </div>
              ) : (
                completedTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleTaskComplete}
                    onEdit={handleTaskEdit}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Postponed Tasks Room */}
        <PostponedTasksRoom />
      </main>

      {/* Modals */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSubmit={handleNewTask}
      />

      {taskEditModal.isOpen && taskEditModal.task && (
        <TaskEditModal
          isOpen={taskEditModal.isOpen}
          task={taskEditModal.task}
          onClose={() => setTaskEditModal({ ...taskEditModal, isOpen: false })}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <UltraRewardingCelebration
            isVisible={showCelebration}
            onClose={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
