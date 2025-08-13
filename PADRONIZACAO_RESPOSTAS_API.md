# Sistema de Padronização de Respostas da API

Este documento descreve o novo sistema unificado de gerenciamento de erros e padronização de respostas implementado na API.

## 📋 Visão Geral

O sistema de padronização foi implementado para:
- ✅ **Uniformizar** todas as respostas da API
- ✅ **Facilitar** o tratamento de erros no frontend
- ✅ **Melhorar** a experiência do desenvolvedor
- ✅ **Preparar** integração com sistema de notificações
- ✅ **Manter** compatibilidade com código existente

## 🏗️ Arquitetura

### Componentes Principais

1. **`/src/lib/errors.ts`** - Sistema centralizado de erros
2. **`/src/middleware/errorHandler.ts`** - Error handler melhorado
3. **`/src/lib/validation.ts`** - Validação padronizada

### Interface de Resposta Padrão

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    context?: string;
    details?: any;
  };
  meta?: Record<string, any>;
  timestamp: string;
}
```

## 🚀 Como Usar

### 1. Respostas de Sucesso

```typescript
import { createSuccessResponse } from '../lib/errors';

// Resposta simples
const response = createSuccessResponse(data, 'Operação realizada com sucesso');
res.json(response);

// Com metadados
const response = createSuccessResponse(
  tasks,
  undefined,
  { total: tasks.length, page: 1 }
);
res.json(response);
```

### 2. Tratamento de Erros

```typescript
import { throwAppError, ErrorCode, assertResourceExists } from '../lib/errors';

// Lançar erro específico
if (!user) {
  throwAppError(ErrorCode.AUTH_REQUIRED, 'Token de acesso necessário');
}

// Validar existência de recurso
const task = await taskService.getTaskById(id, userId);
assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'get_task');

