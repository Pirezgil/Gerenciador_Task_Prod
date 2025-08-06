// ============================================================================
// PÁGINA DE CONFIGURAÇÕES - Configurações do sistema e personalização
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Bell, Shield, Download, Zap, Brain, Battery } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { ThemeCustomizer } from '@/components/profile/ThemeCustomizer';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { DataManagement } from '@/components/profile/DataManagement';

type TabType = 'appearance' | 'notifications' | 'security' | 'data';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const { currentTheme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['appearance', 'notifications', 'security', 'data'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'appearance' as TabType, label: 'Aparência', icon: Palette },
    { id: 'notifications' as TabType, label: 'Notificações', icon: Bell },
    { id: 'security' as TabType, label: 'Segurança', icon: Shield },
    { id: 'data' as TabType, label: 'Dados', icon: Download },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <ThemeCustomizer />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataManagement />;
      default:
        return <ThemeCustomizer />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header da página */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-4xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Central de Configurações</h1>
                <p className="text-gray-300 mt-1">Personalize sua experiência no Sistema Sentinela</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && <Zap className="w-4 h-4 text-red-400" />}
                {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && <Brain className="w-4 h-4 text-blue-400" />}
                {user?.settings?.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && <Battery className="w-4 h-4 text-green-400" />}
                <span>Energia: {user?.settings?.dailyEnergyBudget || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegação lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id 
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Informações adicionais */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Dica do Sistema</h4>
              <p className="text-blue-700 text-xs leading-relaxed">
                {activeTab === 'appearance' && 'Personalize cores e estilos para uma experiência mais confortável.'}
                {activeTab === 'notifications' && 'Configure alertas inteligentes que respeitam seu foco.'}
                {activeTab === 'security' && 'Proteja suas informações com senhas seguras.'}
                {activeTab === 'data' && 'Mantenha seus dados organizados e seguros.'}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && 
                  React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, { className: "w-6 h-6 mr-3 text-purple-600" })
                }
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'appearance' && 'Customize a aparência e temas do sistema'}
                {activeTab === 'notifications' && 'Configure suas preferências de notificação'}
                {activeTab === 'security' && 'Gerencie segurança e privacidade'}
                {activeTab === 'data' && 'Importe, exporte e gerencie seus dados'}
              </p>
            </div>

            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}