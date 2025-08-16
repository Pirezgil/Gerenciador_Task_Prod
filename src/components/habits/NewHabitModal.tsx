'use client';

import React, { useState } from 'react';
import { Target, Hash } from 'lucide-react';
import { useCreateHabit } from '@/hooks/api/useHabits';
import { StandardModal, StandardModalActions, StandardButton } from '@/components/shared/StandardModal';
import { ReminderPicker } from '@/components/reminders/ReminderPicker';
import type { HabitFrequency } from '@/types/habit';
import type { CreateReminderData } from '@/types/reminder';
import { useHabitNotifications, useAsyncNotification, useNotification } from '@/hooks/useNotification';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
}

export function NewHabitModal({ isOpen, onClose, template }: NewHabitModalProps) {
  const createHabitMutation = useCreateHabit();
  const [habitReminders, setHabitReminders] = useState<CreateReminderData[]>([]);
  
  // Hooks de notificação
  const habitNotifications = useHabitNotifications();
  const { withLoading } = useAsyncNotification();
  const { error } = useNotification();
  
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    icon: template?.icon || '🎯',
    color: template?.color || '#3B82F6',
    frequency: template?.suggestedFrequency || { type: 'daily' as const, interval: 1 },
    targetCount: template?.targetCount || undefined,
  });

  const [selectedDays, setSelectedDays] = useState<number[]>(
    template?.suggestedFrequency?.daysOfWeek || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const frequency: HabitFrequency = {
      ...formData.frequency,
      daysOfWeek: formData.frequency.type !== 'daily' ? selectedDays : undefined,
    };

    try {
      await withLoading(
        () => createHabitMutation.mutateAsync({
          ...formData,
          frequency,
          isActive: true,
          updatedAt: new Date().toISOString(),
          streak: 0,
          bestStreak: 0,
          completions: [],
        }),
        {
          loading: 'Criando hábito...',
          success: `Hábito "${formData.name}" criado!`
        },
        {
          context: 'habit_crud'
        }
      );

      handleClose();
    } catch (err) {
      error('Erro ao criar hábito', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'habit_crud'
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🎯',
      color: '#3B82F6',
      frequency: { type: 'daily', interval: 1 },
      targetCount: undefined,
    });
    setSelectedDays([]);
    setHabitReminders([]);
    onClose();
  };

  const predefinedIcons = ['🎯', '💪', '📚', '🧘‍♂️', '💧', '🏃‍♂️', '🥗', '🎨', '✍️', '🎵', '🧹', '💰', '📱', '😴', '🚶‍♂️'];
  const predefinedColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo Hábito"
      subtitle="Construa uma rotina saudável e consistente"
      icon={Target}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Nome e Descrição - MOBILE OTIMIZADO */}
                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Hábito *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                      placeholder="Ex: Beber água"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                      placeholder="Descrição opcional"
                    />
                  </div>
                </div>

                {/* Ícone - MOBILE OTIMIZADO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ícone
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 sm:gap-2 mb-3">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xl sm:text-lg transition-all ${
                          formData.icon === icon
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                    placeholder="Ou digite um emoji personalizado"
                  />
                </div>

                {/* Cor - MOBILE OTIMIZADO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cor
                  </label>
                  <div className="flex items-center space-x-3 flex-wrap gap-y-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-gray-400 ring-offset-2'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Frequência - MOBILE OTIMIZADO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      frequency: { ...formData.frequency, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm"
                  >
                    <option value="daily">Todos os dias</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="custom">Dias específicos</option>
                  </select>
                </div>

                {/* Dias da Semana - MOBILE OTIMIZADO */}
                {(formData.frequency.type === 'weekly' || formData.frequency.type === 'custom') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dias da Semana
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {dayLabels.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(index)}
                          className={`p-3 sm:p-2 text-sm rounded-lg transition-all min-h-[44px] sm:min-h-auto flex items-center justify-center ${
                            selectedDays.includes(index)
                              ? 'bg-green-100 text-green-700 border-2 border-green-500'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Diária - MOBILE OTIMIZADO */}
                <div>
                  <label className="flex items-start space-x-3 mb-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.targetCount !== undefined}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        targetCount: e.target.checked ? 1 : undefined 
                      })}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700 leading-relaxed">
                      Definir meta diária (quantas vezes por dia)
                    </span>
                  </label>
                  
                  {formData.targetCount !== undefined && (
                    <div className="flex items-center space-x-3 mt-3 p-3 bg-gray-50 rounded-lg">
                      <Hash className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.targetCount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          targetCount: parseInt(e.target.value) || 1 
                        })}
                        className="w-20 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm text-center"
                      />
                      <span className="text-sm text-gray-600 flex-1">vezes por dia</span>
                    </div>
                  )}
                </div>

                {/* Sistema de Lembretes Padronizado - MOBILE OTIMIZADO */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ReminderPicker
                    entityType="habit"
                    onRemindersChange={setHabitReminders}
                    initialReminders={habitReminders}
                    disabled={createHabitMutation.isPending}
                    maxReminders={5}
                  />
                </div>
              </div>

        {/* Ações do Modal - MOBILE OTIMIZADO E CENTRALIZADO */}
        <StandardModalActions className="flex-col sm:flex-row gap-4 items-center sm:justify-end">
          <StandardButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="w-full sm:w-auto order-2 sm:order-1 min-h-[48px] sm:min-h-auto"
          >
            Cancelar
          </StandardButton>
          <StandardButton
            type="submit"
            variant="primary"
            disabled={!formData.name.trim()}
            loading={createHabitMutation.isPending}
            className="w-full sm:w-auto order-1 sm:order-2 min-h-[48px] sm:min-h-auto"
          >
            Criar Hábito
          </StandardButton>
        </StandardModalActions>
      </form>
    </StandardModal>
  );
}