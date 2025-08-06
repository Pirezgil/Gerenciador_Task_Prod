# Sistema de Exclusão Lógica (Soft Delete)

Este documento descreve o sistema de exclusão lógica implementado para tarefas no Gerenciador de Tarefas.

## 📋 Visão Geral

O sistema implementa **exclusão lógica** (soft delete) ao invés de exclusão física (hard delete) para tarefas. Isso significa que:

- ✅ Tarefas "excluídas" são apenas marcadas como excluídas no banco
- ✅ Dados são preservados por 360 dias para recuperação
- ✅ Usuários não vêem mais as tarefas excluídas
- ✅ Administradores podem acessar dados excluídos se necessário
- ✅ Limpeza automática após 360 dias

## 🗄️ Estrutura do Banco de Dados

### Novos Campos na Tabela `tasks`

```sql
ALTER TABLE tasks ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP NULL;
```

- `isDeleted`: Flag booleana indicando se a tarefa foi excluída
- `deletedAt`: Timestamp de quando a tarefa foi excluída

## 🔧 Implementação Backend

### Service Layer (`taskService.ts`)

Todas as queries agora incluem filtro `isDeleted: false`:

```typescript
// Buscar tarefas ativas
const whereClause = { 
  userId,
  isDeleted: false // Filtrar tarefas excluídas
};

// Exclusão lógica
export const deleteTask = async (taskId: string, userId: string) => {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      history: {
        create: {
          action: 'deleted',
          details: {
            deletedAt: new Date().toISOString(),
            deletedBy: userId,
            oldValue: task.status,
            newValue: 'deleted'
          }
        }
      }
    }
  });
};
```

### Cleanup Service (`cleanupService.ts`)

Sistema de limpeza automática:

```typescript
// Remove tarefas excluídas há mais de 360 dias
export const cleanupDeletedTasks = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 360);

  await prisma.task.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: { lte: cutoffDate }
    }
  });
};
```

## 🎨 Frontend

### Botão de Exclusão

Na página `/tarefas`, foi adicionado:

- 🗑️ Ícone de lixeira com tooltip "Excluir"
- ⚠️ Modal de confirmação antes da exclusão
- 🔴 Estilo vermelho para indicar ação destrutiva

### Comportamento

1. **Clique no botão**: Exibe confirmação
2. **Confirmação**: Envia requisição DELETE para API
3. **Sucesso**: Tarefa desaparece da interface
4. **Erro**: Exibe mensagem de erro

## 📊 Monitoramento

### Estatísticas de Tarefas Excluídas

```typescript
const stats = await getDeletedTasksStats();
// Retorna:
// - Total de tarefas excluídas
// - Tarefas elegíveis para limpeza
// - Estatísticas por usuário
```

### Logs de Auditoria

- Todas as exclusões são registradas no histórico da tarefa
- Timestamp preciso da exclusão
- ID do usuário que excluiu
- Motivo da exclusão (se fornecido)

## 🔄 Job de Limpeza Automática

### Configuração Recomendada

```typescript
// Executar diariamente às 02:00
import { cleanupDeletedTasks } from './services/cleanupService';

// Cron job ou scheduler
schedule.scheduleJob('0 2 * * *', async () => {
  console.log('🧹 Iniciando limpeza de tarefas antigas...');
  await cleanupDeletedTasks();
});
```

### Política de Retenção

- **360 dias**: Período de retenção para tarefas excluídas
- **Limpeza automática**: Executada diariamente
- **Log completo**: Todas as operações são logadas

## 🔐 Acesso Administrativo

### Para Acessar Tarefas Excluídas

Apenas administradores com acesso direto ao banco de dados podem:

```sql
-- Ver todas as tarefas excluídas
SELECT * FROM tasks WHERE is_deleted = TRUE;

-- Ver tarefas excluídas de um usuário específico
SELECT * FROM tasks 
WHERE is_deleted = TRUE 
AND user_id = 'user_id_here';

-- Ver tarefas próximas da limpeza automática
SELECT * FROM tasks 
WHERE is_deleted = TRUE 
AND deleted_at < NOW() - INTERVAL '350 days';
```

## 🚨 Considerações Importantes

### Segurança

- ✅ Usuários não podem acessar tarefas excluídas via API
- ✅ Filtros automáticos em todas as queries
- ✅ Histórico completo de exclusões
- ✅ Limpeza automática impede acúmulo desnecessário

### Performance

- ✅ Índices em `isDeleted` e `deletedAt` para queries eficientes
- ✅ Limpeza periódica mantém banco otimizado
- ✅ Filtros aplicados automaticamente

### Conformidade

- ✅ LGPD: Dados são removidos após 360 dias
- ✅ Auditoria: Histórico completo de exclusões
- ✅ Recuperação: Possível dentro do período de retenção

## 📝 Exemplo de Uso

```typescript
// Frontend - Excluir tarefa
const handleDeleteTask = async (taskId: string, description: string) => {
  const confirmed = confirm(`Excluir "${description}"?`);
  if (confirmed) {
    await deleteTask.mutateAsync(taskId);
    // Tarefa desaparece da interface
  }
};

// Backend - Tarefa marcada como excluída
// Usuário não consegue mais acessá-la
// Admin pode ver no banco por 360 dias
// Após 360 dias: removida permanentemente
```

---

**Implementado em**: Janeiro 2025  
**Período de retenção**: 360 dias  
**Limpeza automática**: Diária às 02:00  
**Status**: ✅ Ativo