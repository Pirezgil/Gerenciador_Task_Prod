# 🗄️ Guia de Backup e Restauração do Banco de Dados

Este documento explica como fazer backup e restaurar o banco de dados PostgreSQL do sistema Gerenciador de Tarefas.

## 📋 Arquivos Disponíveis

### Scripts Automáticos
- `backup-database.bat` - Script Windows para backup automático
- `backup-database.sh` - Script Linux/Mac para backup automático  
- `restore-database.bat` - Script Windows para restauração
- `restore-database.sh` - Script Linux/Mac para restauração

### Backup Manual
- `backup-manual.sql` - Comandos SQL para backup manual via cliente

## 🚀 Método 1: Backup Automático (Recomendado)

### Pré-requisitos
- PostgreSQL instalado e configurado no PATH
- Acesso ao banco de dados com as credenciais

### Windows
```bash
# Executar o backup
./backup-database.bat

# Restaurar (especificar arquivo de backup)
./restore-database.bat backup_banco_sentinela_20240820_1400.sql
```

### Linux/Mac
```bash
# Tornar executável
chmod +x backup-database.sh restore-database.sh

# Executar o backup
./backup-database.sh

# Restaurar (especificar arquivo de backup)
./restore-database.sh backup_banco_sentinela_20240820_1400.sql
```

## 🔧 Método 2: Backup Manual (Alternativa)

### Se o PostgreSQL não estiver no PATH

1. **Abra seu cliente PostgreSQL** (pgAdmin, DBeaver, etc.)

2. **Execute os comandos do arquivo `backup-manual.sql`** para exportar dados

3. **Para restaurar:**
   ```bash
   # No novo banco, primeiro crie as tabelas
   cd backend
   npx prisma migrate deploy
   
   # Depois importe os dados usando os comandos COPY FROM
   ```

## 📊 Método 3: Usar Prisma Studio (Desenvolvimento)

```bash
cd backend
npx prisma studio
```

Permite visualizar e exportar dados através da interface web.

## 🐳 Método 4: Backup via Docker (Se usando containers)

```bash
# Backup do container
docker exec postgres_container pg_dump -U postgres -d banco_sentinela > backup.sql

# Restaurar no novo container
docker exec -i new_postgres_container psql -U postgres -d novo_banco < backup.sql
```

## ⚠️ Importantes Considerações

### Segurança
- **NUNCA** commite arquivos de backup no Git
- Mantenha backups em local seguro
- As credenciais estão expostas nos scripts - ajuste conforme necessário

### Ordem de Restauração
Devido às chaves estrangeiras, importe na ordem:
1. `users`
2. `user_settings`, `projects`, `habits`
3. `tasks`, `notes`, `reminders`
4. Demais tabelas relacionadas

### Teste
- Sempre teste a restauração em ambiente de desenvolvimento
- Verifique a integridade dos dados após importação
- Confirme que todas as relações foram mantidas

## 🛠️ Solução de Problemas

### "pg_dump não reconhecido"
- Instale PostgreSQL client tools
- Adicione PostgreSQL ao PATH do sistema
- Use o método manual como alternativa

### Erro de permissões
- Verifique as credenciais do banco
- Confirme que o usuário tem permissões necessárias
- Teste conectividade com o banco

### Arquivo muito grande
- Use compressão: `pg_dump ... | gzip > backup.sql.gz`
- Considere backup incremental para grandes volumes

## 📱 Configuração para Novo Ambiente

Após restaurar o backup:

1. **Configure as variáveis de ambiente**
   ```env
   DATABASE_URL="postgresql://usuario:senha@host:porta/novo_banco"
   ```

2. **Execute migrações do Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Verifique a aplicação**
   ```bash
   npm run dev
   ```

## 🤝 Suporte

Em caso de problemas, verifique:
- Logs do PostgreSQL
- Conectividade de rede
- Versões compatíveis
- Espaço em disco suficiente