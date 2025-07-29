# ============================================================================
# SCRIPT: Implementacao_Limpar_Storage_Persistente.ps1
# DESCRIÇÃO: Força limpeza completa do storage persistente do Zustand
# PROBLEMA: Dados antigos ficam salvos no localStorage do navegador
# ============================================================================

param(
    [string]$ProjectPath = ""
)

Write-Host "=== LIMPEZA COMPLETA DO STORAGE PERSISTENTE ===" -ForegroundColor Green
Write-Host ""

# Auto-detectar a raiz do projeto
if ([string]::IsNullOrEmpty($ProjectPath)) {
    $currentDir = Get-Location
    
    # Se estamos em scripts/Melhorias, subir 2 níveis
    if ($currentDir.Path.EndsWith("scripts\Melhorias")) {
        $ProjectPath = Join-Path $currentDir "..\..\"
        Write-Host "Detectado execucao em scripts/Melhorias - usando projeto: $ProjectPath" -ForegroundColor Cyan
    }
    # Se estamos em scripts, subir 1 nível  
    elseif ($currentDir.Path.EndsWith("scripts")) {
        $ProjectPath = Join-Path $currentDir "..\"
        Write-Host "Detectado execucao em scripts - usando projeto: $ProjectPath" -ForegroundColor Cyan
    }
    # Caso contrário, usar diretório atual
    else {
        $ProjectPath = "."
        Write-Host "Usando diretorio atual como projeto: $ProjectPath" -ForegroundColor Cyan
    }
}

# Verificações iniciais
$tasksStorePath = Join-Path $ProjectPath "src\stores\tasksStore.ts"

Write-Host "Procurando arquivo em:" -ForegroundColor Yellow
Write-Host "  tasksStore: $tasksStorePath" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $tasksStorePath)) {
    Write-Host "Arquivo nao encontrado: $tasksStorePath" -ForegroundColor Red
    exit 1
}

# Criar backup obrigatório
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupTasksStore = "$tasksStorePath.backup_storage_$timestamp"

Copy-Item $tasksStorePath $backupTasksStore
Write-Host "Backup criado: $backupTasksStore" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# BLOCO 1: FORÇAR RESET DO STORAGE ALTERANDO A VERSÃO
# ============================================================================

Write-Host "FORCANDO RESET DO STORAGE..." -ForegroundColor Green

# Ler conteúdo atual
$currentContent = Get-Content $tasksStorePath -Raw

# Verificar versão atual
if ($currentContent -match "version: (\d+)") {
    $currentVersion = [int]$matches[1]
    $newVersion = $currentVersion + 1
    Write-Host "Versao atual: $currentVersion" -ForegroundColor Yellow
    Write-Host "Nova versao: $newVersion" -ForegroundColor Yellow
} else {
    $newVersion = 2
    Write-Host "Versao nao encontrada - definindo como: $newVersion" -ForegroundColor Yellow
}

# Substituir a versão para forçar reset
$newContent = $currentContent -replace "version: \d+", "version: $newVersion"

# Aplicar a mudança
$newContent | Set-Content $tasksStorePath -Encoding UTF8
Write-Host "Versao do storage atualizada para forcar reset!" -ForegroundColor Green

# ============================================================================
# BLOCO 2: CRIAR PÁGINA DE LIMPEZA DE CACHE (OPCIONAL)
# ============================================================================

Write-Host ""
Write-Host "CRIANDO PAGINA DE LIMPEZA DE CACHE..." -ForegroundColor Green

$cacheCleanerPath = Join-Path $ProjectPath "public\limpar-cache.html"

