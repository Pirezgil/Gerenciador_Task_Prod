'use client';

// ============================================================================
// SIDEBAR - Navegação lateral moderna e acessível
// Redesign seguindo heurísticas de Nielsen e princípios de UI/UX modernos
// Design System: Grid 8px, Regra 60-30-10, Hierarquia tipográfica clara
// Foco em: Acessibilidade, Consistência Visual, Eficiência de Uso
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useEnergyBudget, useTasks } from '@/hooks/api/useTasks';
import { useAuth } from '@/providers/AuthProvider';
import { 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Building2,
  CheckSquare,
  Box,
  Target,
  Trophy,
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
    
    return undefined;
  }, [refetchEnergy]);
  
  // Debug: Verificar dados recebidos
  console.log('🔧 Sidebar Debug:', {
    totalTasks: allTasks.length,
    energyBudgetFromAPI: energyBudget,
    plannedTasks: allTasks.filter(t => t.plannedForToday === true).length
  });
  const { user } = useAuth();

  // Usar dados do backend diretamente
  const sidebarEnergyData = useMemo(() => {
    return {
      used: energyBudget.used,
      remaining: energyBudget.remaining,
      total: energyBudget.total
    };
  }, [energyBudget]);

  // Navegação principal com design system unificado
  const navigationItems = [
    {
      key: 'bombeiro',
      label: 'Bombeiro',
      description: 'Urgências do dia',
      icon: Flame,
      path: '/bombeiro',
      energyType: 'baixa',
      primary: true
    },
    {
      key: 'arquiteto',
      label: 'Arquiteto', 
      description: 'Planejamento estratégico',
      icon: Building2,
      path: '/arquiteto',
      energyType: 'alta',
      primary: true
    },
    {
      key: 'tarefas',
      label: 'Tarefas',
      description: 'Gestão de atividades',
      icon: CheckSquare,
      path: '/tarefas',
      energyType: 'normal',
      primary: true
    },
    {
      key: 'habitos',
      label: 'Hábitos',
      description: 'Rotinas diárias',
      icon: Target,
      path: '/habitos',
      energyType: 'normal',
      primary: false
    },
    {
      key: 'recompensas',
      label: 'Recompensas',
      description: 'Sistema de conquistas',
      icon: Trophy,
      path: '/recompensas',
      energyType: 'baixa',
      primary: false
    },
    {
      key: 'caixa-de-areia',
      label: 'Pátio das ideias',
      description: 'Registre seus pensamentos',
      icon: Box,
      path: '/caixa-de-areia',
      energyType: 'baixa',
      primary: false
    }
  ];

  // Utilitários com design consistente
  const utilityItems = [
    {
      key: 'settings',
      label: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      path: '/settings'
    }
  ];
  
  // Função para obter status de energia com design unificado
  const getEnergyStatus = () => {
    const percentage = (sidebarEnergyData.used / sidebarEnergyData.total) * 100;
    if (percentage < 30) return { 
      icon: Battery, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-200',
      barColor: 'bg-emerald-400',
      label: 'Energia Alta' 
    };
    if (percentage < 70) return { 
      icon: Brain, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      barColor: 'bg-blue-400',
      label: 'Energia Normal' 
    };
    return { 
      icon: Zap, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-200',
      barColor: 'bg-amber-400',
      label: 'Energia Baixa' 
    };
  };
  
  const energyStatus = getEnergyStatus();

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  // Animações otimizadas com timing consistente - removido sidebarVariants pois não estava sendo usado

  const contentVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    collapsed: { opacity: 0, x: -16, transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    })
  };

  // Mobile Sidebar com design system unificado
  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button - Design acessível */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        <Button
          onClick={() => setIsMobileOpen(true)}
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5 text-gray-700" />
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
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
            />
            
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 border-r border-gray-200"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header com hierarquia visual clara */}
                <motion.div 
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div 
                        className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm overflow-hidden cursor-pointer hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        onClick={() => handleNavigation('/profile')}
                        role="button"
                        tabIndex={0}
                      >
                        {user?.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt="Foto do usuário"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">{user?.name || 'Usuário'}</h2>
                      <p className="text-xs text-gray-500">Perfil e configurações</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setIsMobileOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      aria-label="Fechar menu"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </Button>
                  </motion.div>
                </motion.div>
                
                {/* Status de Energia - Design system consistente */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`mb-6 p-4 ${energyStatus.bgColor} rounded-xl border ${energyStatus.borderColor}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <energyStatus.icon className={`w-5 h-5 ${energyStatus.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{energyStatus.label}</p>
                      <p className="text-xs text-gray-600">{sidebarEnergyData.remaining} de {sidebarEnergyData.total} disponível</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(sidebarEnergyData.remaining / sidebarEnergyData.total) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-1.5 rounded-full ${energyStatus.barColor}`}
                    />
                  </div>
                </motion.div>

                {/* Mobile Navigation Items - Design system aplicado */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isPrimary = item.primary;
                    
                    return (
                      <motion.div
                        key={item.key}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ 
                          scale: 1.01,
                          transition: { duration: 0.15 }
                        }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button
                          onClick={() => handleNavigation(item.path)}
                          variant="ghost"
                          className={`relative w-full p-3 rounded-xl transition-all duration-200 text-left group h-auto focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            active 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : isPrimary 
                              ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                        <div className="flex items-center">
                          <div className="w-12 flex justify-center flex-shrink-0">
                            <div className={`p-2 rounded-lg transition-all duration-200 ${
                              active 
                                ? 'bg-white/20' 
                                : isPrimary
                                ? 'bg-white border border-gray-200 group-hover:border-gray-300'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              <Icon className={`w-5 h-5 transition-colors ${
                                active 
                                  ? 'text-white' 
                                  : isPrimary
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 ml-3">
                            <div className={`font-semibold text-sm transition-colors ${
                              active 
                                ? 'text-white' 
                                : 'text-gray-900'
                            }`}>
                              {item.label}
                            </div>
                            <div className={`text-xs transition-colors truncate ${
                              active 
                                ? 'text-white/80' 
                                : 'text-gray-500'
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

                {/* Mobile Utility Items - Design consistente */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-1">
                    {utilityItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <motion.div
                          key={item.key}
                          whileHover={{ x: 2, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleNavigation(item.path)}
                            variant="ghost"
                            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group h-auto justify-start focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              active ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                          >
                          <div className="w-12 flex justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-gray-600 transition-transform group-hover:scale-105" />
                          </div>
                          <div className="flex-1 text-left ml-3">
                            <div className="font-medium text-sm text-gray-700">{item.label}</div>
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

  // Desktop Sidebar - Design system unificado
  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex flex-col h-full min-h-screen bg-white border-r border-gray-200 shadow-sm fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      } ${className}`}
    >
      {/* Header - Design limpo e funcional */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200`}>
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
                  className="w-8 h-8 bg-blue-600 rounded-lg overflow-hidden cursor-pointer hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 flex items-center justify-center"
                  onClick={() => handleNavigation('/profile')}
                  role="button"
                  tabIndex={0}
                >
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Perfil do usuário"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'Usuário'}</div>
                  <div className="text-xs text-gray-500">Perfil e configurações</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="ml-auto"
          >
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </Button>
          </motion.div>
        </div>
        
        {/* Status de Energia Desktop - Design system aplicado */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className={`mt-4 p-3 ${energyStatus.bgColor} rounded-xl border ${energyStatus.borderColor}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <energyStatus.icon className={`w-4 h-4 ${energyStatus.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{energyStatus.label}</p>
                  <p className="text-xs text-gray-600">{sidebarEnergyData.remaining} de {sidebarEnergyData.total} disponível</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(sidebarEnergyData.remaining / sidebarEnergyData.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-1.5 rounded-full ${energyStatus.barColor}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items - Design system aplicado */}
      <div className={`flex-1 ${isCollapsed ? 'p-3' : 'p-6'} space-y-2 overflow-y-auto`}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isPrimary = item.primary;
          
          return (
            <motion.div
              key={item.key}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                onClick={() => handleNavigation(item.path)}
                variant="ghost"
                title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                className={`relative w-full p-3 rounded-xl transition-all duration-200 text-left group h-auto focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  active 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : isPrimary 
                    ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
              <div className="flex items-center">
                <div className="w-12 flex justify-center flex-shrink-0">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-white/20' 
                      : isPrimary
                      ? 'bg-white border border-gray-200 group-hover:border-gray-300'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${
                      active 
                        ? 'text-white' 
                        : isPrimary
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1 min-w-0 ml-3"
                    >
                      <div className={`font-semibold text-sm transition-colors ${
                        active 
                          ? 'text-white' 
                          : 'text-gray-900'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-xs transition-colors truncate ${
                        active 
                          ? 'text-white/80' 
                          : 'text-gray-500'
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

      {/* Utility Items - Design system aplicado */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-t border-gray-200`}>
        <div className="space-y-1">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.key}
                whileHover={{ 
                  x: isCollapsed ? 0 : 2, 
                  scale: isCollapsed ? 1.02 : 1,
                  transition: { duration: 0.15 } 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleNavigation(item.path)}
                  variant="ghost"
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group h-auto focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    active ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                >
                <div className="w-12 flex justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-600 transition-transform group-hover:scale-105" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1 text-left min-w-0 ml-3"
                    >
                      <div className="font-medium text-sm text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
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