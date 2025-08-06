'use client';

import React, { useState } from 'react';
import { useAddComment } from '@/hooks/api/useTasks';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Task } from '@/types/task';
import { AutoExpandingTextarea } from '@/components/shared/AutoExpandingTextarea';

interface CommentSectionProps {
  task: Task;
}

export function CommentSection({ task }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const addCommentMutation = useAddComment();
  const { user } = useAuthStore();

  const handleAddComment = async () => {
    if (newComment.trim() === '' || !user) return;
    
    try {
      await addCommentMutation.mutateAsync({
        taskId: task.id,
        comment: { 
          author: user.name || 'Usuário', 
          content: newComment.trim() 
        }
      });
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Ctrl+Enter: adicionar quebra de linha
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = newComment.substring(0, start) + '\n' + newComment.substring(end);
        setNewComment(newValue);
        
        // Restaurar posição do cursor após a quebra de linha
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      } else {
        // Enter: enviar comentário
        e.preventDefault();
        handleAddComment();
      }
    }
  };

  return (
    <div className="flex items-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <AutoExpandingTextarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreva um comentário"
        className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
        rows={1}
      />
      <Button onClick={handleAddComment} size="icon" className="bg-blue-600 hover:bg-blue-700 text-white">
        <Send size={18} />
      </Button>
    </div>
  );
}
