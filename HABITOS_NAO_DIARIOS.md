# 📋 Hábitos Não-Diários - Especificação de Implementação

## 🎯 Objetivo
Implementar lógica correta de sequência (streak) para hábitos com frequências flexíveis:
- **Semanal** (dias específicos da semana)
- **Dias úteis** (segunda a sexta)
- **Personalizado** (padrão customizado)
- **Intervalo** (a cada X dias)

---

## 📊 Exemplo Analisado

### **Hábito**: "Tirar o lixo" (ID: `cmehhiioi0007371jmd3nt15g`)
- **Tipo**: `weekly`
- **Dias**: Segunda, Quarta, Sexta `[1, 3, 5]`
- **Significado**: Deve ser feito 3x por semana em dias específicos

---

## ❌ Problema Atual

### **Lógica Atual (INCORRETA)**
```javascript
// habitService.ts - Mesma lógica para TODOS os tipos
if (date.getTime() === today.getTime()) {
  const newStreak = habit.streak + 1; // ❌ Sempre incrementa
}
```

**Problemas**:
- ❌ Ignora configuração de frequência
- ❌ Não diferencia tipos de hábito
- ❌ Streak não reflete o padrão real

---

## ✅ Lógicas Necessárias por Tipo

### 1. **Hábitos Semanais** (`weekly`)

#### **Regra de Negócio**
- **Streak** = semanas consecutivas onde completou **todos** os dias necessários
- **Quebra** se perder uma semana completa
- **Reset** se não completar todos os dias da semana em qualquer semana

#### **Exemplo - "Tirar lixo" (Seg, Qua, Sex)**
```
Semana 1: ✅ Seg, ✅ Qua, ✅ Sex → Streak = 1
Semana 2: ✅ Seg, ❌ Qua, ✅ Sex → Streak = 0 (perdeu Qua)
Semana 3: ✅ Seg, ✅ Qua, ✅ Sex → Streak = 1 (nova sequência)
```

#### **Cálculo de Streak**
```typescript
function calculateWeeklyStreak(completions: Completion[], daysOfWeek: number[]): number {
  let streak = 0;
  const weeks = groupCompletionsByWeek(completions);
  
  for (const week of weeks.reverse()) {
    const completedDays = getCompletedDaysInWeek(week);
    const hasAllRequiredDays = daysOfWeek.every(day => completedDays.includes(day));
    
    if (hasAllRequiredDays) {
      streak++;
    } else {
      break; // Quebra sequência
    }
  }
  
  return streak;
}
```

### 2. **Hábitos de Dias Úteis** (`weekdays`)

#### **Regra de Negócio**
- **Streak** = semanas consecutivas completando Segunda a Sexta
- **Fins de semana não contam**
- **Quebra** se perder qualquer dia útil

#### **Exemplo - "Exercitar nos dias úteis"**
```
Sem 1: ✅ Seg, ✅ Ter, ✅ Qua, ✅ Qui, ✅ Sex → Streak = 1
Sem 2: ✅ Seg, ❌ Ter, ✅ Qua, ✅ Qui, ✅ Sex → Streak = 0
Sem 3: ✅ Seg, ✅ Ter, ✅ Qua, ✅ Qui, ✅ Sex → Streak = 1
```

### 3. **Hábitos Personalizados** (`custom`)

#### **Regra de Negócio**
- **Streak** baseado no padrão específico configurado
- **Flexível** conforme definição do usuário
- **Quebra** se não seguir o padrão

#### **Exemplo - "Yoga" (Ter, Qui, Dom)**
```
Padrão: [2, 4, 0] (Ter, Qui, Dom)
Sem 1: ❌ Ter, ✅ Qui, ✅ Dom → Streak = 0
Sem 2: ✅ Ter, ✅ Qui, ✅ Dom → Streak = 1
```

### 4. **Hábitos por Intervalo** (`interval`)

#### **Regra de Negócio**
- **Streak** = número de intervalos consecutivos cumpridos
- **Intervalo** = a cada X dias
- **Quebra** se ultrapassar o prazo sem completar

#### **Exemplo - "Lavar carro" (a cada 7 dias)**
```
Dia 1: ✅ Completado → Próximo prazo: Dia 8
Dia 6: ✅ Completado → Streak = 2, Próximo: Dia 13
Dia 15: ✅ Completado → Streak = 0 (perdeu prazo do dia 13)
```

