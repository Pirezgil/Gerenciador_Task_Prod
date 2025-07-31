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
  <div className="min-h-screen bg-background sentinela-fade-in">
    {/* Main Content */}

      <main className="responsive-container py-6 space-y-6">
        {/* Stats Grid */}
        <div className="responsive-grid cols-2-sm cols-4-lg gap-4">
          <Card className="sentinela-card border-l-4 border-l-energia-baixa hover:shadow-energia-baixa">
            <CardContent className="responsive-spacing">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-energia-baixa/20 rounded-xl sentinela-transition">
                  <Clock className="w-5 h-5 text-energia-baixa dark:text-orange-400" />
                </div>
                <div>
                  <p className="sentinela-text-secondary text-xs font-medium uppercase tracking-wide">
                    Pendentes
                  </p>
                  <p className="sentinela-subtitle text-energia-baixa">
                    {pendingTasks.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sentinela-card border-l-4 border-l-semantic-success hover:shadow-medium">
            <CardContent className="responsive-spacing">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-semantic-success/20 rounded-xl sentinela-transition">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="sentinela-text-secondary text-xs font-medium uppercase tracking-wide">
                    Hoje
                  </p>
                  <p className="sentinela-subtitle text-semantic-success">
                    {completedToday.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sentinela-card border-l-4 border-l-energia-normal hover:shadow-energia-normal">
            <CardContent className="responsive-spacing">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-energia-normal/20 rounded-xl sentinela-transition">
                  <Trophy className="w-5 h-5 text-energia-normal dark:text-energia-normal" />
                </div>
                <div>
                  <p className="sentinela-text-secondary text-xs font-medium uppercase tracking-wide">
                    Energia
                  </p>
                  <p className="sentinela-subtitle text-energia-normal">
                    {energyBudget.remaining}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sentinela-card border-l-4 border-l-energia-alta hover:shadow-energia-alta">
            <CardContent className="responsive-spacing">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-energia-alta/20 rounded-xl sentinela-transition">
                  <Target className="w-5 h-5 text-energia-alta dark:text-energia-alta" />
                </div>
                <div>
                  <p className="sentinela-text-secondary text-xs font-medium uppercase tracking-wide">
                    Total
                  </p>
                  <p className="sentinela-subtitle text-energia-alta">
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
        <div className="responsive-grid cols-1 lg:cols-2 gap-6">
          {/* Pending Tasks */}
          <Card className="border-energia-baixa/30 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5 text-energia-baixa" />
                Tarefas Pendentes
                <Badge variant="secondary" className="ml-auto">
                  {pendingTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 sentinela-text-secondary">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 dark:text-green-400 opacity-50" />
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
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                Incêndios Controlados
                <Badge variant="secondary" className="ml-auto">
                  {completedTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 sentinela-text-secondary">
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
