
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Archive, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Move,
  Pin,
  Palette,
  Grid3X3,
  AlignLeft
} from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import type { MovableNote } from '@/types';

interface MovableNoteItemProps {
  note: MovableNote;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onToggleExpand: (id: string) => void;
  onUpdateZIndex: (id: string, zIndex: number) => void;
  onChangeColor: (id: string, color: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  layoutMode?: 'free' | 'grid' | 'list' | 'masonry';
  gridSize?: number;
  snapToGrid?: boolean;
}

const NOTE_COLORS = [
  '#fef3c7', // yellow
  '#fde68a', // amber
  '#fed7aa', // orange
  '#fecaca', // red
  '#f9a8d4', // pink
  '#ddd6fe', // purple
  '#c7d2fe', // indigo
  '#93c5fd', // blue
  '#7dd3fc', // sky
  '#67e8f9', // cyan
  '#6ee7b7', // emerald
  '#86efac', // green
];

export function MovableNoteItem({
  note,
  onUpdatePosition,
  onUpdateSize,
  onToggleExpand,
  onUpdateZIndex,
  onChangeColor,
  isSelected,
  onSelect,
  layoutMode = 'free',
  gridSize = 20,
  snapToGrid = true
}: MovableNoteItemProps) {
  const {
    editingNote,
    setShowTransformModal,
    updateNote,
    archiveNote,
    deleteNote,
  } = useTasksStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  const isEditing = editingNote === note.id;

  // Função para snap to grid inteligente
  const snapToGridPosition = useCallback((x: number, y: number): { x: number, y: number } => {
    if (!snapToGrid || layoutMode !== 'free') return { x, y };
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, layoutMode, gridSize]);

  // Função para validar limites da tela
  const validatePosition = useCallback((x: number, y: number): { x: number, y: number } => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const noteWidth = note.size.width;
    const noteHeight = note.size.height;
    
    return {
      x: Math.max(0, Math.min(x, viewportWidth - noteWidth)),
      y: Math.max(80, Math.min(y, viewportHeight - noteHeight)) // 80px para header
    };
  }, [note.size.width, note.size.height]);

  useEffect(() => {
    if (isSelected && noteRef.current) {
      onUpdateZIndex(note.id, 1000);
    }
  }, [isSelected, note.id, onUpdateZIndex]);

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(note.id);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Calcular nova posição
    let newX = note.position.x + info.offset.x;
    let newY = note.position.y + info.offset.y;
    
    // Validar limites
    const validatedPos = validatePosition(newX, newY);
    newX = validatedPos.x;
    newY = validatedPos.y;
    
    // Aplicar snap to grid se habilitado
    const snappedPos = snapToGridPosition(newX, newY);
    
    // Atualizar posição final
    onUpdatePosition(note.id, snappedPos.x, snappedPos.y);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHeight = Math.max(120, e.target.scrollHeight);
    onUpdateSize(note.id, note.size.width, newHeight);
  };

  // Calcular posição durante o drag
  const displayPosition = isDragging 
    ? { x: note.position.x + dragOffset.x, y: note.position.y + dragOffset.y }
    : note.position;

  // Determinar estilo baseado no layout mode
  const getLayoutStyles = () => {
    switch (layoutMode) {
      case 'grid':
        return {
          position: 'relative' as const,
          width: '100%',
          maxWidth: '300px',
          margin: '10px'
        };
      case 'list':
        return {
          position: 'relative' as const,
          width: '100%',
          margin: '8px 0'
        };
      case 'masonry':
        return {
          position: 'relative' as const,
          width: '100%',
          maxWidth: '280px',
          margin: '10px'
        };
      default: // free
        return {
          position: 'absolute' as const,
          left: displayPosition.x,
          top: displayPosition.y
        };
    }
  };

  const motionProps = layoutMode === 'free' ? {
    drag: true,
    dragMomentum: false,
    dragElastic: 0.1,
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    whileDrag: { 
      scale: 1.05, 
      zIndex: 9999,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
    }
  } : {};

  return (
    <motion.div
      ref={noteRef}
      {...motionProps}
      initial={{
        scale: 0.8,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        zIndex: isSelected ? 1000 : note.zIndex,
      }}
      whileHover={{ scale: layoutMode === 'free' ? 1.02 : 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${layoutMode === 'free' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      style={{
        ...getLayoutStyles(),
        width: layoutMode === 'free' ? note.size.width : undefined,
        minHeight: layoutMode === 'free' ? note.size.height : 'auto',
        zIndex: isSelected ? 1000 : note.zIndex,
      }}
      onClick={() => onSelect(note.id)}
    >
      <div
        className={`
          bg-gradient-to-br from-white/90 to-white/80 
          backdrop-blur-sm rounded-2xl shadow-lg 
          border-2 transition-all duration-300
          ${isSelected 
            ? 'border-amber-400 shadow-amber-400/25 shadow-xl' 
            : 'border-gray-200/50 hover:border-amber-200'
          }
          ${isDragging ? 'rotate-2' : ''}
        `}
        style={{
          backgroundColor: note.color,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-black/10">
          <div className="flex items-center space-x-2">
            {layoutMode === 'free' && <Move className="w-4 h-4 text-gray-400" />}
            <span className="text-xs text-gray-500 font-medium">
              {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-lg hover:bg-white/80"
                title="Alterar cor"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
              
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-8 right-0 bg-white rounded-xl p-2 shadow-xl border border-gray-200 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-4 gap-2">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onChangeColor(note.id, color);
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={`Mudar para ${color}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Expand/Collapse */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(note.id);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-lg hover:bg-white/80"
              title={note.isExpanded ? "Recolher" : "Expandir"}
            >
              {note.isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Actions */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTransformModal(note);
              }}
              className="p-1.5 text-amber-500 hover:text-amber-700 transition-colors bg-amber-50 rounded-lg hover:bg-amber-100"
              title="Transformar em ação"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                useTasksStore.setState({ editingNote: isEditing ? null : note.id });
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-lg hover:bg-white/80"
              title="Editar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveNote(note.id);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-lg hover:bg-white/80"
              title="Arquivar"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white/50 rounded-lg hover:bg-red-50"
              title="Deletar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              className="w-full bg-transparent border-none resize-none focus:outline-none font-serif text-gray-700 leading-relaxed"
              defaultValue={note.content}
              onBlur={(e) => updateNote(note.id, e.target.value)}
              onChange={handleTextareaChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                height: note.isExpanded ? '200px' : '120px',
                minHeight: '60px',
              }}
            />
          ) : (
            <div
              className="font-serif text-gray-700 leading-relaxed whitespace-pre-wrap overflow-hidden"
              style={{
                height: note.isExpanded ? 'auto' : '80px',
                maxHeight: note.isExpanded ? 'none' : '80px',
              }}
            >
              {note.content}
            </div>
          )}
        </div>

        {/* Resize handle para modo livre */}
        {isSelected && layoutMode === 'free' && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-amber-400/50 rounded-tl-lg cursor-se-resize" />
        )}

        {/* Feedback visual durante drag */}
        {isDragging && layoutMode === 'free' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
            x: {Math.round(displayPosition.x)}, y: {Math.round(displayPosition.y)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
