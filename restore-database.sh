#!/bin/bash

echo "==========================================="
echo "   RESTAURAR BANCO DE DADOS POSTGRESQL"
echo "==========================================="
echo

# Verificar se foi fornecido o arquivo de backup
if [ $# -eq 0 ]; then
    echo "Uso: ./restore-database.sh [arquivo_backup.sql]"
    echo
    echo "Exemplo: ./restore-database.sh backup_banco_sentinela_20240820_1400.sql"
    echo
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Arquivo de backup não encontrado: $BACKUP_FILE"
    echo
    exit 1
fi

# Solicitar configurações do banco de destino
echo "Configurações do banco de destino:"
read -p "Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Porta (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Nome do novo banco: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo "✗ Nome do banco é obrigatório!"
    exit 1
fi

read -p "Usuário (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Senha: " DB_PASSWORD
echo

echo
echo "Configurações:"
echo "Host: $DB_HOST"
echo "Porta: $DB_PORT"
echo "Banco: $DB_NAME"
echo "Usuário: $DB_USER"
echo "Arquivo: $BACKUP_FILE"
echo

read -p "Confirmar restauração? (s/N): " CONFIRM
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "Operação cancelada."
    exit 0
fi

# Definir a senha como variável de ambiente
export PGPASSWORD="$DB_PASSWORD"

echo
echo "Restaurando banco de dados..."
echo

# Executar a restauração
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo
    echo "✓ Restauração concluída com sucesso!"
    echo
    echo "O banco de dados foi restaurado em:"
    echo "Host: $DB_HOST:$DB_PORT"
    echo "Banco: $DB_NAME"
else
    echo
    echo "✗ Erro durante a restauração!"
    echo "Verifique os logs acima para mais detalhes."
fi

# Limpar a variável de senha
unset PGPASSWORD

echo
read -p "Pressione Enter para continuar..."