---

## 🔨 Implementação Necessária

### **Arquivo Novo**: `habitFrequencyCalculator.ts`

```typescript
export interface FrequencyStreakResult {
  currentStreak: number;
  shouldReset: boolean;
  isNewRecord: boolean;
  nextRequired?: Date; // Para intervalos
}

export class HabitFrequencyCalculator {
  
  static calculateStreak(
    habit: HabitWithFrequency, 
    completions: Completion[], 
    today: Date
  ): FrequencyStreakResult {
    
    switch (habit.frequency.type) {
      case 'daily':
        return this.calculateDailyStreak(completions, today);
      
      case 'weekly':
        return this.calculateWeeklyStreak(
          completions, 
          habit.frequency.daysOfWeek, 
          today
        );
      
      case 'weekdays':
        return this.calculateWeekdaysStreak(completions, today);
      
      case 'custom':
        return this.calculateCustomStreak(
          completions, 
          habit.frequency.daysOfWeek, 
          today
        );
      
      case 'interval':
        return this.calculateIntervalStreak(
          completions, 
          habit.frequency.intervalDays, 
          today
        );
      
      default:
        return { currentStreak: 0, shouldReset: true, isNewRecord: false };
    }
  }
  
  private static calculateWeeklyStreak(
    completions: Completion[], 
    daysOfWeek: number[], 
    today: Date
  ): FrequencyStreakResult {
    // Implementação específica para hábitos semanais
  }
  
  // ... outras implementações por tipo
}
```

### **Atualização no `habitService.ts`**

```typescript
// Substituir a lógica atual
const streakResult = HabitFrequencyCalculator.calculateStreak(
  habit,
  [...habit.completions, completion],
  today
);

let newStreak: number;
if (streakResult.shouldReset) {
  newStreak = 1; // Primeira completion da nova sequência
} else {
  newStreak = streakResult.currentStreak;
}

const newBestStreak = Math.max(habit.bestStreak, newStreak);
```

---

## 📅 Cenários de Teste por Tipo

### **Hábito Semanal** (Seg, Qua, Sex)

#### ✅ **Cenário 1: Semana Perfeita**
```
Seg: ✅, Ter: -, Qua: ✅, Qui: -, Sex: ✅, Sab: -, Dom: -
Resultado: Streak = 1 ✅
```

#### ❌ **Cenário 2: Perdeu Um Dia**
```
Seg: ✅, Ter: -, Qua: ❌, Qui: -, Sex: ✅, Sab: -, Dom: -
Resultado: Streak = 0 ✅ (perdeu quarta)
```

#### ✅ **Cenário 3: Múltiplas Semanas**
```
Sem 1: Seg✅, Qua✅, Sex✅  → Streak = 1
Sem 2: Seg✅, Qua✅, Sex✅  → Streak = 2
Sem 3: Seg✅, Qua❌, Sex✅  → Streak = 0 (quebrou)
Sem 4: Seg✅, Qua✅, Sex✅  → Streak = 1 (nova sequência)
```

### **Hábito de Dias Úteis**

#### ✅ **Cenário Perfeito**
```
Seg✅, Ter✅, Qua✅, Qui✅, Sex✅ → Streak = 1
```

#### ❌ **Cenário com Falha**
```
Seg✅, Ter❌, Qua✅, Qui✅, Sex✅ → Streak = 0
```

### **Hábito por Intervalo** (A cada 3 dias)

#### ✅ **Cenário Regular**
```
Dia 1: ✅ → Próximo: Dia 4
Dia 3: ✅ → Streak = 2, Próximo: Dia 6
Dia 6: ✅ → Streak = 3, Próximo: Dia 9
```

#### ❌ **Cenário com Atraso**
```
Dia 1: ✅ → Próximo: Dia 4
Dia 7: ✅ → Streak = 0 (perdeu prazo do dia 4)
```

---

## 🧪 Testes Necessários

