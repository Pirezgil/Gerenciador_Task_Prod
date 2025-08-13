# 🔧 PLANO DE CORREÇÕES - SISTEMA DE LEMBRETES

> **Documento de Trabalho para Claude Code**  
> Este documento contém todas as correções identificadas na análise completa do sistema de lembretes.  
> Cada tarefa especifica a persona ideal para resolução e instruções detalhadas de implementação.

---

## 📋 **RESUMO EXECUTIVO**

- **Status Atual:** Sistema 85% funcional
- **Score de Qualidade:** 7.7/10
- **Problemas Críticos:** 4 identificados
- **Tempo Estimado:** 2-4 horas para correções críticas

---

## 🚨 **CORREÇÕES CRÍTICAS (PRIORIDADE ALTA)**

### **1. VALIDAÇÃO ZOD NÃO APLICADA NOS ENDPOINTS**
- **Persona Ideal:** `backend.md` (Desenvolvedor backend sênior)
- **Impacto:** ALTO - Sistema aceita dados inválidos
- **Status:** ❌ NÃO FUNCIONA

**Problema Identificado:**
```
❌ Schemas Zod existem mas não são aplicados nos middlewares
❌ Endpoints aceitam tipos inválidos ('invalid_type', 'invalid_entity')
❌ Arrays vazios de notificationTypes são aceitos
```

**Localização dos Problemas:**
- `backend/src/routes/reminders.ts` - Middleware de validação não funcional
- `backend/src/lib/validation.ts` - Schemas existem mas não são aplicados
- `backend/src/controllers/remindersController.ts` - Validação bypass

**Tarefas Específicas:**
1. **Verificar schemas Zod em `backend/src/lib/validation.ts`:**
   ```typescript
   // Verificar se existem:
   - createReminderSchema
   - updateReminderSchema  
   - reminderFilterSchema
   ```

2. **Corrigir middleware de validação nas rotas:**
   ```typescript
   // Em backend/src/routes/reminders.ts
   router.post('/', validate(createReminderSchema), remindersController.createReminder);
   router.put('/:id', validate(updateReminderSchema), remindersController.updateReminder);
   ```

3. **Implementar validações específicas:**
   - `type` deve ser: 'before_due' | 'scheduled' | 'recurring'  
   - `entityType` deve ser: 'task' | 'habit' | 'standalone'
   - `notificationTypes` deve ter pelo menos 1 item
   - `scheduledTime` obrigatório para 'scheduled' e 'recurring'
   - `minutesBefore` obrigatório para 'before_due'
   - `daysOfWeek` obrigatório para 'recurring'

**Validação de Sucesso:**
```bash
# Executar este comando para testar:
curl -X POST http://localhost:3001/api/reminders \
  -H "Content-Type: application/json" \
  -d '{"type": "invalid_type", "entityType": "invalid_entity"}'
# Deve retornar 400 Bad Request
```

---

### **2. LIMITE DE 5 LEMBRETES POR TAREFA NÃO FUNCIONA**
- **Persona Ideal:** `database-operations.md` (Expert em operações Prisma)
- **Impacto:** ALTO - Permite spam de lembretes
- **Status:** ❌ NÃO FUNCIONA

**Problema Identificado:**
```
❌ Lógica existe em reminderService.ts mas não está funcionando
❌ Teste criou 6 lembretes quando deveria falhar no 6º
❌ Contador não considera lembretes inativos corretamente
```

**Localização dos Problemas:**
- `backend/src/services/reminderService.ts:53-66` - Lógica de contagem
- Possível problema na query de contagem do Prisma

**Tarefas Específicas:**
1. **Debuggar a lógica em `reminderService.ts`:**
   ```typescript
   // Verificar esta query:
   const existingCount = await prisma.reminder.count({
     where: {
       userId,
       entityId: data.entityId,
       isActive: true
     }
   });
   ```

2. **Testar isoladamente:**
   ```javascript
   // Criar script de teste para validar:
   // 1. Criar exatamente 5 lembretes para uma tarefa
   // 2. Tentar criar o 6º - deve lançar erro
   // 3. Verificar se o erro é "Limite máximo de 5 lembretes por tarefa/hábito atingido"
   ```

