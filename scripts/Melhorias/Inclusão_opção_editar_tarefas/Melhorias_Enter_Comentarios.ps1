# ============================================================================
# MELHORIAS: Enter Universal e Edição de Comentários
# DESCRIÇÃO: Implementa funcionalidades de UX aprimoradas
# ============================================================================

param(
    [string]$ProjectRoot = "."
)

Write-Host "=== MELHORIAS: ENTER UNIVERSAL E EDIÇÃO DE COMENTÁRIOS ===" -ForegroundColor Green
Write-Host "🎯 Implementando melhorias de UX solicitadas" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# ============================================================================
# BLOCO 1: Backup dos arquivos que serão modificados
# ============================================================================

Write-Host "`n💾 Criando backups..." -ForegroundColor Yellow

$filesToModify = @(
    "src/types/index.ts",
    "src/stores/tasksStore.ts", 
    "src/components/shared/TaskEditModal.tsx",
    "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx"
)

foreach ($file in $filesToModify) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        Copy-Item $fullPath "$fullPath.backup_improvements_$timestamp"
        Write-Host "✅ Backup: $file" -ForegroundColor Green
    }
}

# ============================================================================
# BLOCO 2: Atualizando Types para suportar edição de comentários
# ============================================================================

Write-Host "`n🔧 Atualizando tipos para edição de comentários..." -ForegroundColor Yellow

$typesPath = Join-Path $ProjectRoot "src/types/index.ts"
$typesContent = Get-Content $typesPath -Raw

# Adicionar novos tipos após TaskComment
$newTypes = @'
export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCommentEdit {
  commentId: string;
  taskId: string;
  newContent: string;
}

export interface TaskEditRequest {
  taskId: string;
  description?: string;
  energyPoints?: EnergyLevel;
  projectId?: string;
  comment?: string;
}
'@

# Substituir a definição de TaskComment existente
$typesContent = $typesContent -replace "export interface TaskComment \{[^}]*\}", $newTypes

$typesContent | Set-Content $typesPath -Encoding UTF8
Write-Host "✅ Tipos atualizados com suporte à edição de comentários" -ForegroundColor Green

# ============================================================================
# BLOCO 3: Atualizando Store com actions para comentários
# ============================================================================

Write-Host "`n🗄️ Adicionando actions de comentários na store..." -ForegroundColor Yellow

$storePath = Join-Path $ProjectRoot "src/stores/tasksStore.ts"
$storeContent = Get-Content $storePath -Raw

# Adicionar imports dos novos tipos
$storeContent = $storeContent -replace "TaskComment", "TaskComment,`n  TaskCommentEdit"

# Adicionar actions antes de "// Actions - Projetos"
$commentActions = @'
  
  // Actions - Comentários
  editTaskComment: (commentEdit: TaskCommentEdit) => void;
  deleteTaskComment: (taskId: string, commentId: string) => void;
'@

$storeContent = $storeContent -replace "  // Actions - Projetos", "$commentActions`n  // Actions - Projetos"

# Adicionar implementações antes de "// Actions - Projetos"
$commentImplementations = @'
      
      // Actions - Comentários
      editTaskComment: (commentEdit) => {
        const { commentId, taskId, newContent } = commentEdit;
        
        const updateTaskComments = (task: Task) => {
          if (task.id !== taskId) return task;
          
          return {
            ...task,
            comments: task.comments?.map(comment =>
              comment.id === commentId
                ? { ...comment, content: newContent, updatedAt: new Date().toISOString() }
                : comment
            ) || [],
            updatedAt: new Date().toISOString(),
          };
        };
        
        set(state => ({
          todayTasks: state.todayTasks.map(updateTaskComments),
          postponedTasks: state.postponedTasks.map(updateTaskComments),
          projects: state.projects.map(project => ({
            ...project,
            backlog: project.backlog.map(updateTaskComments),
          })),
        }));
      },
      
      deleteTaskComment: (taskId, commentId) => {
        const updateTaskComments = (task: Task) => {
          if (task.id !== taskId) return task;
          
          return {
            ...task,
            comments: task.comments?.filter(comment => comment.id !== commentId) || [],
            updatedAt: new Date().toISOString(),
          };
        };
        
        set(state => ({
          todayTasks: state.todayTasks.map(updateTaskComments),
          postponedTasks: state.postponedTasks.map(updateTaskComments),
          projects: state.projects.map(project => ({
            ...project,
            backlog: project.backlog.map(updateTaskComments),
          })),
        }));
      },
