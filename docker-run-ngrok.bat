@echo off
echo ======================================
echo  DEPLOY NGROK - GERENCIADOR DE TAREFAS
echo ======================================
echo.

echo [1/5] Verificando Docker Desktop...
docker --version
if %errorlevel% neq 0 (
    echo ERRO: Docker nao encontrado!
    pause
    exit /b 1
)

echo.
echo [2/5] Testando conexao com Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo.
echo [3/5] Parando containers locais (se existirem)...
docker-compose -f docker-compose.local.yml down >nul 2>&1

echo.
echo [4/5] Construindo imagens Docker para ngrok...
docker-compose -f docker-compose.ngrok.yml --env-file .env.ngrok build

echo.
echo [5/5] Subindo containers para ngrok...
docker-compose -f docker-compose.ngrok.yml --env-file .env.ngrok up -d

echo.
echo ======================================
echo  DEPLOY NGROK CONCLUIDO!
echo ======================================
echo.
echo Local:    http://localhost
echo Ngrok:    https://antelope-leading-deeply.ngrok-free.app
echo.
echo IMPORTANTE: Execute o comando do ngrok em outro terminal:
echo ngrok http --url=antelope-leading-deeply.ngrok-free.app 80
echo.
echo Para ver logs: docker-compose -f docker-compose.ngrok.yml logs -f
echo Para parar:   docker-compose -f docker-compose.ngrok.yml down
echo.
pause