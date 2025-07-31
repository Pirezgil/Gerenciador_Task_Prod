'use client';

// ============================================================================
// SIDEBAR - Navegação lateral moderna com design responsivo
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Flame,
  Building2,
  Box,
  Settings,
  User,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      key: 'bombeiro',
      label: 'Bombeiro',
      description: 'Extintor de tarefas urgentes',
      icon: Flame,
      emoji: '🚒',
      path: '/bombeiro',
      color: 'bg-semantic-warning',
      bgColor: 'bg-semantic-warning/10 hover:bg-semantic-warning/20 border-semantic-warning/30',
      textColor: 'text-semantic-warning',
      iconColor: 'text-semantic-warning'
    },
    {
      key: 'arquiteto',
      label: 'Arquiteto',
      description: 'Construtor de projetos',
      icon: Building2,
      emoji: '🏗️',
      path: '/arquiteto', 
      color: 'bg-energia-alta',
      bgColor: 'bg-energia-alta/10 hover:bg-energia-alta/20 border-energia-alta/30',
      textColor: 'text-energia-alta',
      iconColor: 'text-energia-alta'
    },
    {
      key: 'caixa-de-areia',
      label: 'Caixa de Areia',
      description: 'Espaço criativo e experimental',
      icon: Box,
      emoji: '🏖️',
      path: '/caixa-de-areia',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-600'
    }
  ];

  const utilityItems = [
    {
      key: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/profile',
      color: 'text-text-primary-secondary hover:text-energia-normal'
    },
    {
      key: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      color: 'text-text-primary-secondary hover:text-energia-normal'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 sentinela-btn sentinela-btn-secondary rounded-xl shadow-soft hover:shadow-medium sentinela-transition"
      >
        <Menu className="w-5 h-5 text-text-primary-secondary" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 20 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-surface/95 backdrop-blur-xl shadow-large z-50 border-r border-border"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-text-primary-on-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-text-primary">Cérebro-Compatível</h2>
                      <p className="text-xs text-text-primary-muted">Sistema Inteligente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-text-primary-muted" />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <div className="responsive-nav space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <motion.button
                        key={item.key}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                          active 
                            ? `bg-gradient-to-r ${item.color} text-text-primary-on-primary shadow-lg` 
                            : item.bgColor
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-white/50'}`}>
                            <Icon className={`w-5 h-5 ${active ? 'text-text-primary-on-primary' : item.iconColor}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${active ? 'text-text-primary-on-primary' : item.textColor}`}>
                              {item.emoji} {item.label}
                            </div>
                            <div className={`text-sm ${active ? 'text-text-primary-on-primary/80' : 'text-text-primary-muted'}`}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Mobile Utility Items */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="space-y-1">
                    {utilityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.color} hover:bg-primary-50`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`hidden lg:flex flex-col h-screen bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-text-primary-on-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Cérebro-Compatível</h2>
                  <p className="text-xs text-text-primary-muted">Sistema Inteligente</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface rounded-lg transition-colors ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-text-primary-muted" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-text-primary-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                active 
                  ? `bg-gradient-to-r ${item.color} text-text-primary-on-primary shadow-lg transform scale-105` 
                  : item.bgColor
              }`}
              whileHover={{ scale: active ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
                <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-white/50'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-text-primary-on-primary' : item.iconColor}`} />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <div className={`font-semibold ${active ? 'text-text-primary-on-primary' : item.textColor}`}>
                        {item.emoji} {item.label}
                      </div>
                      <div className={`text-sm ${active ? 'text-text-primary-on-primary/80' : 'text-text-primary-muted'}`}>
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Utility Items */}
      <div className="p-4 border-t border-border">
        <div className="space-y-1">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all duration-200 ${item.color} hover:bg-primary-50`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}