'@

$storeContent = $storeContent -replace "      // Actions - Projetos", "$commentImplementations`n      // Actions - Projetos"

$storeContent | Set-Content $storePath -Encoding UTF8
Write-Host "✅ Store atualizada com actions de comentários" -ForegroundColor Green

# ============================================================================
# BLOCO 4: Atualizando TaskEditModal com funcionalidades avançadas
# ============================================================================

Write-Host "`n🎨 Atualizando TaskEditModal com edição de comentários e Enter..." -ForegroundColor Yellow

$modalPath = Join-Path $ProjectRoot "src/components/shared/TaskEditModal.tsx"

$newModalContent = @'
'use client';

// ============================================================================
// TASK EDIT MODAL - Modal para edição de tarefas com funcionalidades avançadas
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Battery, Brain, Zap, MessageSquare, Save, X, Edit2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTasksStore } from '@/stores/tasksStore';
import type { EnergyLevel } from '@/types';

export function TaskEditModal() {
  const {
    taskEditModal,
    setTaskEditModal,
    updateTaskEditData,
    saveTaskEdit,
    editTaskComment,
    deleteTaskComment,
    projects,
  } = useTasksStore();

  const { isOpen, task, editData } = taskEditModal;
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleClose = () => {
    setTaskEditModal({
      isOpen: false,
      task: null,
      editData: {
        description: '',
        energyPoints: 3,
        projectId: undefined,
        comment: '',
      },
    });
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleSave = () => {
    if (!task) return;
    
    saveTaskEdit({
      taskId: task.id,
      description: editData.description,
      energyPoints: editData.energyPoints,
      projectId: editData.projectId,
      comment: editData.comment,
    });
    
    handleClose();
  };

  // Handler para Enter no comentário
  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editData.comment.trim()) {
        handleSave();
      }
    }
  };

  // Handler para Enter na descrição
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (editData.description.trim()) {
        handleSave();
      }
    }
  };

  // Iniciar edição de comentário
  const startEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditCommentText(content);
  };

  // Salvar edição de comentário
  const saveCommentEdit = () => {
    if (!task || !editingComment) return;
    
    editTaskComment({
      commentId: editingComment,
      taskId: task.id,
      newContent: editCommentText,
    });
    
    setEditingComment(null);
    setEditCommentText('');
  };

  // Handler para Enter na edição de comentário
  const handleEditCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editCommentText.trim()) {
        saveCommentEdit();
      }
    } else if (e.key === 'Escape') {
      setEditingComment(null);
      setEditCommentText('');
    }
  };

  // Cancelar edição
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  // Deletar comentário
  const handleDeleteComment = (commentId: string) => {
    if (!task) return;
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      deleteTaskComment(task.id, commentId);
    }
  };

  const energyOptions = [
    { value: 1, label: 'Bateria Fraca', icon: Battery, color: 'orange' },
    { value: 3, label: 'Cérebro Normal', icon: Brain, color: 'blue' },
    { value: 5, label: 'Cérebro Ligado', icon: Zap, color: 'purple' },
  ];

  if (!isOpen || !task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Tarefa"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Tarefa
            <span className="text-xs text-gray-500 ml-2">(Ctrl+Enter para salvar)</span>
          </label>
          <textarea
            value={editData.description}
            onChange={(e) => updateTaskEditData({ description: e.target.value })}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Descreva sua tarefa..."
            className="w-full h-20 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Nível de Energia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nível de Energia
          </label>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = editData.energyPoints === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateTaskEditData({ energyPoints: option.value as EnergyLevel })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    isSelected ? `text-${option.color}-600` : 'text-gray-400'
                  }`} />
                  <div className={`text-xs font-medium ${
                    isSelected ? `text-${option.color}-700` : 'text-gray-600'
                  }`}>
                    {option.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Projeto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projeto (Opcional)
          </label>
          <select
            value={editData.projectId || ''}
            onChange={(e) => updateTaskEditData({ projectId: e.target.value || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Nenhum projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.icon} {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Comentário
            <span className="text-xs text-gray-500 ml-2">(Enter para postar)</span>
          </label>
          <textarea
            value={editData.comment}
            onChange={(e) => updateTaskEditData({ comment: e.target.value })}
            onKeyDown={handleCommentKeyDown}
            placeholder="Adicione um comentário sobre esta tarefa..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Histórico de Comentários */}
        {task.comments && task.comments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Histórico de Comentários
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg group">
                  {editingComment === comment.id ? (
                    // Modo de edição
                    <div className="space-y-2">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        onKeyDown={handleEditCommentKeyDown}
                        className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEditComment}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveCommentEdit}
                          disabled={!editCommentText.trim()}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Salvar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter para salvar • Esc para cancelar
                      </p>
                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="ml-1 italic">(editado)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditComment(comment.id, comment.content)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar comentário"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editData.description.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
'@

$newModalContent | Set-Content $modalPath -Encoding UTF8
Write-Host "✅ TaskEditModal atualizado com edição de comentários e Enter" -ForegroundColor Green

# ============================================================================
# BLOCO 5: Atualizando CaixaDeAreiaPage com Enter para salvar
# ============================================================================

Write-Host "`n📦 Atualizando CaixaDeAreiaPage com Enter para salvar..." -ForegroundColor Yellow