### **Testes Unitários por Tipo**
```typescript
describe('HabitFrequencyCalculator', () => {
  describe('Weekly Habits', () => {
    test('deve calcular streak semanal corretamente');
    test('deve resetar se perder um dia da semana');
    test('deve ignorar dias não configurados');
  });
  
  describe('Weekdays Habits', () => {
    test('deve contar apenas dias úteis');
    test('deve ignorar fins de semana');
  });
  
  describe('Interval Habits', () => {
    test('deve calcular intervalos consecutivos');
    test('deve resetar se ultrapassar prazo');
  });
});
```

### **Cenários de Validação**

1. **Criar hábito semanal** (Seg, Qua, Sex)
2. **Completar semana perfeita** → streak = 1
3. **Completar Seg e Sex, pular Qua** → streak = 0
4. **Completar próxima semana perfeita** → streak = 1
5. **Verificar bestStreak preservado**

---

## 📊 Interface de Usuário

### **Indicadores Visuais Necessários**

#### **Para Hábitos Semanais**
```
"Tirar lixo" (Seg, Qua, Sex)
Esta semana: ✅ Seg  ❌ Qua  ⭐ Sex (próximo)
Streak: 0 semanas  |  Melhor: 3 semanas
```

#### **Para Hábitos por Intervalo**
```
"Lavar carro" (a cada 7 dias)
Último: 15/08  |  Próximo: 22/08 (em 4 dias)
Streak: 2 intervalos  |  Melhor: 5 intervalos
```

### **Dashboard de Progress**
- **Calendário visual** mostrando dias requeridos
- **Indicadores de progresso** por semana/intervalo
- **Notificações inteligentes** baseadas na frequência

---

## ⚙️ Configurações Avançadas

### **Tolerância e Flexibilidade**
```typescript
interface FrequencySettings {
  strictMode: boolean;        // true = sem tolerância
  gracePeriod?: number;       // dias de tolerância para intervalos
  allowPartialWeeks?: boolean; // aceitar semanas incompletas
}
```

### **Exemplos de Flexibilidade**
```typescript
// Hábito semanal com tolerância
"Gym 3x/semana" + gracePeriod: 1
→ Aceita completar até 1 dia depois

// Hábito intervalo flexível  
"Médico a cada 30 dias" + gracePeriod: 7
→ Aceita até 37 dias sem quebrar streak
```

---

## 🚀 Plano de Implementação

### **Fase 1: Core Logic** ⭐ **PRIORITÁRIA**
1. ✅ `HabitFrequencyCalculator.ts`
2. ✅ Implementar cálculos por tipo
3. ✅ Atualizar `habitService.ts`
4. ✅ Testes unitários básicos

### **Fase 2: Interface** ⭐ **IMPORTANTE**
1. ✅ Indicadores visuais por tipo
2. ✅ Calendário de progresso
3. ✅ Notificações inteligentes

### **Fase 3: Flexibilidade** ⭐ **MELHORIA**
1. ✅ Configurações de tolerância
2. ✅ Modos flexíveis
3. ✅ Personalização avançada

---

## 📈 Benefícios Esperados

### **Para Usuários**
✅ **Streaks mais precisos** e motivadores  
✅ **Flexibilidade real** para diferentes padrões  
✅ **Feedback claro** sobre progresso  
✅ **Motivação adequada** ao tipo de hábito  

### **Para o Sistema**
✅ **Lógica robusta** e extensível  
✅ **Suporte completo** a todos os tipos  
✅ **Facilidade de manutenção**  
✅ **Base sólida** para novos tipos  

---

## ❗ Considerações Importantes

### **Migração de Dados**
- Streaks atuais podem estar incorretos
- Recálculo necessário para hábitos existentes
- Comunicar mudanças aos usuários

### **Performance**
- Cálculos mais complexos para alguns tipos
- Cache de resultados quando necessário
- Otimização para hábitos com muitas completions

### **UX/UI**
- Explicar claramente como cada tipo funciona
- Visualizações adequadas por frequência
- Configuração intuitiva de padrões

---

## 🎯 Resultado Final

**Sistema completo de hábitos com suporte real a diferentes frequências:**

🔥 **Diários**: Consecutividade rigorosa  
📅 **Semanais**: Padrões semanais flexíveis  
⏰ **Intervalos**: Prazos e tolerâncias  
🎛️ **Personalizados**: Máxima flexibilidade  

**Streaks precisos, motivação real, sistema robusto! 🚀**