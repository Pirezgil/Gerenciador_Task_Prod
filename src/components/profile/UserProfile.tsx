'use client';

// ============================================================================
// USER PROFILE - Configurações de perfil do usuário
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Clock, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function UserProfile() {
  const { user, updateSettings, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.settings.timezone || 'America/Sao_Paulo',
    dailyEnergyBudget: user?.settings.dailyEnergyBudget || 12,
  });

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
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Informações do Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar e Nome */}
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                placeholder="Seu nome"
              />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{user?.name || 'Usuário'}</h3>
            )}
            <p className="text-gray-600 mt-1">Usuário do Cérebro-Compatível</p>
          </div>
        </div>

        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.email}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>Fuso Horário</span>
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {timezones.find(tz => tz.value === user?.settings.timezone)?.label || 'Brasília (GMT-3)'}
              </p>
            )}
          </div>

          {/* Orçamento de Energia */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              <span>Orçamento Diário de Energia</span>
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="6"
                  max="20"
                  value={formData.dailyEnergyBudget}
                  onChange={(e) => setFormData({ ...formData, dailyEnergyBudget: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-blue-600 w-12 text-center">
                  {formData.dailyEnergyBudget}
                </span>
              </div>
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user?.settings.dailyEnergyBudget} pontos de energia
              </p>
            )}
          </div>

          {/* Data de criação */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Membro desde</span>
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
            </p>
          </div>
        </div>

        {/* Estatísticas do usuário */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Tarefas Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Projetos Criados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Dias de Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