$caixaPath = Join-Path $ProjectRoot "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx"

$newCaixaContent = @'
'use client';

// ============================================================================
// PÁGINA CAIXA DE AREIA - Espaço livre para pensamentos e ideias
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NoteItem } from './NoteItem';

export function CaixaDeAreiaPage() {
  const { notes, newNoteContent, saveNote } = useTasksStore();

  const activeNotes = notes.filter(note => note.status === 'active');

  // Handler para Enter na textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (newNoteContent.trim()) {
        saveNote(newNoteContent);
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mr-3">
              <span className="text-white text-lg">🏖️</span>
            </div>
            A Caixa de Areia
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Um espaço seguro para seus pensamentos. Aqui você pode escrever livremente, sem pressa ou pressão. Quando uma ideia estiver madura, transforme-a em uma ação ou projeto.
          </p>
        </div>

        {/* Editor de nova nota */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-amber-100/50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-serif flex items-center">
            ✍️ Novo pensamento
            <span className="text-xs text-gray-500 ml-3 font-normal">(Ctrl+Enter para salvar)</span>
          </h3>
          <textarea
            className="w-full h-36 p-4 border border-amber-200/50 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 font-serif text-gray-700 leading-relaxed bg-white/50 backdrop-blur-sm transition-all duration-300"
            placeholder="O que está passando pela sua mente hoje? Escreva livremente, sem se preocupar com estrutura ou forma... (Ctrl+Enter para salvar)"
            value={newNoteContent}
            onChange={(e) => useTasksStore.setState({ newNoteContent: e.target.value })}
            onKeyDown={handleTextareaKeyDown}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-amber-600 bg-amber-50/50 px-3 py-2 rounded-xl">
              💡 Dica: Use Ctrl+Enter para salvar rapidamente, ou clique no botão ao lado
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => saveNote(newNoteContent)}
              disabled={!newNoteContent.trim()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                newNoteContent.trim()
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Salvar na Caixa de Areia
            </motion.button>
          </div>
        </div>

        {/* Lista de notas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 font-serif flex items-center">
            <span className="text-xl mr-2">📖</span>
            Seus pensamentos salvos
          </h3>
          
          {activeNotes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}

          {activeNotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🕊️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 font-serif">
                Mente tranquila
              </h3>
              <p className="text-gray-600">
                Você ainda não tem pensamentos salvos aqui. <br />
                Que tal começar escrevendo algo que está na sua mente?
              </p>
            </div>
          )}
        </div>
      </div>

      <TaskEditModal />
    </>
  );
}
'@

$newCaixaContent | Set-Content $caixaPath -Encoding UTF8
Write-Host "✅ CaixaDeAreiaPage atualizada com Enter para salvar" -ForegroundColor Green

# ============================================================================
# VERIFICAÇÃO FINAL
# ============================================================================

Write-Host "`n🔍 Verificação final das melhorias..." -ForegroundColor Yellow

function Test-Improvement {
    param([string]$FilePath, [string]$Feature, [string]$SearchText)
    
    $fullPath = Join-Path $ProjectRoot $FilePath
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content.Contains($SearchText)) {
            Write-Host "  ✅ $Feature" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ $Feature" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ❌ $Feature - Arquivo não encontrado" -ForegroundColor Red
        return $false
    }
}

Write-Host "📋 Funcionalidades implementadas:" -ForegroundColor Cyan

$improvements = @(
    @{ File = "src/components/shared/TaskEditModal.tsx"; Feature = "Edição de comentários"; Text = "editTaskComment" },
    @{ File = "src/components/shared/TaskEditModal.tsx"; Feature = "Exclusão de comentários"; Text = "deleteTaskComment" },
    @{ File = "src/components/shared/TaskEditModal.tsx"; Feature = "Enter para comentários"; Text = "handleCommentKeyDown" },
    @{ File = "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx"; Feature = "Enter na caixa de areia"; Text = "handleTextareaKeyDown" },
    @{ File = "src/stores/tasksStore.ts"; Feature = "Actions de comentários"; Text = "editTaskComment:" }
)

$successCount = 0
foreach ($improvement in $improvements) {
    if (Test-Improvement $improvement.File $improvement.Feature $improvement.Text) {
        $successCount++
    }
}

$totalImprovements = $improvements.Count
$successRate = [math]::Round(($successCount / $totalImprovements) * 100, 1)

Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
Write-Host "🎯 Taxa de sucesso: $successCount/$totalImprovements ($successRate%)" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

if ($successRate -eq 100) {
    Write-Host "`n🎉 TODAS AS MELHORIAS IMPLEMENTADAS COM SUCESSO!" -ForegroundColor Green
    Write-Host "🚀 FUNCIONALIDADES ADICIONADAS:" -ForegroundColor Cyan
    Write-Host "  • ✏️ Editar comentários (botão de lápis)" -ForegroundColor White
    Write-Host "  • 🗑️ Excluir comentários (botão de lixeira)" -ForegroundColor White
    Write-Host "  • ⌨️ Enter para postar comentários no modal" -ForegroundColor White
    Write-Host "  • ⌨️ Ctrl+Enter para salvar na caixa de areia" -ForegroundColor White
    Write-Host "  • ⌨️ Ctrl+Enter para salvar descrição da tarefa" -ForegroundColor White
    Write-Host "  • 🎨 Visual melhorado com dicas de atalhos" -ForegroundColor White
    
    Write-Host "`n💡 COMO USAR:" -ForegroundColor Yellow
    Write-Host "  1. Modal de edição: Enter para postar comentário" -ForegroundColor White
    Write-Host "  2. Modal de edição: Ctrl+Enter para salvar descrição" -ForegroundColor White
    Write-Host "  3. Caixa de areia: Ctrl+Enter para salvar nota" -ForegroundColor White
    Write-Host "  4. Comentários: Hover sobre comentário → editar/excluir" -ForegroundColor White
    Write-Host "  5. Edição de comentário: Enter para salvar, Esc para cancelar" -ForegroundColor White
    
    Write-Host "`n🧪 TESTE AGORA:" -ForegroundColor Green
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host "  Teste as novas funcionalidades!" -ForegroundColor White
} else {
    Write-Host "`n⚠️ Algumas melhorias podem precisar de ajuste manual" -ForegroundColor Yellow
}

Write-Host "`n💾 Backups criados com sufixo: backup_improvements_$timestamp" -ForegroundColor Cyan
Write-Host "🎊 MELHORIAS CONCLUÍDAS!" -ForegroundColor Green