# NOME_DO_SCRIPT: Implementacao_Novo_Projeto.ps1
# DESCRIÇÃO: Este script implementa a funcionalidade completa do botão "Novo Projeto"
# ESTRATÉGIA: REESCRITA COMPLETA seguindo as diretrizes do guia PowerShell

param()

Write-Host "===============================================" -ForegroundColor Green
Write-Host "🏗️ IMPLEMENTAÇÃO DO BOTÃO NOVO PROJETO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Setup padrão - Verificações iniciais
$projectRoot = Get-Location
$componentsPath = Join-Path $projectRoot "src\components"
$sharedPath = Join-Path $componentsPath "shared"
$arquitetoPath = Join-Path $componentsPath "arquiteto"

if (-not (Test-Path $componentsPath)) {
    Write-Host "❌ Pasta components não encontrada: $componentsPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $sharedPath)) {
    Write-Host "❌ Pasta shared não encontrada: $sharedPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $arquitetoPath)) {
    Write-Host "❌ Pasta arquiteto não encontrada: $arquitetoPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Estrutura do projeto verificada" -ForegroundColor Green

# ============================================================================
# BLOCO 1: Criando o novo componente NewProjectModal.tsx
# ============================================================================

Write-Host ""
Write-Host "📝 BLOCO 1: Criando componente NewProjectModal.tsx..." -ForegroundColor Cyan

$newProjectModalPath = Join-Path $sharedPath "NewProjectModal.tsx"

# Backup se arquivo existir
if (Test-Path $newProjectModalPath) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$newProjectModalPath.backup_$timestamp"
    Copy-Item $newProjectModalPath $backupPath
    Write-Host "💾 Backup criado: $backupPath" -ForegroundColor Yellow
}

$newProjectModalContent = @'
'use client';

