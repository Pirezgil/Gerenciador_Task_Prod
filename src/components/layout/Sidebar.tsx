'use client';

// ============================================================================
// SIDEBAR - Navegação lateral "Sentinela" 
// Seguindo princípios de design gentil e compassivo para usuários neurodivergentes
// Design Philosophy: "Assistente Gentil, Não um Chefe"
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useEnergyBudget, useTasks } from '@/hooks/api/useTasks';
import { useAuthStore } from '@/stores/authStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Flame,
  Building2,
  CheckSquare,
  Box,
  Target,
  Settings,
  User,
  Menu,
  X,
  Battery,
  Brain,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Hooks para dados - CORRIGIDO: usar dados consistentes
  const { data: energyBudget = { used: 0, remaining: 15, total: 15, completedTasks: 0 }, refetch: refetchEnergy } = useEnergyBudget();
  const { data: allTasks = [] } = useTasks();
  
  // Listener para atualizar energia quando settings mudarem
  useEffect(() => {
    const handleEnergyUpdate = () => {
      refetchEnergy();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('energy-budget-updated', handleEnergyUpdate);
      return () => window.removeEventListener('energy-budget-updated', handleEnergyUpdate);
    }
  }, [refetchEnergy]);
  
  // Debug: Verificar dados recebidos
  console.log('🔧 Sidebar Debug:', {
    totalTasks: allTasks.length,
    energyBudgetFromAPI: energyBudget,
    plannedTasks: allTasks.filter(t => t.plannedForToday === true).length
  });
  const { user } = useAuthStore();

  // Usar dados do backend diretamente
  const sidebarEnergyData = useMemo(() => {
    return {
      used: energyBudget.used,
      remaining: energyBudget.remaining,
      total: energyBudget.total
    };
  }, [energyBudget]);

  // Navegação principal seguindo filosofia "Sentinela"
  const navigationItems = [
    {
      key: 'bombeiro',
      label: 'Bombeiro',
      description: 'Extintor gentil de urgências',
      icon: Flame,
      emoji: '🚒',
      path: '/bombeiro',
      energyType: 'baixa',
      gradient: 'from-red-400/80 to-orange-500/80',
      bgColor: 'sentinela-card bg-red-50/50 hover:bg-red-100/50 border-red-200/30',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      hoverShadow: 'hover:shadow-red-500/10'
    },
    {
      key: 'arquiteto',
      label: 'Arquiteto', 
      description: 'Construtor de sonhos',
      icon: Building2,
      emoji: '🏗️',
      path: '/arquiteto',
      energyType: 'alta', 
      gradient: 'from-purple-400/80 to-indigo-500/80',
      bgColor: 'sentinela-card bg-purple-50/50 hover:bg-purple-100/50 border-purple-200/30',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      hoverShadow: 'hover:shadow-purple-500/10'
    },
    {
      key: 'tarefas',
      label: 'Tarefas',
      description: 'Central de ações gentis',
      icon: CheckSquare,
      emoji: '📋',
      path: '/tarefas',
      energyType: 'normal',
      gradient: 'from-green-400/80 to-emerald-500/80',
      bgColor: 'sentinela-card bg-green-50/50 hover:bg-green-100/50 border-green-200/30',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      hoverShadow: 'hover:shadow-green-500/10'
    },
    {
      key: 'habitos',
      label: 'Hábitos',
      description: 'Construa rotinas',
      icon: Target,
      emoji: '🎯',
      path: '/habitos',
      energyType: 'normal',
      gradient: 'from-teal-400/80 to-cyan-500/80',
      bgColor: 'sentinela-card bg-teal-50/50 hover:bg-teal-100/50 border-teal-200/30',
      textColor: 'text-teal-700',
      iconColor: 'text-teal-600',
      hoverShadow: 'hover:shadow-teal-500/10'
    },
    {
      key: 'caixa-de-areia',
      label: 'Caixa de Areia',
      description: 'Espaço criativo livre',
      icon: Box,
      emoji: '🏖️',
      path: '/caixa-de-areia',
      energyType: 'baixa',
      gradient: 'from-amber-400/80 to-orange-400/80',
      bgColor: 'sentinela-card bg-amber-50/50 hover:bg-amber-100/50 border-amber-200/30',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-600',
      hoverShadow: 'hover:shadow-amber-500/10'
    }
  ];

  // Utilitários com design gentil e acessível
  const utilityItems = [
    {
      key: 'settings',
      label: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-600 hover:text-blue-600',
      bgColor: 'hover:bg-blue-50/50'
    }
  ];
  
  // Função para obter ícone de energia baseado no orçamento híbrido
  const getEnergyIcon = () => {
    const percentage = (sidebarEnergyData.used / sidebarEnergyData.total) * 100;
    if (percentage < 30) return { icon: Battery, color: 'text-green-500', label: 'Energia Alta' };
    if (percentage < 70) return { icon: Brain, color: 'text-blue-500', label: 'Energia Normal' };
    return { icon: Zap, color: 'text-orange-500', label: 'Energia Baixa' };
  };
  
  const energyStatus = getEnergyIcon();

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  // Animações gentis e suaves seguindo diretrizes do projeto
  const sidebarVariants = {
    expanded: { width: 320 }, // Mais espaço para melhor legibilidade
    collapsed: { width: 88 }  // Ligeiramente maior para melhor usabilidade
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  // Mobile Sidebar com design "Sentinela"
  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button - Design gentil e acessível */}
      <motion.div
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        className="lg:hidden fixed top-6 left-6 z-50"
      >
        <Button
          onClick={() => setIsMobileOpen(true)}
          variant="ghost"
          size="icon"
          className="p-3 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </Button>
      </motion.div>

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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-r border-gray-200/50"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header gentil e acolhedor */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-8"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div 
                        className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-purple-500/80 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200"
                        onClick={() => handleNavigation('/profile')}
                      >
                        {user?.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt="Foto do usuário"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">{user?.name || 'Usuário'}</h2>
                      <p className="text-sm text-gray-500">Configurações pessoais</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={() => setIsMobileOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </Button>
                  </motion.div>
                </motion.div>
                
                {/* Status de Energia - Visual gentil */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
                >
                  <div className="flex items-center space-x-3">
                    <energyStatus.icon className={`w-5 h-5 ${energyStatus.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{energyStatus.label}</p>
                      <p className="text-xs text-gray-500">{sidebarEnergyData.remaining} de {sidebarEnergyData.total} disponível</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(sidebarEnergyData.remaining / sidebarEnergyData.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full ${sidebarEnergyData.remaining > sidebarEnergyData.total * 0.5 ? 'bg-green-400' : sidebarEnergyData.remaining > sidebarEnergyData.total * 0.2 ? 'bg-blue-400' : 'bg-orange-400'}`}
                    />
                  </div>
                </motion.div>

                {/* Mobile Navigation Items - Design compassivo */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <motion.div
                        key={item.key}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ 
                          scale: 1.02, 
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleNavigation(item.path)}
                          variant={active ? "default" : "ghost"}
                          className={`relative w-full p-3 rounded-2xl transition-all duration-300 text-left overflow-hidden group h-auto ${
                            active 
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl ${item.hoverShadow}` 
                              : `${item.bgColor} shadow-sm hover:shadow-md border transition-all duration-200`
                          }`}
                        >
                        {/* Background pattern sutil para item ativo */}
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                        )}
                        
                        <div className="relative z-10 flex items-center space-x-4">
                          <div className={`p-3 rounded-xl transition-all duration-200 ${
                            active 
                              ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                              : 'bg-white/70 group-hover:bg-white group-hover:shadow-md'
                          }`}>
                            <Icon className={`w-5 h-5 transition-colors ${
                              active 
                                ? 'text-white' 
                                : `${item.iconColor} group-hover:scale-110 transition-transform`
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold text-base transition-colors ${
                              active 
                                ? 'text-white' 
                                : `${item.textColor} group-hover:text-gray-800`
                            }`}>
                              <span className="mr-2">{item.emoji}</span>{item.label}
                            </div>
                            <div className={`text-sm transition-colors ${
                              active 
                                ? 'text-white/90' 
                                : 'text-gray-500 group-hover:text-gray-600'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile Utility Items - Design gentil */}
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="space-y-2">
                    {utilityItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.key}
                          whileHover={{ x: 4, transition: { duration: 0.2 } }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleNavigation(item.path)}
                            variant="ghost"
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${item.color} ${item.bgColor} group h-auto justify-start`}
                          >
                          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          </Button>
                        </motion.div>
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

  // Desktop Sidebar - Design "Sentinela"
  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex flex-col h-full min-h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/30 shadow-2xl fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[88px]' : 'w-80'
      } ${className}`}
    >
      {/* Header - Design acolhedor e gentil */}
      <div className="p-6 border-b border-gray-200/30">
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
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200 flex items-center justify-center"
                  onClick={() => handleNavigation('/profile')}
                >
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Perfil do usuário"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{user?.name || 'Usuário'}</div>
                  <div className="text-xs text-gray-500">Configurações pessoais</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="ml-auto"
          >
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </motion.div>
        </div>
        
        {/* Status de Energia Desktop - Apenas quando expandido */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
            >
              <div className="flex items-center space-x-3">
                <energyStatus.icon className={`w-5 h-5 ${energyStatus.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{energyStatus.label}</p>
                  <p className="text-xs text-gray-500">{sidebarEnergyData.remaining} de {sidebarEnergyData.total} disponível</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(sidebarEnergyData.remaining / sidebarEnergyData.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-2 rounded-full ${sidebarEnergyData.remaining > sidebarEnergyData.total * 0.5 ? 'bg-green-400' : sidebarEnergyData.remaining > sidebarEnergyData.total * 0.2 ? 'bg-blue-400' : 'bg-orange-400'}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items - Design compassivo e acessível */}
      <div className="flex-1 p-6 space-y-3 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.div
              key={item.key}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ 
                scale: active ? 1.03 : 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => handleNavigation(item.path)}
                variant={active ? "default" : "ghost"}
                title={isCollapsed ? item.label : undefined}
                className={`relative w-full p-3 rounded-2xl transition-all duration-300 text-left overflow-hidden group h-auto ${
                  active 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl transform scale-105 ${item.hoverShadow}` 
                    : `${item.bgColor} shadow-sm hover:shadow-lg border transition-all duration-200`
                }`}
              >
              {/* Background pattern sutil para item ativo */}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              )}
              
              <div className={`relative z-10 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
                <div className={`p-3 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                    : 'bg-white/70 group-hover:bg-white group-hover:shadow-md'
                }`}>
                  <Icon className={`w-5 h-5 transition-all duration-200 ${
                    active 
                      ? 'text-white' 
                      : `${item.iconColor} group-hover:scale-110`
                  }`} />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1"
                    >
                      <div className={`font-semibold text-base transition-colors ${
                        active 
                          ? 'text-white' 
                          : `${item.textColor} group-hover:text-gray-800`
                      }`}>
                        <span className="mr-2">{item.emoji}</span>{item.label}
                      </div>
                      <div className={`text-sm transition-colors ${
                        active 
                          ? 'text-white/90' 
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Utility Items - Design gentil e acessível */}
      <div className="p-6 border-t border-gray-200/30">
        <div className="space-y-2">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                whileHover={{ 
                  x: isCollapsed ? 0 : 4, 
                  scale: isCollapsed ? 1.05 : 1,
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleNavigation(item.path)}
                  variant="ghost"
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 ${item.color} ${item.bgColor} group h-auto`}
                  title={isCollapsed ? item.label : undefined}
                >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}