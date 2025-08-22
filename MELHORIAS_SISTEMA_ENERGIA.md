# 🔋 Melhorias do Sistema de Energia - "Atuar Hoje"

## 📊 Análise Realizada em: 18/08/2025

### 🎯 **Resumo da Análise**

Foi realizada uma análise completa do fluxo **Frontend → Backend → DB → Backend → Frontend** para o processo de definição de tarefas como "atuar hoje" e o sistema de controle de energia. O sistema atual está funcional e seguro, mas foram identificadas oportunidades de melhoria para aumentar robustez, performance e experiência do usuário.

---

## 🔧 **Melhorias Prioritárias**

### **1. 🐛 ALTA PRIORIDADE: Inconsistências no Cálculo de Energia**

**Problema Identificado:**
- Tarefas completadas em dias anteriores podem ainda ocupar orçamento do dia atual
- Lógica de filtragem no `getUserEnergyBudget()` pode gerar inconsistências
- Não há limpeza automática de tarefas antigas

**Localização no Código:**
- `backend/src/services/taskService.ts:1076-1086`

**Solução Recomendada:**
```typescript
// Implementar job scheduler diário (via cron ou similar)
// Arquivo: backend/src/jobs/dailyEnergyCleanup.ts

export class DailyEnergyCleanup {
  static async cleanupYesterdayTasks() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    
    // Remover plannedForToday de tarefas completadas ontem
    await prisma.task.updateMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: yesterday,
          lte: endOfYesterday
        },
        plannedForToday: true
      },
      data: {
        plannedForToday: false
      }
    });
  }
}
```

**Impacto:** Elimina inconsistências no cálculo de energia e garante dados precisos

---

### **2. ⚡ MÉDIA PRIORIDADE: Performance na Validação de Energia**

**Problema Identificado:**
- Múltiplas queries ao banco para validar energia a cada atualização de tarefa
- Recálculo desnecessário em operações frequentes
- Ausência de cache para orçamento de energia

**Localização no Código:**
- `backend/src/services/taskService.ts:424-450`

**Solução Recomendada:**
```typescript
// Implementar cache Redis para orçamento
// Arquivo: backend/src/cache/energyBudgetCache.ts

export class EnergyBudgetCache {
  private static CACHE_KEY = (userId: string) => `energy:budget:${userId}`;
  private static CACHE_TTL = 300; // 5 minutos
  
  static async getOrCalculate(userId: string): Promise<EnergyBudgetResponse> {
    const cached = await redis.get(this.CACHE_KEY(userId));
    if (cached) {
      return JSON.parse(cached);
    }
    
    const budget = await taskService.calculateEnergyBudget(userId);
    await redis.setex(this.CACHE_KEY(userId), this.CACHE_TTL, JSON.stringify(budget));
    
    return budget;
  }
  
  static async invalidate(userId: string): Promise<void> {
    await redis.del(this.CACHE_KEY(userId));
  }
}
```

**Impacto:** Reduz latência nas validações e melhora responsividade da aplicação

---

### **3. 🔄 MÉDIA PRIORIDADE: Race Conditions em Atualizações Concorrentes**

**Problema Identificado:**
- Múltiplos usuários podem exceder o orçamento em operações simultâneas
- Ausência de locks otimistas nas validações de energia
- Possibilidade de estados inconsistentes

**Localização no Código:**
- `backend/src/services/taskService.ts:414-473`

**Solução Recomendada:**
```typescript
// Implementar transações atômicas com locks
// Arquivo: backend/src/services/taskService.ts

export const updateTaskWithEnergyValidation = async (
  taskId: string, 
  userId: string, 
  data: UpdateTaskRequest
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock otimista na tarefa
    const existingTask = await tx.task.findFirst({
      where: { id: taskId, userId, isDeleted: false }
    });
    
    if (!existingTask) {
      throw new Error('Tarefa não encontrada');
    }
    
    // 2. Validação atômica de energia
    if (data.plannedForToday === true) {
      const currentBudget = await calculateEnergyBudgetInTransaction(tx, userId);
      
      if (currentBudget.remaining < (data.energyPoints || existingTask.energyPoints)) {
        throw new Error('Limite de energia excedido');
      }
    }
    
    // 3. Atualização atômica
    return await tx.task.update({
      where: { id: taskId },
      data: updateData
    });
  });
};
```

