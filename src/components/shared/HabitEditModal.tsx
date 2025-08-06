'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Trash2, Palette, Hash } from 'lucide-react';
import { useUpdateHabit, useDeleteHabit } from '@/hooks/api/useHabits';
import type { Habit } from '@/types/habit';

interface HabitEditModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const ICONS = [
  '💧', '🏃', '📚', '🧘', '🍎', '💤', '🎯', '💪', '🌱', '🔥',
  '⭐', '🎨', '🎵', '📝', '🌿', '🏋️', '🚶', '🍃', '⚡', '✨'
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'custom', label: 'Personalizado' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Seg', full: 'Segunda' },
  { value: 2, label: 'Ter', full: 'Terça' },
  { value: 3, label: 'Qua', full: 'Quarta' },
  { value: 4, label: 'Qui', full: 'Quinta' },
  { value: 5, label: 'Sex', full: 'Sexta' },
  { value: 6, label: 'Sáb', full: 'Sábado' }
];

export function HabitEditModal({ habit, isOpen, onClose }: HabitEditModalProps) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [icon, setIcon] = useState(habit.icon);
  const [color, setColor] = useState(habit.color);
  const [targetCount, setTargetCount] = useState(habit.targetCount || 1);
  const [frequency, setFrequency] = useState(habit.frequency?.type || 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(habit.frequency?.daysOfWeek || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();

  useEffect(() => {
    if (isOpen) {
      setName(habit.name);
      setDescription(habit.description || '');
      setIcon(habit.icon);
      setColor(habit.color);
      setTargetCount(habit.targetCount || 1);
      setFrequency(habit.frequency?.type || 'daily');
      setDaysOfWeek(habit.frequency?.daysOfWeek || []);
      setShowDeleteConfirm(false);
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateHabitMutation.mutateAsync({
        habitId: habit.id,
        updates: {
          name,
          description,
          icon,
          color,
          targetCount,
          frequency: {
            type: frequency as any,
            intervalDays: 1,
            daysOfWeek: frequency === 'daily' ? [] : daysOfWeek
          }
        }
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log('Tentando excluir hábito:', habit.id);
      await deleteHabitMutation.mutateAsync(habit.id);
      console.log('Hábito excluído com sucesso');
      onClose();
    } catch (error: any) {
      console.error('Erro ao excluir hábito:', error);
      alert(`Erro ao excluir hábito: ${error?.response?.data?.error || error?.message || 'Erro desconhecido'}`);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-lg">{habit.icon}</span>
              </div>
              <h2 className="text-xl font-semibold">Editar Hábito</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1">
            Ajuste seu hábito para melhor se adequar à sua rotina
          </p>
        </div>

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
            {/* Nome e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Hábito *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descrição opcional"
                />
              </div>
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone
              </label>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      icon === iconOption
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ou digite um emoji personalizado"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="flex items-center space-x-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      color === colorOption
                        ? 'ring-2 ring-gray-400 ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Meta Diária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta diária (quantas vezes por dia)
              </label>
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">vezes por dia</span>
              </div>
            </div>

            {/* Frequência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="daily">Todos os dias</option>
                <option value="weekly">Semanalmente</option>
                <option value="custom">Dias específicos</option>
              </select>
            </div>

            {/* Dias da semana */}
            {(frequency === 'weekly' || frequency === 'custom') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias da Semana
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className={`p-2 text-sm rounded-lg transition-all ${
                        daysOfWeek.includes(day.value)
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            </div>

            {/* Actions */}
            <div className="flex justify-between space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateHabitMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateHabitMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Confirmação de exclusão */
          <div className="p-6 overflow-y-auto flex-1">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Excluir Hábito
              </h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir o hábito <strong>"{habit.name}"</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteHabitMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteHabitMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Excluindo...
                  </span>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}