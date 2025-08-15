// ============================================================================
// PÁGINA DE CONFIGURAÇÕES - Configurações do sistema e personalização
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Zap, Brain, Battery, ListTodo } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { Button } from '@/components/ui/button';

type TabType = 'notifications' | 'security';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const { user } = useAuth();

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['notifications', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'notifications' as TabType, label: 'Notificações', icon: Bell },
    { id: 'security' as TabType, label: 'Segurança', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simplificado */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Central de Configurações</h1>
                <p className="text-gray-600 mt-1">Personalize sua experiência no Sistema Sentinela</p>
              </div>
              
              {/* Métricas de Energia */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user?.settings?.dailyEnergyBudget || 0}</div>
                  <div className="text-sm text-gray-500">Energia Diária</div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && <Zap className="w-5 h-5 text-red-500" />}
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && <Brain className="w-5 h-5 text-blue-500" />}
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && <Battery className="w-5 h-5 text-green-500" />}
                  <span className="text-sm text-gray-600">Nível de Energia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Simplificada */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>

        {/* Conteúdo principal */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="mb-6">
            <p className="text-gray-600">
              {activeTab === 'notifications' && 'Configure suas preferências de notificação'}
              {activeTab === 'security' && 'Gerencie segurança e privacidade'}
            </p>
          </div>

          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}