@echo off
echo ===========================================
echo   RESTAURAR BANCO DE DADOS POSTGRESQL
echo ===========================================
echo.

REM Verificar se foi fornecido o arquivo de backup
if "%~1"=="" (
    echo Uso: restore-database.bat [arquivo_backup.sql]
    echo.
    echo Exemplo: restore-database.bat backup_banco_sentinela_20240820_1400.sql
    echo.
    pause
    exit /b 1
)

set BACKUP_FILE=%~1

REM Verificar se o arquivo existe
if not exist "%BACKUP_FILE%" (
    echo ✗ Arquivo de backup não encontrado: %BACKUP_FILE%
    echo.
    pause
    exit /b 1
)

REM Configurações do banco de dados de destino
set /p DB_HOST="Digite o host do banco (default: localhost): " || set DB_HOST=localhost
set /p DB_PORT="Digite a porta (default: 5432): " || set DB_PORT=5432
set /p DB_NAME="Digite o nome do novo banco: "
set /p DB_USER="Digite o usuário (default: postgres): " || set DB_USER=postgres
set /p DB_PASSWORD="Digite a senha: "

if "%DB_NAME%"=="" (
    echo ✗ Nome do banco é obrigatório!
    pause
    exit /b 1
)

echo.
echo Configurações:
echo Host: %DB_HOST%
echo Porta: %DB_PORT%
echo Banco: %DB_NAME%
echo Usuário: %DB_USER%
echo Arquivo: %BACKUP_FILE%
echo.
set /p CONFIRM="Confirmar restauração? (s/N): "
if /i not "%CONFIRM%"=="s" (
    echo Operação cancelada.
    pause
    exit /b 0
)

REM Definir a senha como variável de ambiente
set PGPASSWORD=%DB_PASSWORD%

echo.
echo Restaurando banco de dados...
echo.

REM Executar a restauração
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres < %BACKUP_FILE%

if %errorlevel% equ 0 (
    echo.
    echo ✓ Restauração concluída com sucesso!
    echo.
    echo O banco de dados foi restaurado em:
    echo Host: %DB_HOST%:%DB_PORT%
    echo Banco: %DB_NAME%
) else (
    echo.
    echo ✗ Erro durante a restauração!
    echo Verifique os logs acima para mais detalhes.
)

REM Limpar a variável de senha
set PGPASSWORD=

echo.
pause