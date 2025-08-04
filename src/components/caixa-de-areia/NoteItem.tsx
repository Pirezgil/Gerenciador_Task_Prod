'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Archive, Sparkles, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotesStore } from '@/stores/notesStore';
import { useModalsStore } from '@/stores/modalsStore';
import { FileUpload, useFileUpload } from '@/components/shared/FileUpload';
import type { Note } from '@/types';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const {
    editingNote,
    setEditingNote,
    updateNote,
    archiveNote,
    deleteNote,
    updateNoteAttachments,
  } = useNotesStore();
  const { setShowTransformModal } = useModalsStore();
  
  const [showAttachments, setShowAttachments] = useState(false);
  const { uploadFiles } = useFileUpload();

  const isEditing = editingNote === note.id;
  const hasAttachments = note.attachments && note.attachments.length > 0;

  const handleUpload = async (files: File[]) => {
    const newAttachments = await uploadFiles(files);
    const updatedAttachments = [...(note.attachments || []), ...newAttachments];
    updateNoteAttachments(note.id, updatedAttachments);
    return newAttachments;
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedAttachments = (note.attachments || []).filter(att => att.id !== attachmentId);
    updateNoteAttachments(note.id, updatedAttachments);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-amber-100/50 hover:border-amber-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
            {new Date(note.createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {hasAttachments && (
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Paperclip className="w-3 h-3" />
              <span>{note.attachments?.length || 0}</span>
              {showAttachments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTransformModal(note)}
            className="p-2 text-amber-500 hover:text-amber-700 transition-colors bg-amber-50 rounded-xl hover:bg-amber-100"
            title="Transformar em ação"
          >
            <Sparkles className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditingNote(isEditing ? null : note.id)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => archiveNote(note.id)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
            title="Arquivar"
          >
            <Archive className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deleteNote(note.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl hover:bg-red-50"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            className="w-full h-36 p-4 border border-amber-200/50 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 font-serif text-gray-700 bg-white/50 backdrop-blur-sm transition-all duration-300"
            defaultValue={note.content}
            onBlur={(e) => updateNote(note.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = textarea.value.substring(0, start) + '\n' + textarea.value.substring(end);
                textarea.value = newValue;
                setTimeout(() => {
                  textarea.selectionStart = textarea.selectionEnd = start + 1;
                }, 0);
              }
            }}
            placeholder="Editar nota... (Ctrl+Enter para nova linha)"
            autoFocus
          />
        </div>
      ) : (
        <p className="text-gray-700 font-serif leading-relaxed whitespace-pre-wrap mb-4">
          {note.content}
        </p>
      )}

      {/* Seção de anexos */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-amber-200"
          >
            <FileUpload
              attachments={note.attachments || []}
              onUpload={handleUpload}
              onRemove={handleRemoveAttachment}
              maxFiles={5}
              maxSize={10}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}