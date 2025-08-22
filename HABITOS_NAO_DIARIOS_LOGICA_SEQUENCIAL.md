# 📋 Hábitos Não-Diários - Lógica Sequencial por Dia

## 🎯 Especificação da Lógica Desejada

### **Regra Principal**
- **A cada dia completado** → `streak + 1`
- **Sistema ignora dias não configurados** (não quebra streak)
- **Se perder um dia configurado** → `streak = 0`
- **Mantém sempre o recorde** (`bestStreak`)

---

## 🔥 Exemplo Prático - "Tirar lixo" (Seg, Qua, Sex)

### **Cenário Completo:**
```
📅 SEGUNDA (dia configurado):
   - Completou: ✅ → streak = 1

📅 TERÇA (dia NÃO configurado):
   - Sistema ignora → streak mantém = 1
   - Hábito NÃO aparece na página do bombeiro

📅 QUARTA (dia configurado):
   - Aparece na página → streak = 1
   - Completou: ✅ → streak = 2

📅 QUINTA (dia NÃO configurado):
   - Sistema ignora → streak mantém = 2

📅 SEXTA (dia configurado):
   - Aparece na página → streak = 2
   - Completou: ✅ → streak = 3

📅 SÁBADO/DOMINGO (dias NÃO configurados):
   - Sistema ignora → streak mantém = 3

📅 SEGUNDA (dia configurado):
   - Aparece na página → streak = 3
   - NÃO completou: ❌ → streak = 0, bestStreak = 3
```

---

## 🧮 Lógica Detalhada por Tipo

### **1. Hábitos Semanais** (`weekly`)

#### **Regra:**
- **Só conta dias configurados** na `daysOfWeek[]`
- **Streak = dias configurados consecutivos completados**
- **Quebra apenas se perder dia que deveria fazer**

#### **Exemplo - "Gym" (Ter, Qui, Sab)**
```
Ter: ✅ → streak = 1
Qua: (ignorado) → streak = 1
Qui: ✅ → streak = 2  
Sex: (ignorado) → streak = 2
Sab: ❌ → streak = 0, bestStreak = 2
```

### **2. Hábitos de Dias Úteis** (`weekdays`)

#### **Regra:**
- **Só conta Segunda a Sexta**
- **Fins de semana sempre ignorados**
- **Streak = dias úteis consecutivos**

#### **Exemplo - "Estudar nos dias úteis"**
```
Seg: ✅ → streak = 1
Ter: ✅ → streak = 2
Qua: ❌ → streak = 0, bestStreak = 2
Qui: ✅ → streak = 1
Sex: ✅ → streak = 2
Sab/Dom: (ignorados) → streak = 2
```

### **3. Hábitos Personalizados** (`custom`)

#### **Regra:**
- **Baseado em padrão específico** configurado
- **Mesmo comportamento** que semanal
- **Máxima flexibilidade**

### **4. Hábitos por Intervalo** (`interval`)

#### **Regra Especial:**
- **Streak = completions dentro do prazo**
- **Quebra se ultrapassar intervalo**
- **Tolerância configurável**

#### **Exemplo - "Médico a cada 30 dias"**
```
Dia 1: ✅ → streak = 1, próximo até dia 31
Dia 25: ✅ → streak = 2, próximo até dia 55  
Dia 60: ✅ → streak = 0 (perdeu prazo), bestStreak = 2
```

---

## 🔨 Implementação Necessária

### **Novo Arquivo**: `habitSequentialCalculator.ts`

