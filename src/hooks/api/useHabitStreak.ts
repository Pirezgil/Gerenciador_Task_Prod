import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface HabitStreak {
  id: string;
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastCompleted: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useHabitStreak = () => {
  return useQuery({
    queryKey: ['habit-streak'],
    queryFn: async (): Promise<HabitStreak> => {
      const response = await api.get('/habit-streak/streak');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });
};