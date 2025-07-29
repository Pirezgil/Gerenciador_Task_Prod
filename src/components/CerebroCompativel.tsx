'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Settings, User, LogOut, Menu, X, Home, Wrench, Building, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Importar páginas
import { BombeiroPage } from '@/components/bombeiro/BombeiroPage';
import { ArquitetoPage } from '@/components/arquiteto/ArquitetoPage';
import { CaixaDeAreiaPage } from '@/components/caixa-de-areia/CaixaDeAreiaPage';

// Importar modais
import { CaptureModal } from '@/components/protocols/CaptureModal';

type TabType = 'bombeiro' | 'arquiteto' | 'caixa-de-areia';

interface Tab {
  id: TabType;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const tabs: Tab[] = [
  {
    id: 'bombeiro',
    name: 'Bombeiro',
    icon: <Home className="w-4 h-4" />,
    color: 'from-red-500 to-orange-500',
    hoverColor: 'hover:from-red-600 hover:to-orange-600'
  },
  {
    id: 'arquiteto',
    name: 'Arquiteto',
    icon: <Building className="w-4 h-4" />,
    color: 'from-blue-500 to-cyan-500',
    hoverColor: 'hover:from-blue-600 hover:to-cyan-600'
  },
  {
    id: 'caixa-de-areia',
    name: 'Caixa de Areia',
    icon: <Box className="w-4 h-4" />,
    color: 'from-yellow-500 to-amber-500',
    hoverColor: 'hover:from-yellow-600 hover:to-amber-600'
  }
];

export function CerebroCompativel() {
  const [activeTab, setActiveTab] = useState<TabType>('bombeiro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'bombeiro': return '🚒 Painel do Bombeiro';
      case 'arquiteto': return '🏗️ Aba do Arquiteto';
      case 'caixa-de-areia': return '🏖️ Caixa de Areia';
      default: return 'Cérebro-Compatível';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bombeiro':
        return <BombeiroPage />;
      case 'arquiteto':
        return <ArquitetoPage />;
      case 'caixa-de-areia':
        return <CaixaDeAreiaPage />;
      default:
        return <BombeiroPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header melhorado */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título com melhor espaçamento */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Cérebro-Compatível
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {getTitle()}
                </p>
              </div>
            </div>

            {/* Navegação Desktop melhorada */}
            <nav className="hidden md:flex items-center space-x-2 bg-gray-100/50 dark:bg-gray-700/30 rounded-full p-1 backdrop-blur-sm">
              {tabs.map((tab) => (
                <motion.div key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 transition-all duration-300 ease-in-out rounded-full px-4 py-2
                      ${activeTab === tab.id 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.id === 'bombeiro' ? 'red' : tab.id === 'arquiteto' ? 'blue' : 'yellow'}-200/50 border-0` 
                        : `hover:bg-white/80 dark:hover:bg-gray-600/50 hover:shadow-md text-gray-700 dark:text-gray-300`
                      }
                    `}
                  >
                    <motion.div
                      animate={activeTab === tab.id ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {tab.icon}
                    </motion.div>
                    <span className="font-medium">{tab.name}</span>
                  </Button>
                </motion.div>
              ))}
            </nav>

            {/* Ações do usuário melhoradas */}
            <div className="flex items-center space-x-3">
              {/* Menu Mobile */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </Button>
              </div>

              {/* Botão Capturar melhorado */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCaptureModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-4"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  <span className="font-medium">Capturar</span>
                </Button>
              </motion.div>

              {/* User Menu melhorado */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-600 transition-all duration-200"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700">
                        <AvatarImage src="/api/placeholder/32/32" alt="Usuario" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-sm">
                          U
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-64 mt-2 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-xl" 
                  align="end" 
                  forceMount
                >
                  <div className="flex items-center space-x-3 p-3 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/api/placeholder/40/40" alt="Usuario" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Usuário</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">usuario@exemplo.com</p>
                    </div>
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/profile'}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="font-medium">Perfil</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gerencie sua conta</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/settings'}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="font-medium">Configurações</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preferências do sistema</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-2 bg-gray-200/50 dark:bg-gray-700/50" />
                  
                  <DropdownMenuItem 
                    onClick={() => console.log('Logout clicked - implementar depois')}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium">Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Menu melhorado */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md"
            >
              <div className="px-4 py-4 space-y-3">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full justify-start space-x-3 p-4 rounded-xl transition-all duration-300
                        ${activeTab === tab.id 
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.name}</span>
                    </Button>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCaptureModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-xl shadow-md"
                  >
                    <Wrench className="w-4 h-4" />
                    <span className="font-medium">Capturar</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content com animação melhorada */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Capture Modal */}
      <AnimatePresence>
        {showCaptureModal && (
          <CaptureModal
            isOpen={showCaptureModal}
            onClose={() => setShowCaptureModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Export default também para compatibilidade
export default CerebroCompativel;