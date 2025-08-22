@echo off
echo ======================================
echo  DEPLOY DOCKER - GERENCIADOR DE TAREFAS
echo ======================================
echo.

echo [1/4] Verificando Docker Desktop...
docker --version
if %errorlevel% neq 0 (
    echo ERRO: Docker nao encontrado!
    pause
    exit /b 1
)

echo.
echo [2/4] Testando conexao com Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo.
echo [3/4] Construindo imagens Docker...
docker-compose -f docker-compose.local.yml --env-file .env.docker build

echo.
echo [4/4] Subindo containers...
docker-compose -f docker-compose.local.yml --env-file .env.docker up -d

echo.
echo ======================================
echo  DEPLOY CONCLUIDO!
echo ======================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Para ver logs: docker-compose -f docker-compose.local.yml logs -f
echo Para parar:   docker-compose -f docker-compose.local.yml down
echo.
pause