```typescript
export interface SequentialStreakResult {
  currentStreak: number;
  shouldReset: boolean;
  isNewRecord: boolean;
  isRequiredToday: boolean; // Novo campo importante
}

export class HabitSequentialCalculator {
  
  /**
   * Verifica se hoje é um dia configurado para o hábito
   */
  static isRequiredToday(frequency: HabitFrequency, today: Date): boolean {
    const dayOfWeek = today.getDay(); // 0=dom, 1=seg, ..., 6=sab
    
    switch (frequency.type) {
      case 'daily':
        return true;
      
      case 'weekly':
      case 'custom':
        return frequency.daysOfWeek?.includes(dayOfWeek) || false;
      
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Seg-Sex
      
      case 'interval':
        return this.isIntervalDayRequired(frequency, today);
      
      default:
        return false;
    }
  }
  
  /**
   * Calcula streak sequencial - NOVA LÓGICA
   */
  static calculateSequentialStreak(
    habit: HabitWithFrequency,
    completions: Completion[],
    today: Date
  ): SequentialStreakResult {
    
    // 1. Verificar se hoje é dia obrigatório
    const isRequiredToday = this.isRequiredToday(habit.frequency, today);
    
    if (!isRequiredToday) {
      // Hoje não é dia do hábito, manter streak atual
      return {
        currentStreak: habit.streak,
        shouldReset: false,
        isNewRecord: false,
        isRequiredToday: false
      };
    }
    
    // 2. Se é dia obrigatório, verificar se completou
    const todayCompletion = this.hasCompletionForDate(completions, today);
    
    if (todayCompletion) {
      // Completou hoje, incrementar
      const newStreak = habit.streak + 1;
      return {
        currentStreak: newStreak,
        shouldReset: false,
        isNewRecord: newStreak > habit.bestStreak,
        isRequiredToday: true
      };
    } else {
      // Não completou em dia obrigatório
      return this.checkIfShouldReset(habit, completions, today);
    }
  }
  
  /**
   * Verifica se deve resetar streak baseado em dias perdidos
   */
  private static checkIfShouldReset(
    habit: HabitWithFrequency,
    completions: Completion[],
    today: Date
  ): SequentialStreakResult {
    
    // Buscar último dia obrigatório que não completou
    const lastRequiredDay = this.getLastRequiredDay(habit.frequency, today);
    
    if (lastRequiredDay && !this.hasCompletionForDate(completions, lastRequiredDay)) {
      // Perdeu um dia obrigatório anterior, resetar
      return {
        currentStreak: 0,
        shouldReset: true,
        isNewRecord: false,
        isRequiredToday: true
      };
    }
    
    // Ainda não perdeu nenhum dia, manter streak
    return {
      currentStreak: habit.streak,
      shouldReset: false,
      isNewRecord: false,
      isRequiredToday: true
    };
  }
  
  private static getLastRequiredDay(frequency: HabitFrequency, today: Date): Date | null {
    // Implementar lógica para encontrar último dia obrigatório
    // que deveria ter sido completado mas não foi
  }
}
```

### **Atualização no `habitService.ts`**

```typescript
export const completeHabit = async (habitId: string, userId: string, data: CompleteHabitRequest) => {
  // ... código existente ...
  
  // NOVA LÓGICA - Substituir linhas 205-225
  const streakResult = HabitSequentialCalculator.calculateSequentialStreak(
    habit,
    [...habit.completions, completion],
    today
  );
  
  let newStreak = streakResult.currentStreak;
  let newBestStreak = Math.max(habit.bestStreak, newStreak);
  
  // Só atualizar se for dia obrigatório
  if (streakResult.isRequiredToday) {
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        streak: newStreak,
        bestStreak: newBestStreak
      }
    });
    console.log(`✅ Streak atualizado: ${newStreak} (recorde: ${newBestStreak})`);
  } else {
    console.log(`ℹ️ Hoje não é dia obrigatório, streak mantido: ${habit.streak}`);
  }
};
```

### **Verificação Diária de Reset**

```typescript
// jobs/dailyHabitStreakCheck.ts
export async function checkDailyHabitStreaks(): Promise<void> {
  console.log('🔍 Verificando streaks de hábitos não-diários...');
  
  const allHabits = await prisma.habit.findMany({
    where: { isActive: true },
    include: { frequency: true, completions: true }
  });
  
  const today = new Date();
  
  for (const habit of allHabits) {
    // Só verificar hábitos não-diários
    if (habit.frequency?.type === 'daily') continue;
    
    const isRequiredToday = HabitSequentialCalculator.isRequiredToday(
      habit.frequency!,
      today
    );
    
    if (!isRequiredToday) continue; // Hoje não é dia dele
    
    const hasCompletedToday = habit.completions.some(c => 
      isSameDay(c.date, today)
    );
    
    if (!hasCompletedToday) {
      // Não completou em dia obrigatório, resetar
      await prisma.habit.update({
        where: { id: habit.id },
        data: { streak: 0 }
      });
      
      console.log(`🔄 Reset streak: ${habit.name} (era ${habit.streak})`);
    }
  }
}
```

---

## 🎯 Integração com Página do Bombeiro

### **Filtro Inteligente**

```typescript
// services/bombeiroService.ts
export async function getTodayHabits(userId: string): Promise<Habit[]> {
  const today = new Date();
  const allHabits = await getUserHabits(userId);
  
  // Filtrar apenas hábitos que são para hoje
  const todayHabits = allHabits.filter(habit => {
    return HabitSequentialCalculator.isRequiredToday(habit.frequency, today);
  });
  
  console.log(`📋 Hábitos para hoje: ${todayHabits.length}/${allHabits.length}`);
  return todayHabits;
}
```

### **Display de Streak**

