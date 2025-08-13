'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Brain, BookOpen, Users, Settings } from 'lucide-react';
import { useHabitsStore } from '@/stores/habitsStore';
import { NewHabitModal } from './NewHabitModal';

interface HabitTemplatesProps {
  onSelectTemplate: () => void;
}

export function HabitTemplates({ onSelectTemplate }: HabitTemplatesProps) {
  const { templates, addHabit } = useHabitsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { id: 'health', label: 'Saúde', icon: Heart, color: 'red' },
    { id: 'productivity', label: 'Produtividade', icon: Settings, color: 'blue' },
    { id: 'mindfulness', label: 'Bem-estar', icon: Brain, color: 'purple' },
    { id: 'learning', label: 'Aprendizado', icon: BookOpen, color: 'green' },
    { id: 'social', label: 'Social', icon: Users, color: 'yellow' },
  ];

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.color || 'gray';
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Settings;
  };

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleCreateFromTemplate = (template: any) => {
    addHabit({
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      frequency: template.suggestedFrequency,
      targetCount: template.targetCount,
      daysOfWeek: template.suggestedFrequency.daysOfWeek,
      isActive: true,
    });
  };

  const groupedTemplates = categories.map(category => ({
    ...category,
    templates: templates.filter(t => t.category === category.id)
  })).filter(category => category.templates.length > 0);

  return (
    <div className="space-y-8">
      {groupedTemplates.map((category, categoryIndex) => {
        const Icon = category.icon;
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${category.color}-100`}>
                <Icon className={`w-5 h-5 text-${category.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.templates.map((template, templateIndex) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (categoryIndex * 0.1) + (templateIndex * 0.05) }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all group cursor-pointer"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: template.color }}
                    >
                      {template.icon}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateFromTemplate(template);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg"
                      title="Criar hábito rapidamente"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Frequência:</span>
                      <span className="font-medium">
                        {template.suggestedFrequency.type === 'daily' && 'Diário'}
                        {template.suggestedFrequency.type === 'weekly' && 'Semanal'}
                        {template.suggestedFrequency.type === 'custom' && 'Personalizado'}
                      </span>
                    </div>
                    
                    {template.targetCount && (
                      <div className="flex items-center justify-between">
                        <span>Meta:</span>
                        <span className="font-medium">{template.targetCount}x por dia</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Personalizar e Criar →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum modelo disponível</h3>
          <p className="text-gray-600">Os modelos de hábitos aparecerão aqui quando estiverem prontos.</p>
        </div>
      )}

      {/* Dica para modelos personalizados */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
        <p className="text-blue-700 text-sm">
          Estes são modelos pré-configurados para começar rapidamente. Você pode personalizar qualquer aspecto antes de criar o hábito, ou criar um completamente do zero clicando em &ldquo;Novo Hábito&rdquo;.
        </p>
      </div>

      {/* Modal */}
      <NewHabitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
}