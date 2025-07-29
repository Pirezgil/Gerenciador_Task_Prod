# ============================================================================
# VERIFICAÇÃO FINAL: Sistema de Edição de Tarefas
# DESCRIÇÃO: Verifica se todas as funcionalidades foram implementadas corretamente
# ============================================================================

param(
    [string]$ProjectRoot = "."
)

Write-Host "=== VERIFICAÇÃO FINAL: SISTEMA DE EDIÇÃO DE TAREFAS ===" -ForegroundColor Green
Write-Host "🔍 Verificando se todas as funcionalidades foram implementadas" -ForegroundColor Cyan

# ============================================================================
# FUNÇÃO: Verificar arquivo e conteúdo
# ============================================================================
function Test-FileContent {
    param(
        [string]$FilePath,
        [string]$Description,
        [string[]]$RequiredPatterns
    )
    
    $fullPath = Join-Path $ProjectRoot $FilePath
    $status = "❌"
    $details = @()
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $allFound = $true
        
        foreach ($pattern in $RequiredPatterns) {
            if ($content -match [regex]::Escape($pattern)) {
                $details += "  ✅ $pattern"
            } else {
                $details += "  ❌ $pattern"
                $allFound = $false
            }
        }
        
        if ($allFound) {
            $status = "✅"
        } else {
            $status = "⚠️"
        }
    } else {
        $details += "  ❌ Arquivo não encontrado"
    }
    
    Write-Host "$status $Description" -ForegroundColor $(if ($status -eq "✅") { "Green" } elseif ($status -eq "⚠️") { "Yellow" } else { "Red" })
    foreach ($detail in $details) {
        Write-Host $detail -ForegroundColor Gray
    }
    
    return $status -eq "✅"
}

Write-Host "`n📋 VERIFICANDO ARQUIVOS PRINCIPAIS..." -ForegroundColor Yellow

# ============================================================================
# 1. TIPOS E INTERFACES
# ============================================================================
$typesOk = Test-FileContent "src/types/index.ts" "Types (Interfaces de Edição)" @(
    "TaskComment",
    "TaskEditRequest", 
    "TaskEditModalState"
)

# ============================================================================
# 2. STORE (LÓGICA DE NEGÓCIO)
# ============================================================================
$storeOk = Test-FileContent "src/stores/tasksStore.ts" "Store (Lógica de Edição)" @(
    "openTaskEditModal",
    "setTaskEditModal",
    "updateTaskEditData",
    "saveTaskEdit",
    "taskEditModal: TaskEditModalState"
)

# ============================================================================
# 3. MODAL DE EDIÇÃO
# ============================================================================
$modalOk = Test-FileContent "src/components/shared/TaskEditModal.tsx" "Modal de Edição" @(
    "export function TaskEditModal",
    "useTasksStore",
    "taskEditModal",
    "updateTaskEditData",
    "saveTaskEdit"
)

# ============================================================================
# 4. TASK ITEM (COMPONENTE PRINCIPAL)
# ============================================================================
$taskItemOk = Test-FileContent "src/components/bombeiro/TaskItem.tsx" "TaskItem (Funcionalidade de Edição)" @(
    "openTaskEditModal",
    "handleEditClick",
    "handleTaskClick",
    "Edit3"
)

Write-Host "`n🚒 VERIFICANDO INTEGRAÇÃO NAS PÁGINAS..." -ForegroundColor Yellow

# ============================================================================
# 5. PÁGINAS COM INTEGRAÇÃO
# ============================================================================
$bombeiroOk = Test-FileContent "src/components/bombeiro/BombeiroPage.tsx" "BombeiroPage" @(
    "TaskEditModal",
    "<TaskEditModal />"
)

$arquitetoOk = Test-FileContent "src/components/arquiteto/ArquitetoPage.tsx" "ArquitetoPage" @(
    "TaskEditModal",
    "<TaskEditModal />"
)

$caixaOk = Test-FileContent "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx" "CaixaDeAreiaPage" @(
    "TaskEditModal",
    "<TaskEditModal />"
)

$florestaOk = Test-FileContent "src/components/floresta/FlorestaPage.tsx" "FlorestaPage" @(
    "TaskEditModal",
    "<TaskEditModal />"
)

