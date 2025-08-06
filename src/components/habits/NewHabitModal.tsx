'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Hash } from 'lucide-react';
import { useCreateHabit } from '@/hooks/api/useHabits';
import type { HabitFrequency } from '@/types/habit';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
}

export function NewHabitModal({ isOpen, onClose, template }: NewHabitModalProps) {
  const createHabitMutation = useCreateHabit();
  
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
      await createHabitMutation.mutateAsync({
        ...formData,
        frequency,
        isActive: true,
      });

      handleClose();
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
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
                  <Target className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Novo Hábito</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">
                Construa uma rotina saudável e consistente
              </p>
            </div>

            {/* Form */}
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
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
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
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
                      className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Frequência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      frequency: { ...formData.frequency, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Todos os dias</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="custom">Dias específicos</option>
                  </select>
                </div>

                {/* Dias da Semana */}
                {(formData.frequency.type === 'weekly' || formData.frequency.type === 'custom') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da Semana
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {dayLabels.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(index)}
                          className={`p-2 text-sm rounded-lg transition-all ${
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

                {/* Meta Diária */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.targetCount !== undefined}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        targetCount: e.target.checked ? 1 : undefined 
                      })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Definir meta diária (quantas vezes por dia)
                    </span>
                  </label>
                  
                  {formData.targetCount !== undefined && (
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.targetCount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          targetCount: parseInt(e.target.value) || 1 
                        })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">vezes por dia</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || createHabitMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createHabitMutation.isPending ? 'Criando...' : 'Criar Hábito'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}