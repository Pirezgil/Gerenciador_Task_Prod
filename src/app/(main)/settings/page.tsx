// ============================================================================
// PÁGINA DE CONFIGURAÇÕES - Configurações do sistema e personalização
// ============================================================================

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Bell, Shield, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { ThemeCustomizer } from '@/components/profile/ThemeCustomizer';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { DataManagement } from '@/components/profile/DataManagement';

type TabType = 'appearance' | 'notifications' | 'security' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const { user } = useAuthStore();
  const { currentTheme } = useThemeStore();

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegação lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sticky top-24">
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%)` }}
              >
                <Settings className="w-6 h-6 text-text-primary-on-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Configurações</h3>
                <p className="text-sm text-text-secondary">Sistema e preferências</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-energia-normal/20 text-energia-normal' : 'text-text-secondary hover:bg-surface'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
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
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}