```tsx
// components/bombeiro/HabitCard.tsx
function HabitCard({ habit }: { habit: Habit }) {
  return (
    <div className="habit-card">
      <h3>{habit.name}</h3>
      <div className="streak-info">
        <span className="current">🔥 {habit.streak}</span>
        <span className="best">🏆 {habit.bestStreak}</span>
      </div>
      <button onClick={() => completeHabit(habit.id)}>
        Completar Hoje
      </button>
    </div>
  );
}
```

---

## 🧪 Cenários de Teste

### **Teste 1: Hábito Semanal Básico**
```
Hábito: "Tirar lixo" (Seg, Qua, Sex)

Ação: Completar Segunda
Resultado: streak = 1 ✅

Ação: Verificar Terça
Resultado: Hábito NÃO aparece no bombeiro ✅

Ação: Completar Quarta  
Resultado: streak = 2 ✅

Ação: NÃO completar Sexta
Resultado: streak = 0, bestStreak = 2 ✅
```

### **Teste 2: Dias Úteis**
```
Hábito: "Estudar" (dias úteis)

Seg: ✅ → streak = 1
Ter: ✅ → streak = 2
Qua: ❌ → streak = 0, bestStreak = 2
Qui: ✅ → streak = 1
Sex: ✅ → streak = 2
Sab: (não aparece) → streak = 2
Dom: (não aparece) → streak = 2
Seg: ✅ → streak = 3
```

### **Teste 3: Intervalo**
```
Hábito: "Médico" (a cada 15 dias)

Dia 1: ✅ → streak = 1
Dias 2-14: (não aparece)
Dia 15: ✅ → streak = 2
Dia 32: ✅ → streak = 0 (perdeu prazo do dia 30)
```

---

## 📱 Interface do Usuário

### **Indicadores Visuais**

#### **Na Página Principal**
```
🔥 Hábitos de Hoje:
┌─────────────────────────────┐
│ 🗑️ Tirar lixo (Seg, Qua, Sex)│
│ Sequência: 2 dias 🔥        │
│ Recorde: 5 dias 🏆         │
│ [Completar] [Pular]        │
└─────────────────────────────┘

📅 Próximos hábitos:
- Tirar lixo: Sexta-feira
- Academia: Segunda-feira
```

#### **Calendário de Hábitos**
```
        Ago 2025
  D  S  T  Q  Q  S  S
           1  2  3  4
  5  6  7  8  9 10 11
 12 13 14 15 16 17 18

🗑️ = Seg, Qua, Sex (✅✅❌)
💪 = Ter, Qui, Sab (✅❌⭐)

Legenda: ✅=feito ❌=perdeu ⭐=próximo
```

### **Notificações Inteligentes**
```typescript
// Apenas notificar em dias obrigatórios
if (HabitSequentialCalculator.isRequiredToday(habit.frequency, today)) {
  sendNotification(`🔔 Hoje é dia de: ${habit.name} (streak: ${habit.streak})`);
}
```

---

## 🚀 Migração e Implementação

### **Fase 1: Core Logic**
1. ✅ Criar `HabitSequentialCalculator.ts`
2. ✅ Implementar `isRequiredToday()`
3. ✅ Implementar `calculateSequentialStreak()`
4. ✅ Atualizar `habitService.ts`

### **Fase 2: Interface**
1. ✅ Filtrar hábitos na página do bombeiro
2. ✅ Mostrar apenas hábitos de hoje
3. ✅ Indicadores visuais de streak

### **Fase 3: Automação**
1. ✅ Job diário de reset
2. ✅ Notificações inteligentes
3. ✅ Recálculo de streaks existentes

---

## 📊 Vantagens desta Abordagem

### **Para o Usuário:**
✅ **Lógica intuitiva** - cada dia completado = +1  
✅ **Sem confusão** - hábito só aparece quando necessário  
✅ **Motivação contínua** - streak cresce linearmente  
✅ **Flexibilidade real** - diferentes padrões suportados  

### **Para o Sistema:**
✅ **Implementação simples** e clara  
✅ **Performance otimizada** - filtragem inteligente  
✅ **Manutenção fácil** - lógica centralizada  
✅ **Extensível** - suporte a novos tipos  

---

## 🎯 Resultado Esperado

**Sistema com lógica sequencial precisa:**

📅 **Hábitos aparecem apenas em dias configurados**  
🔥 **Streak cresce linearmente** (+1 por dia completado)  
❌ **Reset apenas quando perde dia obrigatório**  
🏆 **Recorde sempre preservado**  
🎯 **Motivação adequada** ao padrão do hábito  

**Experiência intuitiva e motivadora para todos os tipos de hábito! 🚀**