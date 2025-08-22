#!/bin/bash

echo "==========================================="
echo "    BACKUP DO BANCO DE DADOS POSTGRESQL"
echo "==========================================="
echo

# Configurações do banco de dados
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="banco_sentinela"
DB_USER="postgres"
DB_PASSWORD="20262595"

# Nome do arquivo de backup com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_banco_sentinela_${TIMESTAMP}.sql"

echo "Criando backup da base de dados: $DB_NAME"
echo "Arquivo de destino: $BACKUP_FILE"
echo

# Definir a senha como variável de ambiente para pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Executar o backup usando pg_dump
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --create --if-exists --format=plain > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo
    echo "✓ Backup criado com sucesso: $BACKUP_FILE"
    echo
    echo "Informações do arquivo:"
    ls -lh "$BACKUP_FILE"
    echo
    echo "IMPORTANTE:"
    echo "- Este arquivo contém todos os dados, estrutura e índices"
    echo "- Mantenha-o em local seguro"
    echo "- Para restaurar, use o script restore-database.sh"
else
    echo
    echo "✗ Erro ao criar o backup!"
    echo "Verifique se:"
    echo "1. PostgreSQL está instalado e funcionando"
    echo "2. As credenciais estão corretas"
    echo "3. O banco de dados existe"
fi

# Limpar a variável de senha
unset PGPASSWORD

echo
read -p "Pressione Enter para continuar..."