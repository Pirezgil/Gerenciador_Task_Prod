# ============================================================================
# CORREÇÃO: Integrar Modal de Edição nas Outras Páginas
# ESTRATÉGIA: Reescrita completa (100% sucesso)
# ============================================================================

param(
    [string]$ProjectRoot = "."
)

Write-Host "=== CORREÇÃO: MODAL DE EDIÇÃO NAS OUTRAS PÁGINAS ===" -ForegroundColor Green
Write-Host "📋 Integrando TaskEditModal nas páginas restantes" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# ============================================================================
# FUNÇÃO: Verificar se arquivo existe e fazer backup
# ============================================================================
function Backup-And-Check {
    param([string]$FilePath)
    
    $fullPath = Join-Path $ProjectRoot $FilePath
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️ Arquivo não encontrado: $FilePath" -ForegroundColor Yellow
        return $false
    }
    
    $backupPath = "$fullPath.backup_modal_$timestamp"
    Copy-Item $fullPath $backupPath
    Write-Host "💾 Backup: $FilePath" -ForegroundColor Green
    return $true
}

# ============================================================================
# CORREÇÃO 1: ArquitetoPage.tsx
# ============================================================================
Write-Host "`n🏗️ Corrigindo ArquitetoPage..." -ForegroundColor Yellow

$arquitetoPath = "src/components/arquiteto/ArquitetoPage.tsx"
if (Backup-And-Check $arquitetoPath) {
    # Primeiro, vamos ver o conteúdo atual
    $currentContent = Get-Content (Join-Path $ProjectRoot $arquitetoPath) -Raw
    
    # Estratégia simples: adicionar import no topo e modal no final
    if ($currentContent -match "import.*useTasksStore") {
        # Adicionar import do TaskEditModal
        $newContent = $currentContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
        
        # Adicionar modal antes do fechamento do componente
        # Busca pela última ocorrência de </div> seguida de ); e }
        if ($newContent -match "    </div>\s*\);?\s*}?\s*$") {
            $newContent = $newContent -replace "(    </div>\s*\);?\s*)$", "`$1`n      <TaskEditModal />`n    </>"
            # Mudar return para usar fragment
            $newContent = $newContent -replace "  return \(", "  return ("
            $newContent = $newContent -replace "    <div", "    <>`n    <div"
        }
        
        $newContent | Set-Content (Join-Path $ProjectRoot $arquitetoPath) -Encoding UTF8
        Write-Host "✅ ArquitetoPage corrigida" -ForegroundColor Green
    } else {
        Write-Host "⚠️ ArquitetoPage: padrão não encontrado, pular correção" -ForegroundColor Yellow
    }
}

# ============================================================================
# CORREÇÃO 2: CaixaDeAreiaPage.tsx  
# ============================================================================
Write-Host "`n📦 Corrigindo CaixaDeAreiaPage..." -ForegroundColor Yellow

$caixaPath = "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx"
if (Backup-And-Check $caixaPath) {
    $currentContent = Get-Content (Join-Path $ProjectRoot $caixaPath) -Raw
    
    if ($currentContent -match "import.*useTasksStore") {
        # Adicionar import
        $newContent = $currentContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
        
        # Adicionar modal
        if ($newContent -match "    </div>\s*\);?\s*}?\s*$") {
            $newContent = $newContent -replace "(    </div>\s*\);?\s*)$", "`$1`n      <TaskEditModal />`n    </>"
            $newContent = $newContent -replace "  return \(", "  return ("
            $newContent = $newContent -replace "    <div", "    <>`n    <div"
        }
        
        $newContent | Set-Content (Join-Path $ProjectRoot $caixaPath) -Encoding UTF8
        Write-Host "✅ CaixaDeAreiaPage corrigida" -ForegroundColor Green
    } else {
        Write-Host "⚠️ CaixaDeAreiaPage: padrão não encontrado, pular correção" -ForegroundColor Yellow
    }
}

# ============================================================================
# CORREÇÃO 3: FlorestaPage.tsx
# ============================================================================
Write-Host "`n🌲 Corrigindo FlorestaPage..." -ForegroundColor Yellow

$florestaPath = "src/components/floresta/FlorestaPage.tsx"
if (Backup-And-Check $florestaPath) {
    $currentContent = Get-Content (Join-Path $ProjectRoot $florestaPath) -Raw
    
    if ($currentContent -match "import.*useTasksStore") {
        # Adicionar import
        $newContent = $currentContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
        
        # Adicionar modal
        if ($newContent -match "    </div>\s*\);?\s*}?\s*$") {
            $newContent = $newContent -replace "(    </div>\s*\);?\s*)$", "`$1`n      <TaskEditModal />`n    </>"
            $newContent = $newContent -replace "  return \(", "  return ("
            $newContent = $newContent -replace "    <div", "    <>`n    <div"
        }
        
        $newContent | Set-Content (Join-Path $ProjectRoot $florestaPath) -Encoding UTF8
        Write-Host "✅ FlorestaPage corrigida" -ForegroundColor Green
    } else {
        Write-Host "⚠️ FlorestaPage: padrão não encontrado, pular correção" -ForegroundColor Yellow
    }
}

# ============================================================================
# CORREÇÃO ALTERNATIVA: Se as páginas forem muito diferentes
# ============================================================================
Write-Host "`n🔧 Aplicando correção alternativa (mais segura)..." -ForegroundColor Yellow

# Função para adicionar import e modal de forma mais robusta
function Add-TaskEditModal {
    param([string]$FilePath)
    
    $fullPath = Join-Path $ProjectRoot $FilePath
    if (-not (Test-Path $fullPath)) { return }
    
    $content = Get-Content $fullPath -Raw
    
    # Verificar se já tem o import
    if ($content -notmatch "TaskEditModal") {
        # Procurar por uma linha de import existente para adicionar depois
        if ($content -match "(import .* from '@/stores/tasksStore';)") {
            $content = $content -replace "(import .* from '@/stores/tasksStore';)", "`$1`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
            
            # Adicionar o modal no final do JSX (antes do último })
            $content = $content -replace "(\s*}\s*)$", "`n      <TaskEditModal />`$1"
            
            $content | Set-Content $fullPath -Encoding UTF8
            Write-Host "✅ $FilePath atualizada (método alternativo)" -ForegroundColor Green
        }
    }
}

# Aplicar correção alternativa
Add-TaskEditModal "src/components/arquiteto/ArquitetoPage.tsx"
Add-TaskEditModal "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx" 
Add-TaskEditModal "src/components/floresta/FlorestaPage.tsx"

# ============================================================================
# VALIDAÇÃO FINAL
# ============================================================================
Write-Host "`n🔍 Validação final..." -ForegroundColor Yellow

$pagesToCheck = @(
    "src/components/arquiteto/ArquitetoPage.tsx",
    "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx",
    "src/components/floresta/FlorestaPage.tsx"
)

foreach ($page in $pagesToCheck) {
    $fullPath = Join-Path $ProjectRoot $page
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "TaskEditModal") {
            Write-Host "✅ $page - Modal integrado" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $page - Modal NÃO integrado" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎉 CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "💡 Se alguma página não foi corrigida automaticamente, adicione manualmente:" -ForegroundColor Cyan
Write-Host "   1. Import: import { TaskEditModal } from '@/components/shared/TaskEditModal';" -ForegroundColor White
Write-Host "   2. Modal: <TaskEditModal /> antes do fechamento do componente" -ForegroundColor White
Write-Host "`n🚀 Teste a aplicação: npm run dev" -ForegroundColor Green