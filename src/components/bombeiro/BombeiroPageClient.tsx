'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, CheckCircle, Clock, Trophy, Target, TrendingUp, Battery } from 'lucide-react';
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
import { LowEnergyModal } from '@/components/protocols/LowEnergyModal';
import { DecompositionModal } from '@/components/protocols/DecompositionModal';
import { EmergencyChoiceModal } from '@/components/protocols/EmergencyChoiceModal';


interface BombeiroPageClientProps {
  showNewTaskModal: boolean;
  setShowNewTaskModal: (show: boolean) => void;
  showLowEnergyModal: boolean;
  setShowLowEnergyModal: (show: boolean) => void;
}

export function BombeiroPageClient({
  showNewTaskModal,
  setShowNewTaskModal,
  showLowEnergyModal,
  setShowLowEnergyModal
}: BombeiroPageClientProps) {
  // Store state
  const {
    todayTasks,
    addTaskToToday,
    completeTask,
    postponeTask,
    openTaskEditModal,
    updateTaskEditData,
    saveTaskEdit,
    deleteTask,
    taskEditModal,
    setTaskEditModal,
    calculateEnergyBudget,
    showEmergencyModal,
    setShowEmergencyModal
  } = useTasksStore();

  // Local state
  // Props recebidas do contexto
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

  const handleTaskPostpone = useCallback((taskId: string) => {
    postponeTask(taskId);
  }, [postponeTask]);

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

  const handleUpdateAttachments = useCallback((taskId: string, attachments: any[]) => {
    // TODO: Implementar atualização de anexos no store
    console.log('Atualizando anexos para tarefa', taskId, attachments);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
    setTaskEditModal({ ...taskEditModal, isOpen: false });
  }, [deleteTask, setTaskEditModal, taskEditModal]);

  const handleLowEnergyClick = useCallback(() => {
    setShowLowEnergyModal(true);
  }, [setShowLowEnergyModal]);

return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-red-950">
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
                    onComplete={handleTaskComplete}
                    onEdit={handleTaskEdit}
                    onPostpone={handleTaskPostpone}
                    onUpdateAttachments={handleUpdateAttachments}
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
                    onComplete={handleTaskComplete}
                    onEdit={handleTaskEdit}
                    onPostpone={handleTaskPostpone}
                    onUpdateAttachments={handleUpdateAttachments}
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

      {/* PROTOCOLOS DE EXCEÇÃO */}
      <LowEnergyModal />
      <DecompositionModal />
      <EmergencyChoiceModal />

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
