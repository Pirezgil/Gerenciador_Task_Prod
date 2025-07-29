'use client';

// ============================================================================
// TASK ITEM - Item individual de tarefa com anexos e edição
// ============================================================================

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
import { FileUpload, useFileUpload } from '@/components/shared/FileUpload';
import { useTasksStore } from '@/stores/tasksStore';
import type { Task, Attachment } from '@/types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  onUpdateAttachments?: (taskId: string, attachments: Attachment[]) => void;
  showProject?: boolean;
}

export function TaskItem({ 
  task, 
  onComplete, 
  onPostpone, 
  onUpdateAttachments, 
  showProject = true 
}: TaskItemProps) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { uploadFiles } = useFileUpload();
  const { openTaskEditModal } = useTasksStore();

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
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

  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasComments = task.comments && task.comments.length > 0;

  
  // CORREÇÃO: Verificação prévia de energia antes de qualquer ação
  const handleTaskAction = async (action: () => void, requiredEnergy: number = 1) => {
    // Verificação síncrona primeiro
    if (energy < requiredEnergy) {
      setShowLowEnergyModal(true);
      return;
    }
    
    // Se passou na verificação, executar ação
    action();
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleTaskClick}
      className={`bg-white/70 backdrop-blur-xl rounded-2xl p-5 border-l-4 shadow-lg border cursor-pointer ${
        task.status === 'done' 
          ? 'border-l-green-400 bg-green-50/50 border-green-100' 
          : 'border-l-gray-200 hover:border-l-blue-400 border-white/20 hover:shadow-xl'
      } transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
              task.energyPoints === 1 ? 'bg-gradient-to-r from-orange-100 to-orange-200' :
              task.energyPoints === 3 ? 'bg-gradient-to-r from-blue-100 to-blue-200' :
              'bg-gradient-to-r from-purple-100 to-purple-200'
            }`}>
              {getEnergyIcon(task.energyPoints)}
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">
                {task.energyPoints === 1 ? "Bateria Fraca" : 
                 task.energyPoints === 3 ? "Cérebro Normal" : "Cérebro Ligado"}
              </span>
              {task.project && showProject && (
                <div className="mt-1">
                  <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                    {task.project.icon} {task.project.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed mb-3 ${
            task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'
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
                className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
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
                className="flex items-center space-x-2 text-xs text-purple-600 hover:text-purple-700 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments!.length} comentário{task.comments!.length !== 1 ? 's' : ''}</span>
                {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEditClick}
            className="w-8 h-8 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 text-gray-400 hover:text-blue-600 shadow-md hover:shadow-lg flex items-center justify-center"
            title="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          
          {task.status !== 'done' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id);
              }}
              className="w-8 h-8 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-orange-100 hover:to-orange-200 text-gray-400 hover:text-orange-600 shadow-md hover:shadow-lg flex items-center justify-center"
              title="Adiar tarefa"
            >
              <Calendar className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            disabled={task.status === 'done'}
            className={`w-10 h-10 rounded-full transition-all duration-300 ${
              task.status === 'done'
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-600 cursor-default shadow-lg'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-green-100 hover:to-green-200 text-gray-400 hover:text-green-600 shadow-md hover:shadow-lg'
            } flex items-center justify-center`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Seção de anexos */}
      <AnimatePresence>
        {showAttachments && onUpdateAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
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
            className="mt-4 pt-4 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.comments!.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
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
