# 📋 Hábitos Recorrentes Diários - Especificação de Implementação

## 🎯 Objetivo
Implementar a lógica correta de sequência (streak) para hábitos recorrentes diários, onde:
- **Perder 1 dia quebra a sequência** → streak volta para 0
- **Sistema armazena a maior sequência** (bestStreak)
- **Cálculo baseado em consecutividade real**

---

## 📊 Situação Atual vs Desejada

### ❌ **Problema Atual**
```javascript
// habitService.ts (INCORRETO)
if (date.getTime() === today.getTime()) {
  const newStreak = habit.streak + 1; // ❌ Sempre incrementa
  // ❌ Não verifica se perdeu dias anteriores
}
```

**Exemplo do Bug:**
- Completions: 12/08, 18/08 (GAP de 5 dias)
- Streak atual: 2 ❌ (deveria ser 1)

### ✅ **Lógica Desejada**
```javascript
// Nova implementação (CORRETO)
const streak = calculateConsecutiveDays(completions, today);
if (streak === 0) {
  // Quebrou sequência, resetar
} else {
  // Manter/incrementar sequência
}
```

---

## 🔨 Implementações Necessárias

### 1. **Nova Função: `calculateStreakForHabit`**
**Local**: `backend/src/services/habitStreakCalculator.ts` (novo arquivo)

```typescript
interface StreakCalculation {
  currentStreak: number;
  shouldReset: boolean;
  isNewRecord: boolean;
}

export function calculateStreakForHabit(
  completions: HabitCompletion[],
  frequency: HabitFrequency,
  today: Date
): StreakCalculation {
  // 1. Filtrar completions válidas para a frequência
  // 2. Verificar consecutividade desde hoje
  // 3. Contar dias consecutivos
  // 4. Determinar se precisa resetar
}
```

### 2. **Atualizar `habitService.ts`**
**Arquivo**: `backend/src/services/habitService.ts`

**Substituir** a lógica atual (linhas 205-225):
```typescript
// ❌ REMOVER (lógica atual incorreta)
if (date.getTime() === today.getTime()) {
  const newStreak = habit.streak + 1;
  // ...
}

// ✅ IMPLEMENTAR (nova lógica)
const streakCalc = calculateStreakForHabit(
  [...habit.completions, completion],
  habit.frequency,
  today
);

if (streakCalc.shouldReset) {
  newStreak = 1; // Primeiro dia da nova sequência
} else {
  newStreak = streakCalc.currentStreak;
}

const newBestStreak = Math.max(habit.bestStreak, newStreak);
```

### 3. **Função de Reset Automático**
**Local**: `backend/src/services/habitStreakCalculator.ts`

```typescript
export async function resetExpiredStreaks(userId: string): Promise<void> {
  // 1. Buscar todos hábitos do usuário
  // 2. Para cada hábito, verificar se quebrou sequência
  // 3. Resetar streaks que expiraram
  // 4. Manter bestStreak intacto
}
```

### 4. **Job de Verificação Diária**
**Local**: `backend/src/jobs/dailyStreakCheck.ts` (novo arquivo)

```typescript
// Executar todo dia à meia-noite
export async function runDailyStreakCheck(): Promise<void> {
  const users = await getAllActiveUsers();
  
  for (const user of users) {
    await resetExpiredStreaks(user.id);
  }
}
```

---

## 📅 Regras de Negócio - Hábitos Diários

### **Definição de "Consecutivo"**
- **Hábito Diário**: Deve ser completado TODOS os dias
- **Gap de 1 dia**: Quebra a sequência → streak = 0
- **Completion hoje**: Inicia nova sequência = 1

### **Cenários de Teste**

#### **Cenário 1: Sequência Perfeita**
```
Completions: 15/08, 16/08, 17/08, 18/08
Resultado: streak = 4 ✅
```

#### **Cenário 2: Quebra de Sequência**
```
Completions: 15/08, 16/08, [PERDEU 17/08], 18/08
Resultado: streak = 1 (apenas hoje) ✅
```

#### **Cenário 3: Recomeço após Gap**
```
Antes: 12/08, 13/08 (streak era 2)
Depois: [gap], 18/08, 19/08
Resultado: streak = 2, bestStreak = 2 ✅
```

### **Tratamento de Edge Cases**

1. **Completion no passado**
   - Se adicionar completion para ontem → recalcular streak completo
   