$cacheCleanerContent = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpeza de Cache - Gerenciador de Tarefas</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            margin-bottom: 30px;
            font-size: 2rem;
        }
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1rem;
            cursor: pointer;
            margin: 10px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .success {
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4caf50;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            display: none;
        }
        .instructions {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpeza de Cache</h1>
        <p>Para garantir que todos os dados antigos sejam removidos, execute as etapas abaixo:</p>
        
        <div class="instructions">
            <h3>Etapa 1: Limpeza Automática</h3>
            <p>Clique no botão abaixo para limpar o storage do navegador:</p>
            <button class="btn" onclick="clearStorage()">🗑️ Limpar Storage</button>
        </div>

        <div class="instructions">
            <h3>Etapa 2: Limpeza Manual (se necessário)</h3>
            <p>Se ainda aparecerem dados antigos:</p>
            <ol>
                <li>Pressione <strong>F12</strong> para abrir as Ferramentas do Desenvolvedor</li>
                <li>Vá para a aba <strong>Application</strong> (ou Aplicação)</li>
                <li>No menu lateral, clique em <strong>Local Storage</strong></li>
                <li>Selecione seu site e delete a chave <strong>cerebro-compativel-tasks</strong></li>
                <li>Recarregue a página com <strong>Ctrl+F5</strong></li>
            </ol>
        </div>

        <div class="instructions">
            <h3>Etapa 3: Verificação</h3>
            <p>Após a limpeza:</p>
            <a href="/" class="btn">🏠 Voltar ao App</a>
        </div>

        <div id="success" class="success">
            <h3>✅ Storage Limpo!</h3>
            <p>Agora recarregue a página principal do app para ver os dados zerados.</p>
        </div>
    </div>

    <script>
        function clearStorage() {
            try {
                // Limpar localStorage
                localStorage.removeItem('cerebro-compativel-tasks');
                
                // Limpar sessionStorage
                sessionStorage.clear();
                
                // Limpar cookies relacionados (se houver)
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Mostrar sucesso
                document.getElementById('success').style.display = 'block';
                
                console.log('Storage limpo com sucesso!');
                
                // Auto-redirect após 3 segundos
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
                
            } catch (error) {
                alert('Erro ao limpar storage: ' + error.message);
                console.error('Erro:', error);
            }
        }
        
        // Também limpar quando a página carregar
        window.addEventListener('load', function() {
            console.log('Página de limpeza carregada');
        });
    </script>
</body>
</html>
'@

# Criar arquivo de limpeza de cache
$cacheCleanerContent | Set-Content $cacheCleanerPath -Encoding UTF8
Write-Host "Pagina de limpeza criada em: public/limpar-cache.html" -ForegroundColor Green

# ============================================================================
# BLOCO 3: Validações e instruções
# ============================================================================

Write-Host ""
Write-Host "Executando validacoes..." -ForegroundColor Yellow

$newContent = Get-Content $tasksStorePath -Raw

$success = $true

# Validar se a versão foi alterada
if ($newContent -match "version: $newVersion") {
    Write-Host "Versao do storage atualizada com sucesso" -ForegroundColor Green
} else {
    Write-Host "ERRO: Versao do storage nao foi atualizada" -ForegroundColor Red
    $success = $false
}

# Validar se o arquivo de cache foi criado
if (Test-Path $cacheCleanerPath) {
    Write-Host "Pagina de limpeza criada com sucesso" -ForegroundColor Green
} else {
    Write-Host "ERRO: Pagina de limpeza nao foi criada" -ForegroundColor Red
    $success = $false
}

Write-Host ""
if ($success) {
    Write-Host "LIMPEZA CONFIGURADA COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPCAO 1 - AUTOMATICA (RECOMENDADA):" -ForegroundColor Yellow
    Write-Host "  1. Acesse: http://localhost:3000/limpar-cache.html" -ForegroundColor White
    Write-Host "  2. Clique em 'Limpar Storage'" -ForegroundColor White
    Write-Host "  3. Aguarde redirecionamento automatico" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCAO 2 - MANUAL (SE NECESSARIO):" -ForegroundColor Yellow
    Write-Host "  1. No navegador, pressione F12" -ForegroundColor White
    Write-Host "  2. Va para Application > Local Storage" -ForegroundColor White
    Write-Host "  3. Delete a chave 'cerebro-compativel-tasks'" -ForegroundColor White
    Write-Host "  4. Recarregue com Ctrl+F5" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCAO 3 - MAIS SIMPLES:" -ForegroundColor Yellow
    Write-Host "  1. Navegacao privada/incognito" -ForegroundColor White
    Write-Host "  2. Ou limpar dados do site nas configuracoes" -ForegroundColor White
    Write-Host ""
    Write-Host "Apos qualquer opcao, o app estara completamente limpo!" -ForegroundColor Green
} else {
    Write-Host "FALHA NA CONFIGURACAO - Restaurando backup" -ForegroundColor Red
    Copy-Item $backupTasksStore $tasksStorePath
    Write-Host "Backup restaurado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Backup salvo em:" -ForegroundColor Gray
Write-Host "  $backupTasksStore" -ForegroundColor Gray
Write-Host ""
Write-Host "=== FIM DA LIMPEZA ===" -ForegroundColor Green