**Impacto:** Elimina condições de corrida e garante consistência dos dados

---

### **4. 📊 BAIXA PRIORIDADE: Auditoria e Logs Detalhados**

**Problema Identificado:**
- Logs limitados sobre mudanças no orçamento de energia
- Dificuldade para rastrear histórico de uso de energia
- Ausência de métricas para otimização

**Localização no Código:**
- `backend/prisma/schema.prisma:317-330`

**Solução Recomendada:**
```sql
-- Expandir tabela DailyEnergyLog
-- Arquivo: backend/prisma/migrations/add_energy_audit.sql

ALTER TABLE daily_energy_logs ADD COLUMN actions_log JSONB;
ALTER TABLE daily_energy_logs ADD COLUMN peak_usage_time TIMESTAMP;
ALTER TABLE daily_energy_logs ADD COLUMN tasks_planned INTEGER DEFAULT 0;
ALTER TABLE daily_energy_logs ADD COLUMN tasks_postponed INTEGER DEFAULT 0;
ALTER TABLE daily_energy_logs ADD COLUMN efficiency_score DECIMAL(3,2);

CREATE INDEX idx_daily_energy_efficiency ON daily_energy_logs(user_id, efficiency_score);
CREATE INDEX idx_daily_energy_actions ON daily_energy_logs USING GIN(actions_log);
```

**Impacto:** Melhora observabilidade e permite otimizações baseadas em dados

---

### **5. 🎯 BAIXA PRIORIDADE: UX Melhorada para Limite de Energia**

**Problema Identificado:**
- Mensagem de erro genérica quando limite é excedido
- Usuário não vê distribuição atual de energia
- Ausência de sugestões para otimização

**Localização no Código:**
- `src/components/planejamento/PlanejamentoDiariaPage.tsx:420-480`

**Solução Recomendada:**
```typescript
// Componente de visualização de energia
// Arquivo: src/components/energy/EnergyBudgetVisualization.tsx

interface EnergyBreakdown {
  completed: { tasks: Task[]; energy: number };
  pending: { tasks: Task[]; energy: number };
  available: number;
}

export function EnergyBudgetVisualization({ breakdown }: { breakdown: EnergyBreakdown }) {
  return (
    <div className="energy-breakdown">
      <div className="energy-bar">
        <div className="completed" style={{ width: `${(breakdown.completed.energy / 12) * 100}%` }} />
        <div className="pending" style={{ width: `${(breakdown.pending.energy / 12) * 100}%` }} />
      </div>
      
      <div className="energy-suggestions">
        {breakdown.available < 3 && (
          <Alert>
            💡 Sugestão: Considere adiar uma tarefa de 5 pontos para liberar espaço
          </Alert>
        )}
      </div>
    </div>
  );
}
```

**Impacto:** Melhora experiência do usuário e facilita tomada de decisões

---

## 📅 **Cronograma de Implementação Sugerido**

### **Sprint 1 (1-2 semanas) - Correções Críticas**
- [ ] Implementar limpeza automática diária de energia
- [ ] Corrigir inconsistências no cálculo de orçamento
- [ ] Adicionar testes unitários para validações de energia

### **Sprint 2 (1-2 semanas) - Performance**
- [ ] Implementar cache Redis para orçamento
- [ ] Otimizar queries de validação de energia
- [ ] Adicionar monitoramento de performance

### **Sprint 3 (2-3 semanas) - Robustez**
- [ ] Implementar transações atômicas
- [ ] Adicionar locks otimistas
- [ ] Testes de concorrência

