import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitCompletion, HabitStats, HabitTemplate } from '@/types/habit';

// ============================================================================
// HABITS STORE - Gerenciamento de hábitos
// ============================================================================

interface HabitsState {
  habits: Habit[];
  todayCompletions: HabitCompletion[];
  templates: HabitTemplate[];
  showCompletionAnimation: boolean;
  completionAnimationData: { habitName: string; streak: number } | null;
  
  // Ações
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'completions'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitActive: (habitId: string) => void;
  
  // Completions
  completeHabit: (habitId: string, count?: number, notes?: string) => void;
  undoHabitCompletion: (habitId: string, date: string) => void;
  getHabitCompletionsForDate: (habitId: string, date: string) => HabitCompletion[];
  
  // Animation
  setCompletionAnimation: (show: boolean, data?: { habitName: string; streak: number }) => void;
  
  // Stats
  getHabitStats: (habitId: string) => HabitStats;
  getTodayHabits: () => Habit[];
  getHabitsForDate: (date: string) => Habit[];
  
  // Utils
  updateStreaks: () => void;
  initializeTemplates: () => void;
}

const defaultTemplates: HabitTemplate[] = [
  {
    id: 'water',
    name: 'Beber Água',
    description: 'Manter-se hidratado ao longo do dia',
    icon: '💧',
    color: '#3B82F6',
    category: 'health',
    suggestedFrequency: { type: 'daily', interval: 1 },
    targetCount: 8,
  },
  {
    id: 'exercise',
    name: 'Exercitar-se',
    description: 'Atividade física regular',
    icon: '🏃‍♂️',
    color: '#EF4444',
    category: 'health',
    suggestedFrequency: { type: 'custom', interval: 1, daysOfWeek: [1, 3, 5] },
  },
  {
    id: 'meditation',
    name: 'Meditar',
    description: 'Prática de mindfulness e meditação',
    icon: '🧘‍♀️',
    color: '#8B5CF6',
    category: 'mindfulness',
    suggestedFrequency: { type: 'daily', interval: 1 },
  },
  {
    id: 'reading',
    name: 'Ler',
    description: 'Leitura diária para aprendizado',
    icon: '📚',
    color: '#059669',
    category: 'learning',
    suggestedFrequency: { type: 'daily', interval: 1 },
  },
  {
    id: 'journal',
    name: 'Diário',
    description: 'Escrever pensamentos e reflexões',
    icon: '📝',
    color: '#D97706',
    category: 'mindfulness',
    suggestedFrequency: { type: 'daily', interval: 1 },
  },
];

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      todayCompletions: [],
      templates: defaultTemplates,
      showCompletionAnimation: false,
      completionAnimationData: null,

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: Date.now().toString(),
          streak: 0,
          bestStreak: 0,
          completions: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },

      updateHabit: (habitId, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
              : habit
          ),
        }));
      },

      deleteHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== habitId),
        }));
      },

      toggleHabitActive: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? { ...habit, isActive: !habit.isActive, updatedAt: new Date().toISOString() }
              : habit
          ),
        }));
      },

      completeHabit: (habitId, count = 1, notes) => {
        const today = new Date().toISOString().split('T')[0];
        const completionId = `${habitId}_${today}_${Date.now()}`;

        const newCompletion: HabitCompletion = {
          id: completionId,
          habitId,
          date: today,
          completedAt: new Date().toISOString(),
          count,
          notes,
        };

        set((state) => {
          const updatedHabits = state.habits.map((habit) => {
            if (habit.id === habitId) {
              const existingCompletion = habit.completions.find(c => c.date === today);
              let updatedCompletions;

              if (existingCompletion) {
                updatedCompletions = habit.completions.map(c =>
                  c.date === today
                    ? { ...c, count: c.count + count, completedAt: new Date().toISOString(), notes }
                    : c
                );
              } else {
                updatedCompletions = [...habit.completions, newCompletion];
              }

              return {
                ...habit,
                completions: updatedCompletions,
                updatedAt: new Date().toISOString(),
              };
            }
            return habit;
          });

          // Atualizar streaks após adicionar completion
          get().updateStreaks();

          // Encontrar o hábito atualizado para mostrar animação
          const updatedHabit = updatedHabits.find(h => h.id === habitId);
          if (updatedHabit) {
            // Disparar animação de conclusão
            get().setCompletionAnimation(true, {
              habitName: updatedHabit.name,
              streak: updatedHabit.streak
            });
          }

          return { habits: updatedHabits };
        });
      },

      undoHabitCompletion: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  completions: habit.completions.filter(c => c.date !== date),
                  updatedAt: new Date().toISOString(),
                }
              : habit
          ),
        }));

        // Atualizar streaks após remover completion
        get().updateStreaks();
      },

      getHabitCompletionsForDate: (habitId, date) => {
        const habit = get().habits.find(h => h.id === habitId);
        return habit ? habit.completions.filter(c => c.date === date) : [];
      },

      getHabitStats: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) {
          return {
            totalCompletions: 0,
            currentStreak: 0,
            bestStreak: 0,
            completionRate: 0,
            weeklyCompletions: 0,
            monthlyCompletions: 0,
          };
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const monthlyCompletions = habit.completions.filter(c => 
          new Date(c.date) >= thirtyDaysAgo
        ).length;

        const weeklyCompletions = habit.completions.filter(c => 
          new Date(c.date) >= sevenDaysAgo
        ).length;

        // Calcular taxa de conclusão baseada nos últimos 30 dias
        const completionRate = habit.frequency.type === 'daily' 
          ? (monthlyCompletions / 30) * 100
          : (monthlyCompletions / 12) * 100; // Aproximação para weekly

        return {
          totalCompletions: habit.completions.length,
          currentStreak: habit.streak,
          bestStreak: habit.bestStreak,
          completionRate: Math.min(completionRate, 100),
          weeklyCompletions,
          monthlyCompletions,
        };
      },

      getTodayHabits: () => {
        const today = new Date().getDay(); // 0 = domingo, 6 = sábado
        return get().habits.filter(habit => {
          if (!habit.isActive) return false;

          switch (habit.frequency.type) {
            case 'daily':
              return true;
            case 'weekly':
            case 'custom':
              return habit.frequency.daysOfWeek?.includes(today) || false;
            default:
              return false;
          }
        });
      },

      getHabitsForDate: (date) => {
        const targetDate = new Date(date).getDay();
        return get().habits.filter(habit => {
          if (!habit.isActive) return false;

          switch (habit.frequency.type) {
            case 'daily':
              return true;
            case 'weekly':
            case 'custom':
              return habit.frequency.daysOfWeek?.includes(targetDate) || false;
            default:
              return false;
          }
        });
      },

      updateStreaks: () => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            let currentStreak = 0;
            let tempStreak = 0;
            let maxStreak = 0;

            // Organizar completions por data
            const completionDates = habit.completions
              .map(c => c.date)
              .sort()
              .reverse(); // Mais recente primeiro

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Verificar se completou hoje ou ontem (para manter streak)
            let streakDate = today;
            if (!completionDates.includes(today)) {
              if (completionDates.includes(yesterday)) {
                streakDate = yesterday;
              } else {
                return { ...habit, streak: 0 }; // Quebrou a sequência
              }
            }

            // Calcular streak atual
            const startDate = new Date(streakDate);
            for (let i = 0; i < 365; i++) { // Máximo 1 ano
              const checkDate = new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

              if (completionDates.includes(checkDate)) {
                currentStreak++;
              } else {
                break;
              }
            }

            // Calcular melhor streak
            for (const date of completionDates) {
              tempStreak++;
              maxStreak = Math.max(maxStreak, tempStreak);
            }

            return {
              ...habit,
              streak: currentStreak,
              bestStreak: Math.max(habit.bestStreak, maxStreak),
            };
          }),
        }));
      },

      setCompletionAnimation: (show, data) => {
        set({
          showCompletionAnimation: show,
          completionAnimationData: data || null,
        });
      },

      initializeTemplates: () => {
        set((state) => ({
          templates: state.templates.length === 0 ? defaultTemplates : state.templates,
        }));
      },
    }),
    {
      name: 'gerenciador-habits-store',
      version: 1,
    }
  )
);