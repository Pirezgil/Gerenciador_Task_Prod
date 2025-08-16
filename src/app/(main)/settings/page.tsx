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
      {/* Header Mobile-First Design */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate text-center sm:text-left">
                  Central de Configurações
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Personalize sua experiência no Sistema Sentinela
                </p>
              </div>
              
              {/* Métricas de Energia - Mobile Layout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 flex-shrink-0">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {user?.settings?.dailyEnergyBudget || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Energia Diária</div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && (
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  )}
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && (
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  )}
                  {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && (
                    <Battery className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-600">Nível de Energia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Navigation Mobile-First */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 sm:py-2 min-h-[44px] touch-manipulation text-sm sm:text-base"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Section Header - Mobile Optimized */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>

        {/* Main Content - Mobile-First Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6"
        >
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 text-sm sm:text-base">
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