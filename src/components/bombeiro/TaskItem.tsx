// ============================================================================
// TASK ITEM - Versão padronizada seguindo Sistema Sentinela
// ============================================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  Battery, 
  Brain, 
  Zap, 
  Paperclip, 
  ChevronDown, 
  ChevronUp,
  Edit3,
  MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload, useFileUpload } from '@/components/shared/FileUpload';
import { useTasksStore } from '@/stores/tasksStore';
import type { Task, Attachment } from '@/types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onPostpone: (taskId: string) => void;
  onUpdateAttachments?: (taskId: string, attachments: Attachment[]) => void;
  showProject?: boolean;
}

export function TaskItem({ 
  task, 
  onComplete, 
  onEdit,
  onPostpone, 
  onUpdateAttachments, 
  showProject = true 
}: TaskItemProps) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { uploadFiles } = useFileUpload();
  const { openTaskEditModal } = useTasksStore();

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4" />;
    if (points === 3) return <Brain className="w-4 h-4" />;
    if (points === 5) return <Zap className="w-4 h-4" />;
  };

  const getEnergyConfig = (points: number) => {
    if (points === 1) return {
      level: 'baixa' as const,
      label: '🔋 Energia Baixa',
      bgClass: 'bg-energia-baixa/20',
      indicatorClass: 'energia-baixa-indicador'
    };
    if (points === 3) return {
      level: 'normal' as const,
      label: '🧠 Energia Normal',
      bgClass: 'bg-energia-normal/20',
      indicatorClass: 'energia-normal-indicador'
    };
    return {
      level: 'alta' as const,
      label: '⚡ Energia Alta',
      bgClass: 'bg-energia-alta/20',
      indicatorClass: 'energia-alta-indicador'
    };
  };

  const handleUpload = async (files: File[]) => {
    if (!onUpdateAttachments) return [];
    
    const newAttachments = await uploadFiles(files);
    const updatedAttachments = [...(task.attachments || []), ...newAttachments];
    onUpdateAttachments(task.id, updatedAttachments);
    return newAttachments;
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!onUpdateAttachments) return;
    
    const updatedAttachments = (task.attachments || []).filter(att => att.id !== attachmentId);
    onUpdateAttachments(task.id, updatedAttachments);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskEditModal(task);
  };

  const handleTaskClick = () => {
    if (task.status !== 'done') {
      openTaskEditModal(task);
    }
  };

  const energyConfig = getEnergyConfig(task.energyPoints);
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasComments = task.comments && task.comments.length > 0;
  const isCompleted = task.status === 'done';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleTaskClick}
      className={`sentinela-card cursor-pointer transition-all duration-300 ${
        isCompleted 
          ? 'bg-semantic-success/10 border-l-4 border-l-semantic-success' 
          : 'border-l-4 border-l-border hover:border-l-primary-500 hover:shadow-medium'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header da Tarefa */}
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${energyConfig.bgClass}`}>
              <span className={energyConfig.indicatorClass}>
                {getEnergyIcon(task.energyPoints)}
              </span>
            </div>
            <div>
              <span className="text-xs sentinela-text-secondary font-medium">
                {energyConfig.label}
              </span>
              {task.project && showProject && (
                <div className="mt-1">
                  <span className="text-xs bg-surface sentinela-text-secondary px-3 py-1 rounded-full border border-border">
                    {task.project.icon} {task.project.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Descrição da Tarefa */}
          <p className={`sentinela-text text-sm leading-relaxed mb-3 ${
            isCompleted ? 'line-through opacity-60' : 'font-medium'
          }`}>
            {task.description}
          </p>

          {/* Indicadores de anexos e comentários */}
          <div className="flex items-center space-x-4 mb-3">
            {hasAttachments && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAttachments(!showAttachments);
                }}
                className="flex items-center space-x-2 text-xs text-primary-500 hover:text-primary-600 sentinela-transition"
              >
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments!.length} anexo{task.attachments!.length !== 1 ? 's' : ''}</span>
                {showAttachments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            
            {hasComments && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center space-x-2 text-xs text-energia-alta hover:text-energia-alta/80 sentinela-transition"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments!.length} comentário{task.comments!.length !== 1 ? 's' : ''}</span>
                {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
        
        {/* Ações da Tarefa */}
        <div className="ml-4 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
            className="sentinela-transition"
            title="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          {!isCompleted && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id);
              }}
              className="sentinela-transition hover:border-semantic-warning hover:text-semantic-warning"
              title="Adiar tarefa"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant={isCompleted ? "sentinela-soft" : "ghost"}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            disabled={isCompleted}
            className={isCompleted ? "bg-semantic-success/20 text-semantic-success" : "hover:bg-semantic-success/20 hover:text-semantic-success"}
            title={isCompleted ? "Tarefa concluída" : "Marcar como concluída"}
          >
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Seção de anexos */}
      <AnimatePresence>
        {showAttachments && onUpdateAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <FileUpload
              attachments={task.attachments || []}
              onUpload={handleUpload}
              onRemove={handleRemoveAttachment}
              maxFiles={3}
              maxSize={5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seção de comentários */}
      <AnimatePresence>
        {showComments && hasComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.comments!.map((comment) => (
                <div key={comment.id} className="sentinela-card-soft p-3">
                  <p className="sentinela-text text-sm">{comment.content}</p>
                  <p className="sentinela-text-secondary text-xs mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()} às {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}