3. **Implementar logs para debug:**
   ```typescript
   console.log(`Lembretes existentes para ${data.entityId}: ${existingCount}`);
   if (existingCount >= 5) {
     console.log('LIMITE ATINGIDO - Rejeitando criação');
     throw new Error('Limite máximo de 5 lembretes por tarefa/hábito atingido');
   }
   ```

**Validação de Sucesso:**
```bash
# Após correção, executar o teste:
node -e "
// Código para criar 5 lembretes + tentar 6º
// Deve falhar no 6º com erro específico
"
```

---

### **3. EDGE CASES GERAM LEMBRETES INVÁLIDOS**
- **Persona Ideal:** `backend.md` (Desenvolvedor backend sênior)
- **Impacto:** MÉDIO - Lembretes com nextScheduledAt = null não funcionam
- **Status:** ⚠️ PARCIAL

**Problema Identificado:**
```
⚠️ Lembretes 'recurring' sem daysOfWeek têm nextScheduledAt = null
⚠️ Lembretes 'scheduled' sem scheduledTime têm nextScheduledAt = null  
⚠️ Lembretes 'before_due' sem minutesBefore têm nextScheduledAt = null
```

**Localização dos Problemas:**
- `backend/src/services/reminderService.ts:68-81` - Cálculo de nextScheduledAt
- Lógica não valida campos obrigatórios antes de criar

**Tarefas Específicas:**
1. **Implementar validação por tipo ANTES da criação:**
   ```typescript
   // Adicionar no início de createReminder():
   if (data.type === 'scheduled' && !data.scheduledTime) {
     throw new Error('scheduledTime é obrigatório para lembretes do tipo scheduled');
   }
   if (data.type === 'recurring' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
     throw new Error('daysOfWeek é obrigatório para lembretes do tipo recurring');
   }
   if (data.type === 'before_due' && !data.minutesBefore) {
     throw new Error('minutesBefore é obrigatório para lembretes do tipo before_due');
   }
   ```

2. **Melhorar cálculo de nextScheduledAt:**
   ```typescript
   // Para recurring, calcular próximo dia baseado em daysOfWeek
   // Para scheduled, usar scheduledTime para próximo dia
   // Para before_due, calcular baseado na data de vencimento da tarefa
   ```

**Validação de Sucesso:**
- Todos os lembretes criados devem ter nextScheduledAt válido
- Scheduler deve encontrar lembretes para processar

---

### **4. CUSTOM ERROR CLASSES AUSENTES**
- **Persona Ideal:** `backend.md` (Desenvolvedor backend sênior)  
- **Impacto:** BAIXO - Dificiculta debugging e UX
- **Status:** ⚠️ PARCIAL

**Problema Identificado:**
```
⚠️ Todos os erros usam Error() genérico
⚠️ Frontend não consegue distinguir tipos de erro
⚠️ Logs não são estruturados
```

**Tarefas Específicas:**
1. **Criar classes de erro personalizadas:**
   ```typescript
   // backend/src/lib/errors.ts
   export class ReminderValidationError extends Error {
     constructor(message: string, field?: string) {
       super(message);
       this.name = 'ReminderValidationError';
       this.field = field;
     }
   }
   
   export class ReminderLimitError extends Error {
     constructor(limit: number, entityId: string) {
       super(`Limite de ${limit} lembretes atingido para entidade ${entityId}`);
       this.name = 'ReminderLimitError';
     }
   }
   ```

2. **Aplicar nos services e controllers**
3. **Mapear erros específicos para códigos HTTP apropriados**

---

## 🟡 **MELHORIAS RECOMENDADAS (PRIORIDADE MÉDIA)**

### **5. RATE LIMITING POR USUÁRIO**
- **Persona Ideal:** `security.md` (Engenheira de segurança)
- **Impacto:** MÉDIO - Previne spam e abuse

**Implementação:**
```typescript
// Limite: 100 lembretes ativos por usuário
// Implementar middleware de rate limiting
// Adicionar em reminderService.ts
```

