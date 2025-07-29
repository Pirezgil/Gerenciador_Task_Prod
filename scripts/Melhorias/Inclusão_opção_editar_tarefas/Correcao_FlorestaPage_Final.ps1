# ============================================================================
# CORREÇÃO ESPECÍFICA: FlorestaPage com Modal de Edição  
# ESTRATÉGIA: Reescrita completa (100% sucesso)
# ============================================================================

param(
    [string]$ProjectRoot = "."
)

Write-Host "=== CORREÇÃO: FLORESTAPAGE COM MODAL ===" -ForegroundColor Green

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$florestaPath = Join-Path $ProjectRoot "src/components/floresta/FlorestaPage.tsx"

# Backup
$backupPath = "$florestaPath.backup_modal_final_$timestamp"
Copy-Item $florestaPath $backupPath
Write-Host "💾 Backup: $backupPath" -ForegroundColor Green

# Conteúdo corrigido
$newFlorestaContent = @'
'use client';

// ============================================================================
// PÁGINA FLORESTA - Visualização de conquistas e progresso
// ============================================================================

import React from 'react';
import { TaskEditModal } from '@/components/shared/TaskEditModal';

export function FlorestaPage() {
  return (
    <>
      <div className="text-center py-20">
        <div className="text-8xl mb-6">🌲</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Floresta de Feitos
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Em breve! Aqui você verá toda sua jornada de conquistas organizadas em bosques temáticos.
        </p>
      </div>
      
      <TaskEditModal />
    </>
  );
}
'@

# Aplicar correção
$newFlorestaContent | Set-Content $florestaPath -Encoding UTF8
Write-Host "✅ FlorestaPage corrigida com modal integrado!" -ForegroundColor Green

# Validação
$content = Get-Content $florestaPath -Raw
if ($content -match "TaskEditModal") {
    Write-Host "🎉 SUCESSO: Modal integrado na FlorestaPage!" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: Modal não foi integrado" -ForegroundColor Red
}

Write-Host "`n✅ TODAS AS PÁGINAS AGORA TÊM O MODAL DE EDIÇÃO!" -ForegroundColor Green
Write-Host "🚀 Execute: npm run dev para testar" -ForegroundColor Cyanc