2. **Múltiplas completions no mesmo dia**
   - Contar apenas como 1 dia completado

3. **Hábito criado hoje**
   - Primeiro completion = streak 1

4. **Timezone**
   - Usar sempre data local normalizada (já implementado)

---

## 🧪 Testes Necessários

### **Testes Unitários**
```typescript
// test/habitStreakCalculator.test.ts
describe('calculateStreakForHabit', () => {
  test('deve calcular streak consecutivo corretamente');
  test('deve resetar streak com gap de 1 dia');
  test('deve manter bestStreak após reset');
  test('deve tratar completions fora de ordem');
});
```

### **Testes de Integração**
```typescript
// test/habitService.integration.test.ts  
describe('Habit Streak Integration', () => {
  test('cenário completo: criar → completar → pular → completar');
  test('verificar bestStreak é preservado após reset');
  test('múltiplas completions no mesmo dia');
});
```

### **Cenários de Validação Manual**
1. **Criar hábito diário**
2. **Completar por 3 dias consecutivos** → verificar streak = 3
3. **Pular 1 dia** → completar no dia seguinte → verificar streak = 1
4. **Verificar bestStreak = 3** (preservado)

---

## 📁 Estrutura de Arquivos

### **Novos Arquivos**
```
backend/src/
├── services/
│   ├── habitStreakCalculator.ts     # 🆕 Lógica de cálculo
│   └── habitService.ts              # 🔄 Atualizar
├── jobs/
│   └── dailyStreakCheck.ts          # 🆕 Job diário
└── test/
    ├── habitStreakCalculator.test.ts # 🆕 Testes unitários
    └── habitService.integration.test.ts # 🆕 Testes integração
```

### **Arquivos Modificados**
```
backend/src/
├── services/
│   └── habitService.ts              # Substituir lógica de streak
└── routes/
    └── habits.ts                    # Adicionar endpoint de recálculo
```

---

## ⚙️ Configurações

### **Variáveis de Ambiente**
```env
# .env
DAILY_STREAK_CHECK_ENABLED=true
DAILY_STREAK_CHECK_TIME="00:00"  # Meia-noite
```

### **Scheduler (Opcional)**
```javascript
// Para produção - usar cron job
0 0 * * * node -e "require('./dist/jobs/dailyStreakCheck.js').runDailyStreakCheck()"
```

---

## 🚀 Plano de Implementação

### **Fase 1: Core Logic** (Prioridade Alta)
1. ✅ Criar `habitStreakCalculator.ts`
2. ✅ Implementar `calculateStreakForHabit`
3. ✅ Atualizar `habitService.ts`
4. ✅ Testes unitários básicos

### **Fase 2: Reset Automático** (Prioridade Média)
1. ✅ Implementar `resetExpiredStreaks`
2. ✅ Criar job de verificação diária
3. ✅ Testes de integração

### **Fase 3: Melhorias** (Prioridade Baixa)
1. ✅ Endpoint para recálculo manual
2. ✅ Dashboard de monitoramento
3. ✅ Métricas e logs

---

## 📊 Monitoramento

### **Métricas a Acompanhar**
- Número de streaks resetados por dia
- Distribuição de tamanhos de streak
- Taxa de quebra vs manutenção de streaks
- Performance do job de verificação

### **Logs Importantes**
```
[STREAK] Usuário X: Streak resetado de 5 → 0 (gap detectado)
[STREAK] Usuário Y: Novo recorde! Streak 15 (bestStreak: 10 → 15)
[STREAK] Job diário: Processados 1.234 usuários em 2.3s
```

---

## ❗ Observações Importantes

### **Compatibilidade**
- ✅ Não quebra dados existentes
- ✅ bestStreak sempre preservado
- ✅ Recálculo é idempotente

### **Performance**
- Cálculo em O(n) onde n = número de completions
- Job diário deve processar usuários em lotes
- Cache de streaks calculados (opcional)

### **Migração**
- Streaks atuais podem estar incorretos
- Considerar script de recálculo one-time
- Comunicar mudanças aos usuários

---

## 🎯 Resultado Esperado

Após implementação:

✅ **Sequência quebra automaticamente** ao perder 1 dia  
✅ **bestStreak sempre preservado**  
✅ **Cálculo correto** baseado em consecutividade  
✅ **Reset automático diário**  
✅ **Performance otimizada**  
✅ **Testes completos**  

**Sistema confiável e preciso para motivação de hábitos diários! 🔥**