### **6. MELHORAR TRATAMENTO DE ERRO NO FRONTEND**
- **Persona Ideal:** `frontend.md` (Desenvolvedor frontend sênior)
- **Impacto:** MÉDIO - Melhor UX

**Implementação:**
- Mapear erros específicos do backend
- Exibir mensagens amigáveis
- Implementar retry automático para erros temporários

---

## 🟢 **OTIMIZAÇÕES FUTURAS (PRIORIDADE BAIXA)**

### **7. INTEGRAÇÃO COM PROVEDORES REAIS**
- **Persona Ideal:** `devops.md` (Engenheiro DevOps)
- **Impacto:** BAIXO - Funcionalidade atual é simulação

**Provedores Sugeridos:**
- Push: Firebase Cloud Messaging ou OneSignal
- Email: SendGrid ou Nodemailer + SMTP
- SMS: Twilio

### **8. CACHE REDIS PARA LEMBRETES ATIVOS**
- **Persona Ideal:** `performance.md` (Expert em otimização)
- **Impacto:** BAIXO - Otimização de performance

**Implementação:**
- Cache de lembretes ativos por 5 minutos
- Invalidação automática em CRUD operations
- Redução de queries no scheduler

### **9. ANALYTICS E MONITORING**
- **Persona Ideal:** `devops.md` (Engenheiro DevOps)
- **Impacto:** BAIXO - Observabilidade

**Métricas Sugeridas:**
- Taxa de entrega de notificações
- Lembretes mais utilizados por tipo
- Performance do scheduler
- Errors por endpoint

---

## 📊 **PLANO DE EXECUÇÃO RECOMENDADO**

### **FASE 1: Correções Críticas (2-4 horas)**
1. ✅ **[backend.md]** Corrigir validação Zod nos endpoints
2. ✅ **[database-operations.md]** Debuggar e corrigir limite de 5 lembretes  
3. ✅ **[backend.md]** Implementar validação de edge cases
4. ✅ **[backend.md]** Criar custom error classes

### **FASE 2: Melhorias (2-3 horas)**
5. 🔄 **[security.md]** Implementar rate limiting
6. 🔄 **[frontend.md]** Melhorar error handling no frontend

### **FASE 3: Otimizações (Backlog)**
7. 📋 **[devops.md]** Integrar provedores reais de notificação
8. 📋 **[performance.md]** Implementar cache Redis
9. 📋 **[devops.md]** Adicionar analytics e monitoring

---

## 🧪 **COMANDOS DE VALIDAÇÃO**

Após cada correção, executar estes comandos para validar:

```bash
# 1. Testar validação de entrada
curl -X POST http://localhost:3001/api/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type": "invalid", "entityType": "invalid"}'

# 2. Testar limite de lembretes  
node test_reminder_limits.js

# 3. Testar edge cases
node test_reminder_edge_cases.js

# 4. Verificar scheduler
curl http://localhost:3001/api/scheduler/status
```

---

## 📋 **CHECKLIST DE CONCLUSÃO**

- [ ] **Validação Zod funcionando** - Rejeita dados inválidos
- [ ] **Limite de 5 lembretes** - Falha no 6º lembrete  
- [ ] **Edge cases tratados** - Todos lembretes têm nextScheduledAt válido
- [ ] **Custom errors** - Mensagens específicas por tipo de erro
- [ ] **Testes passando** - Todos os cenários validados
- [ ] **Performance mantida** - Queries < 10ms
- [ ] **Zero regressões** - Funcionalidades existentes íntegras

---

## 🎯 **OBJETIVO FINAL**

Elevar o **Score de Qualidade de 7.7/10 para 9.0/10** com sistema de lembretes totalmente funcional, seguro e performático, pronto para produção.

---

**📅 Data da Análise:** 2025-08-09  
**👤 Analista:** Claude Code (Feature Tracing + Full-Stack Analysis)  
**📋 Status:** Pronto para execução das correções  
**⏱️ ETA para Conclusão:** 2-4 horas (correções críticas)