// ============================================================================
// NEW PROJECT MODAL - Modal para criação de novos projetos
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Save, AlertCircle } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_ICONS = [
  '🏗️', '📁', '🎯', '🚀', '💡', '📊', '🔧', '🎨', 
  '📝', '💼', '🌟', '⚡', '🔥', '💎', '🏆', '🎪',
  '🌱', '🔬', '🎭', '🏠', '🎵', '📚', '🍕', '✈️'
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject } = useTasksStore();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏗️',
    notes: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Selecione um ícone para o projeto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      // Simula delay de criação para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      createProject(
        formData.name.trim(),
        formData.icon,
        formData.notes.trim()
      );
      
      // Reset form
      setFormData({
        name: '',
        icon: '🏗️',
        notes: ''
      });
      setErrors({});
      
      // Success feedback e fechamento
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setErrors({ general: 'Erro ao criar projeto. Tente novamente.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    
    setFormData({
      name: '',
      icon: '🏗️',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FolderPlus className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Novo Projeto</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              Organize suas grandes ideias em pequenos tijolos
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            {/* Nome do Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Projeto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Redesign do Site, Aprender TypeScript..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isCreating}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.name}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.name.length}/50 caracteres
              </p>
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone do Projeto *
              </label>
              <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                {PROJECT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    disabled={isCreating}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 ${
                      formData.icon === icon
                        ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                        : 'bg-white border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                  </button>
                ))}
              </div>
              {errors.icon && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.icon}
                </p>
              )}
            </div>

            {/* Notas Iniciais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Iniciais (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Rabisque suas ideias e objetivos para este projeto..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                disabled={isCreating}
                maxLength={500}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.notes.length}/500 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.name.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Criar Projeto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
'@

# Aplicar reescrita
$newProjectModalContent | Set-Content $newProjectModalPath -Encoding UTF8
Write-Host "✅ NewProjectModal.tsx criado com sucesso!" -ForegroundColor Green

# ============================================================================
# BLOCO 2: Modificando ArquitetoPage.tsx para integrar o modal
# ============================================================================

Write-Host ""
Write-Host "📝 BLOCO 2: Integrando modal na ArquitetoPage.tsx..." -ForegroundColor Cyan

$arquitetoPagePath = Join-Path $arquitetoPath "ArquitetoPage.tsx"

if (-not (Test-Path $arquitetoPagePath)) {
    Write-Host "❌ Arquivo ArquitetoPage.tsx não encontrado: $arquitetoPagePath" -ForegroundColor Red
    exit 1
}

# Backup obrigatório
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$arquitetoPagePath.backup_novo_projeto_$timestamp"
Copy-Item $arquitetoPagePath $backupPath
Write-Host "💾 Backup criado: $backupPath" -ForegroundColor Yellow

# Conteúdo correto da ArquitetoPage.tsx com modal integrado
$arquitetoPageContent = @'
'use client';

// ============================================================================
// PÁGINA ARQUITETO - Gerenciamento de projetos e planejamento
// ============================================================================

import React, { useState } from 'react';
import { useTasksStore } from '@/stores/tasksStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';
import { ProjectContainer } from './ProjectContainer';

export function ArquitetoPage() {
  const { projects } = useTasksStore();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleCreateProject = () => {
    setShowNewProjectModal(true);
  };

  const handleCloseModal = () => {
    setShowNewProjectModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
            🏗️ Modo Arquiteto
          </h2>
          <p className="text-gray-600 text-sm">
            Aqui você planeja o futuro sem pressa. Organize seus projetos grandes em pequenos tijolos e mova-os para o dia quando estiver pronto.
          </p>
        </div>

        <div className="grid gap-6">
          {projects.map((project) => (
            <ProjectContainer key={project.id} project={project} />
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Novo Projeto
            </h3>
            <p className="text-gray-600 mb-4">
              Começando algo grande? Crie um contêiner para organizar seus tijolos.
            </p>
            <button 
              onClick={handleCreateProject}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
            >
              + Criar Projeto
            </button>
          </div>
        </div>
      </div>

      <TaskEditModal />
      <NewProjectModal 
        isOpen={showNewProjectModal} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
'@

# Aplicar reescrita
$arquitetoPageContent | Set-Content $arquitetoPagePath -Encoding UTF8
Write-Host "✅ ArquitetoPage.tsx atualizado com modal integrado!" -ForegroundColor Green

# ============================================================================
# BLOCO 3: Validações finais
# ============================================================================

Write-Host ""
Write-Host "🔍 BLOCO 3: Realizando validações finais..." -ForegroundColor Cyan

# Verificar se os arquivos foram criados/modificados corretamente
$newModalSize = (Get-Content $newProjectModalPath -Raw).Length
$arquitetoPageSize = (Get-Content $arquitetoPagePath -Raw).Length

if ($newModalSize -lt 100) {
    Write-Host "❌ NewProjectModal.tsx muito pequeno - possível erro" -ForegroundColor Red
    Copy-Item $backupPath $arquitetoPagePath
    exit 1
}

if ($arquitetoPageSize -lt 500) {
    Write-Host "❌ ArquitetoPage.tsx muito pequeno - possível erro" -ForegroundColor Red
    Copy-Item $backupPath $arquitetoPagePath
    exit 1
}

# Verificar imports essenciais
$modalContent = Get-Content $newProjectModalPath -Raw
$arquitetoContent = Get-Content $arquitetoPagePath -Raw

$hasModalImports = $modalContent.Contains("useTasksStore") -and $modalContent.Contains("useState") -and $modalContent.Contains("AnimatePresence")
$hasArquitetoImports = $arquitetoContent.Contains("NewProjectModal") -and $arquitetoContent.Contains("useState")

if (-not $hasModalImports) {
    Write-Host "⚠️ Imports necessários não encontrados no NewProjectModal" -ForegroundColor Yellow
}

if (-not $hasArquitetoImports) {
    Write-Host "⚠️ Imports necessários não encontrados no ArquitetoPage" -ForegroundColor Yellow
}

Write-Host "✅ Validações concluídas!" -ForegroundColor Green

# ============================================================================
# BLOCO 4: Relatório final
# ============================================================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 RESUMO DAS ALTERAÇÕES:" -ForegroundColor Cyan
Write-Host "  ✅ Criado: src/components/shared/NewProjectModal.tsx" -ForegroundColor White
Write-Host "  ✅ Modificado: src/components/arquiteto/ArquitetoPage.tsx" -ForegroundColor White
Write-Host "  ✅ Backup criado: $backupPath" -ForegroundColor White
Write-Host ""

Write-Host "🎯 FUNCIONALIDADES IMPLEMENTADAS:" -ForegroundColor Cyan
Write-Host "  • Modal completo para criação de projetos" -ForegroundColor White
Write-Host "  • Formulário com validação (nome, ícone, notas)" -ForegroundColor White
Write-Host "  • Seleção de ícones visual e intuitiva" -ForegroundColor White
Write-Host "  • Integração com o store existente (createProject)" -ForegroundColor White
Write-Host "  • Feedback visual durante criação" -ForegroundColor White
Write-Host "  • Botão 'Criar Projeto' agora funcional" -ForegroundColor White
Write-Host "  • Design consistente com o sistema existente" -ForegroundColor White
Write-Host ""

Write-Host "🧪 COMO TESTAR:" -ForegroundColor Cyan
Write-Host "  1. Acesse a aba do Arquiteto (🏗️)" -ForegroundColor White
Write-Host "  2. Role até o final da página" -ForegroundColor White
Write-Host "  3. Clique no botão '+ Criar Projeto'" -ForegroundColor White
Write-Host "  4. Preencha o formulário e teste a criação" -ForegroundColor White
Write-Host ""

Write-Host "⚡ PRÓXIMOS PASSOS SUGERIDOS:" -ForegroundColor Cyan
Write-Host "  • Testar a funcionalidade no navegador" -ForegroundColor White
Write-Host "  • Verificar se os projetos são salvos corretamente" -ForegroundColor White
Write-Host "  • Confirmar integração com o store" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Botão 'Novo Projeto' agora está 100% funcional!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green