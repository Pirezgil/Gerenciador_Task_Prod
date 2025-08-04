'use client';

// ============================================================================
// USER PROFILE - Configurações de perfil do usuário
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import { Save, Edit3, X, User, Mail, MapPin, Clock, Calendar, Brain, Zap, Battery, Award, Target, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTasksStore } from '../../stores/tasksStore';

export function UserProfile() {
  const { user, setUser } = useAuthStore();
  const { todayTasks, projects } = useTasksStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.settings.timezone || 'America/Sao_Paulo',
    dailyEnergyBudget: user?.settings.dailyEnergyBudget || 12,
  });

  // Calcular estatísticas
  const completedTasks = todayTasks.filter(task => task.status === 'completed').length;
  const totalProjects = projects.length;
  const totalTasks = todayTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        settings: {
          ...user.settings,
          timezone: formData.timezone,
          dailyEnergyBudget: formData.dailyEnergyBudget,
        },
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.settings.timezone || 'America/Sao_Paulo',
      dailyEnergyBudget: user?.settings.dailyEnergyBudget || 12,
    });
    setIsEditing(false);
  };

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/New_York', label: 'Nova York (GMT-5)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' },
  ];

  return (
    <div className="space-y-6">

      {/* Estatísticas em destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tarefas Hoje</p>
              <p className="text-2xl font-bold text-blue-600">{completedTasks}/{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projetos Ativos</p>
              <p className="text-2xl font-bold text-purple-600">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Energia Diária</p>
              <p className="text-2xl font-bold text-orange-600">{user?.settings.dailyEnergyBudget}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header com informações principais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 sm:mb-0">
            <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name || 'Usuário'}</h1>
              <p className="text-purple-600 text-sm mt-1">🧠 Cérebro Compatível • Sistema Sentinela</p>
              <p className="text-gray-500 text-xs mt-1">
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
              </p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Configurações pessoais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Configurações Pessoais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Nome</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Seu nome"
              />
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">
                {user?.name || 'Usuário'}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="seu@email.com"
              />
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900">
                {user?.email}
              </div>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>Fuso Horário</span>
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900">
                {timezones.find(tz => tz.value === user?.settings.timezone)?.label || 'Brasília (GMT-3)'}
              </div>
            )}
          </div>

          {/* Orçamento de Energia */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Zap className="w-4 h-4" />
              <span>Orçamento Diário de Energia</span>
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="6"
                    max="20"
                    value={formData.dailyEnergyBudget}
                    onChange={(e) => setFormData({ ...formData, dailyEnergyBudget: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-lg font-bold text-purple-600 w-12 text-center bg-purple-100 rounded-lg py-2">
                    {formData.dailyEnergyBudget}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>6 pontos</span>
                  <span>20 pontos</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 flex items-center justify-between">
                <span>{user?.settings.dailyEnergyBudget} pontos de energia</span>
                <div className="flex items-center space-x-1">
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && <Zap className="w-4 h-4 text-red-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && <Brain className="w-4 h-4 text-blue-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && <Battery className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