### **Sprint 4 (1-2 semanas) - Observabilidade**
- [ ] Expandir logs de auditoria
- [ ] Implementar métricas de uso
- [ ] Dashboard de energia (opcional)

### **Sprint 5 (1-2 semanas) - UX**
- [ ] Melhorar interface de energia
- [ ] Adicionar sugestões inteligentes
- [ ] Testes de usabilidade

---

## 🧪 **Testes Recomendados**

### **Testes Unitários**
```typescript
// backend/tests/services/taskService.test.ts
describe('Energy Budget Validation', () => {
  it('should prevent exceeding daily energy budget', async () => {
    // Configurar usuário com orçamento de 12
    // Adicionar tarefas totalizando 10 pontos
    // Tentar adicionar tarefa de 5 pontos
    // Deve falhar com erro específico
  });
  
  it('should allow task when within budget', async () => {
    // Configurar usuário com orçamento de 12
    // Adicionar tarefas totalizando 8 pontos
    // Tentar adicionar tarefa de 3 pontos
    // Deve suceder
  });
});
```

### **Testes de Integração**
```typescript
// backend/tests/integration/energy.test.ts
describe('Energy System Integration', () => {
  it('should handle concurrent task planning correctly', async () => {
    // Simular múltiplas requisições simultâneas
    // Verificar que orçamento não é excedido
  });
});
```

### **Testes E2E**
```typescript
// frontend/tests/e2e/energy.spec.ts
describe('Energy Budget UI', () => {
  it('should show error when planning task exceeds budget', async () => {
    // Navegar para página de planejamento
    // Planejar tarefas até próximo do limite
    // Tentar planejar tarefa que exceda
    // Verificar mensagem de erro
  });
});
```

---

## 📊 **Métricas de Sucesso**

### **Performance**
- [ ] Redução de 50% no tempo de resposta das validações de energia
- [ ] Cache hit rate > 80% para consultas de orçamento
- [ ] Redução de queries de validação em 60%

### **Qualidade**
- [ ] Zero inconsistências no cálculo de energia
- [ ] Cobertura de testes > 90% para módulos de energia
- [ ] Eliminação de race conditions

### **UX**
- [ ] Redução de 70% em reclamações sobre limite de energia
- [ ] Aumento de 30% na precisão do planejamento diário
- [ ] Tempo médio de tomada de decisão < 30s

---

## 🚀 **Benefícios Esperados**

### **Para Desenvolvedores**
- ✅ Código mais robusto e testável
- ✅ Melhor observabilidade do sistema
- ✅ Redução de bugs relacionados à energia

### **Para Usuários**
- ✅ Sistema mais confiável e responsivo
- ✅ Melhor compreensão do orçamento de energia
- ✅ Sugestões inteligentes para otimização

### **Para o Negócio**
- ✅ Redução de churn por problemas técnicos
- ✅ Maior engajamento com funcionalidades
- ✅ Base sólida para features avançadas

---

## 📝 **Notas Técnicas**

### **Arquivos Principais Impactados**
- `backend/src/services/taskService.ts` - Core do sistema de energia
- `backend/src/controllers/tasksController.ts` - Endpoints de tarefas
- `src/hooks/api/useTasks.ts` - Hooks React Query
- `src/lib/api.ts` - Cliente HTTP
- `backend/prisma/schema.prisma` - Schema do banco

### **Dependências Novas**
- Redis (para cache)
- node-cron (para jobs diários)
- @prisma/client (atualização para transações)

### **Configurações de Ambiente**
```env
REDIS_URL=redis://localhost:6379
DAILY_CLEANUP_CRON=0 1 * * *  # Todo dia às 1h da manhã
ENERGY_CACHE_TTL=300           # 5 minutos
```

---

*Análise realizada por: Claude Code*  
*Data: 18/08/2025*  
*Versão do Sistema: 1.0*