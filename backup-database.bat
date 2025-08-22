@echo off
echo ===========================================
echo    BACKUP DO BANCO DE DADOS POSTGRESQL
echo ===========================================
echo.

REM Configurações do banco de dados
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=banco_sentinela
set DB_USER=postgres
set DB_PASSWORD=20262595

REM Nome do arquivo de backup com timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%b-%%a)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_FILE=backup_banco_sentinela_%mydate%_%mytime%.sql

echo Criando backup da base de dados: %DB_NAME%
echo Arquivo de destino: %BACKUP_FILE%
echo.

REM Definir a senha como variável de ambiente para pg_dump
set PGPASSWORD=%DB_PASSWORD%

REM Executar o backup usando pg_dump
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --verbose --clean --create --if-exists --format=plain > %BACKUP_FILE%

if %errorlevel% equ 0 (
    echo.
    echo ✓ Backup criado com sucesso: %BACKUP_FILE%
    echo.
    echo Informações do arquivo:
    dir %BACKUP_FILE%
    echo.
    echo IMPORTANTE:
    echo - Este arquivo contém todos os dados, estrutura e índices
    echo - Mantenha-o em local seguro
    echo - Para restaurar, use o script restore-database.bat
) else (
    echo.
    echo ✗ Erro ao criar o backup!
    echo Verifique se:
    echo 1. PostgreSQL está instalado e funcionando
    echo 2. As credenciais estão corretas
    echo 3. O banco de dados existe
)

REM Limpar a variável de senha
set PGPASSWORD=

echo.
pause