// Validar ownership
assertUserOwnership(task.userId, req.userId, ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS);
```

### 3. Controller Padronizado

```typescript
export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      throwAppError(ErrorCode.AUTH_REQUIRED);
    }

    // Buscar recurso
    const task = await taskService.getTaskById(req.params.id, req.userId);
    assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'get_task');

    // Resposta padronizada
    const response = createSuccessResponse(task);
    res.json(response);
  } catch (error) {
    // Delegar para error handler
    next(error);
  }
};
```

## 🎯 Códigos de Erro Semânticos

### Categorias de Erro

#### Autenticação (AUTH_*)
- `AUTH_REQUIRED` - Token de acesso necessário
- `AUTH_INVALID_CREDENTIALS` - Credenciais inválidas
- `AUTH_TOKEN_EXPIRED` - Sessão expirada
- `AUTH_USER_EXISTS` - Usuário já existe
- `AUTH_INSUFFICIENT_PERMISSIONS` - Permissões insuficientes

#### Recursos (RESOURCE_*)
- `TASK_NOT_FOUND` - Tarefa não encontrada
- `HABIT_NOT_FOUND` - Hábito não encontrado
- `PROJECT_NOT_FOUND` - Projeto não encontrado
- `RESOURCE_NOT_FOUND` - Recurso genérico não encontrado
- `RESOURCE_ALREADY_EXISTS` - Recurso já existe

#### Validação (VALIDATION_*)
- `VALIDATION_FAILED` - Dados inválidos
- `VALIDATION_MISSING_FIELD` - Campo obrigatório
- `VALIDATION_INVALID_FORMAT` - Formato inválido
- `VALIDATION_CONSTRAINT_VIOLATION` - Violação de restrição

#### Negócio (BUSINESS_*)
- `TASK_ALREADY_COMPLETED` - Tarefa já completa
- `PROJECT_HAS_TASKS` - Projeto possui tarefas
- `INSUFFICIENT_ENERGY` - Energia insuficiente
- `RECURRING_TASK_REQUIRED` - Tarefa recorrente necessária

#### Sistema (SYSTEM_*)
- `DATABASE_ERROR` - Erro do banco de dados
- `RATE_LIMIT_EXCEEDED` - Rate limit atingido
- `INTERNAL_SERVER_ERROR` - Erro interno
- `NOT_IMPLEMENTED` - Funcionalidade não implementada

## 📦 Exemplos de Resposta

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Tarefa criada com sucesso",
  "data": {
    "id": "123",
    "description": "Minha tarefa",
    "status": "pending"
  },
  "meta": {
    "total": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Tarefa não encontrada ou não pertence a você.",
    "context": "get_task",
    "details": {
      "taskId": "invalid-id"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Erro de Validação

```json
{
  "success": false,
  "message": "Dados fornecidos são inválidos",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Os dados fornecidos são inválidos.",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório",
        "code": "required"
      },
      {
        "field": "password",
        "message": "Senha deve ter pelo menos 6 caracteres",
        "code": "min_length"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Migração do Código Existente

### Antes (Legacy)

```typescript
export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const task = await taskService.getTaskById(req.params.id, req.userId);
    
    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};
```

### Depois (Padronizado)

```typescript
export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throwAppError(ErrorCode.AUTH_REQUIRED);
    }

    const task = await taskService.getTaskById(req.params.id, req.userId);
    assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'get_task');
    
    const response = createSuccessResponse(task);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
```

## 🧪 Testes

### Exemplo de Teste

```typescript
import { createSuccessResponse, ErrorCode, AppError } from '../lib/errors';

describe('API Response Standards', () => {
  it('deve criar resposta de sucesso padronizada', () => {
    const data = { id: '123' };
    const response = createSuccessResponse(data, 'Sucesso');
    
    expect(response).toMatchObject({
      success: true,
      message: 'Sucesso',
      data,
      timestamp: expect.any(String)
    });
  });

  it('deve tratar erro padronizado', () => {
    const error = new AppError(ErrorCode.TASK_NOT_FOUND);
    const response = error.toApiResponse();
    
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(ErrorCode.TASK_NOT_FOUND);
  });
});
```

## 🔄 Compatibilidade

O sistema mantém **100% de compatibilidade** com o código existente através de:

1. **Mapeamento Legacy**: Erros antigos são automaticamente convertidos
2. **Error Handler**: Processa tanto erros novos quanto antigos
3. **Migração Gradual**: Permite atualização incremental dos controllers

## 📝 Checklist de Migração

- [ ] Atualizar imports nos controllers
- [ ] Substituir respostas manuais por `createSuccessResponse()`
- [ ] Usar `throwAppError()` para erros específicos
- [ ] Usar `assertResourceExists()` para validações
- [ ] Remover tratamento manual de erros
- [ ] Delegar tudo para `next(error)`
- [ ] Atualizar testes unitários
- [ ] Validar integração com frontend

## 🚨 Importantes

### ⚠️ Não Fazer

```typescript
// ❌ Não criar respostas manualmente
res.status(404).json({ success: false, error: 'Not found' });

// ❌ Não tratar erros manualmente nos controllers
if (error.message === 'User not found') {
  res.status(404).json({ error: 'User not found' });
}
```

### ✅ Fazer

```typescript
// ✅ Usar factory functions
const response = createSuccessResponse(data, message);
res.json(response);

// ✅ Usar helper functions
throwAppError(ErrorCode.USER_NOT_FOUND);
assertResourceExists(user, ErrorCode.USER_NOT_FOUND);

// ✅ Delegar para error handler
next(error);
```

## 🔗 Integração com Frontend

O sistema de códigos semânticos facilita a implementação no frontend:

```typescript
// Frontend - Tratamento baseado em códigos
switch (error.code) {
  case 'AUTH_REQUIRED':
    // Redirecionar para login
    router.push('/login');
    break;
  
  case 'TASK_NOT_FOUND':
    // Mostrar mensagem específica
    toast.error('Tarefa não encontrada');
    break;
  
  case 'VALIDATION_FAILED':
    // Destacar campos com erro
    highlightFieldErrors(error.details);
    break;
}
```

## 📊 Benefícios

1. **Consistência**: Todas as respostas seguem o mesmo padrão
2. **Manutenibilidade**: Código mais limpo e organizado
3. **Debugging**: Logs estruturados e contexto detalhado
4. **Flexibilidade**: Fácil adicionar novos tipos de erro
5. **Internacionalização**: Mensagens centralizadas
6. **Monitoramento**: Códigos semânticos para métricas
7. **Developer Experience**: Interface clara e previsível

---

**Este sistema está pronto para produção e mantém 100% de compatibilidade com o código existente.**