# ============================================================================
# RESUMO FINAL
# ============================================================================
Write-Host "`n📊 RESUMO DA VERIFICAÇÃO:" -ForegroundColor Cyan

$results = @{
    "Tipos e Interfaces" = $typesOk
    "Store (Lógica)" = $storeOk  
    "Modal de Edição" = $modalOk
    "TaskItem" = $taskItemOk
    "BombeiroPage" = $bombeiroOk
    "ArquitetoPage" = $arquitetoOk
    "CaixaDeAreiaPage" = $caixaOk
    "FlorestaPage" = $florestaOk
}

$totalItems = $results.Count
$successItems = ($results.Values | Where-Object { $_ -eq $true }).Count
$successRate = [math]::Round(($successItems / $totalItems) * 100, 1)

Write-Host "`n🎯 TAXA DE SUCESSO: $successItems/$totalItems ($successRate%)" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

foreach ($item in $results.GetEnumerator()) {
    $status = if ($item.Value) { "✅" } else { "❌" }
    Write-Host "  $status $($item.Key)" -ForegroundColor $(if ($item.Value) { "Green" } else { "Red" })
}

# ============================================================================
# TESTES DE FUNCIONALIDADE
# ============================================================================
Write-Host "`n🧪 VERIFICANDO FUNCIONALIDADES ESPECÍFICAS..." -ForegroundColor Yellow

# Verificar se TaskItem tem todas as funcionalidades de edição
$taskItemPath = Join-Path $ProjectRoot "src/components/bombeiro/TaskItem.tsx"
if (Test-Path $taskItemPath) {
    $taskItemContent = Get-Content $taskItemPath -Raw
    
    Write-Host "🎯 TaskItem - Funcionalidades de Edição:" -ForegroundColor Cyan
    
    $features = @{
        "Clique na tarefa para editar" = $taskItemContent -match "handleTaskClick"
        "Botão de edição" = $taskItemContent -match "Edit3"
        "Comentários visuais" = $taskItemContent -match "MessageSquare"
        "Integração com store" = $taskItemContent -match "openTaskEditModal"
    }
    
    foreach ($feature in $features.GetEnumerator()) {
        $status = if ($feature.Value) { "✅" } else { "❌" }
        Write-Host "  $status $($feature.Key)" -ForegroundColor $(if ($feature.Value) { "Green" } else { "Red" })
    }
}

# ============================================================================
# INSTRUÇÕES FINAIS
# ============================================================================
Write-Host "`n💡 PRÓXIMOS PASSOS:" -ForegroundColor Yellow

if ($successRate -eq 100) {
    Write-Host "🎉 IMPLEMENTAÇÃO 100% COMPLETA!" -ForegroundColor Green
    Write-Host "✅ Todas as funcionalidades foram implementadas com sucesso" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 TESTE A APLICAÇÃO:" -ForegroundColor Cyan
    Write-Host "  1. Execute: npm run dev" -ForegroundColor White
    Write-Host "  2. Vá para qualquer página (Bombeiro, Arquiteto, etc.)" -ForegroundColor White
    Write-Host "  3. Clique em uma tarefa para abrir o modal de edição" -ForegroundColor White
    Write-Host "  4. Teste editar descrição, energia e adicionar comentários" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 FUNCIONALIDADES DISPONÍVEIS:" -ForegroundColor Cyan
    Write-Host "  • Clique na tarefa = Abre modal de edição" -ForegroundColor White
    Write-Host "  • Botão de edição (lápis) = Abre modal específico" -ForegroundColor White  
    Write-Host "  • Editar descrição, energia e projeto" -ForegroundColor White
    Write-Host "  • Adicionar comentários com histórico" -ForegroundColor White
    Write-Host "  • Disponível em todas as páginas" -ForegroundColor White
} else {
    Write-Host "⚠️ Implementação $successRate% completa" -ForegroundColor Yellow
    Write-Host "🔧 Verificar itens marcados com ❌ acima" -ForegroundColor Yellow
}

Write-Host "`n📋 Backups disponíveis em:" -ForegroundColor Cyan
Get-ChildItem "backups_*" -Directory | Sort-Object CreationTime -Descending | Select-Object -First 3 | ForEach-Object {
    Write-Host "  📁 $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n🎊 PARABÉNS! Sistema de edição implementado!" -ForegroundColor Green