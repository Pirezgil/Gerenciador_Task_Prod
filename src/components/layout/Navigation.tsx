'use client';

// ============================================================================
// NAVIGATION - Navegação entre páginas do sistema
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const pages = [
    { key: 'bombeiro', label: '🏎️ Bombeiro', color: 'blue', path: '/bombeiro' },
    { key: 'arquiteto', label: '🏗️ Arquiteto', color: 'purple', path: '/arquiteto' },
    { key: 'tarefas', label: '📋 Tarefas', color: 'green', path: '/tarefas' },
    { key: 'recompensas', label: '🏆 Recompensas', color: 'amber', path: '/recompensas' },
    { key: 'caixa-de-areia', label: '🏖️ Caixa de Areia', color: 'indigo', path: '/caixa-de-areia' }
  ] as const;

  const getPageColors = (pageKey: string, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 theme-button-text shadow-lg shadow-blue-500/25 transform scale-105'
        : 'theme-text-secondary hover:bg-blue-50 hover:text-blue-700',
      purple: isActive 
        ? 'bg-gradient-to-r from-purple-500 to-purple-600 theme-button-text shadow-lg shadow-purple-500/25 transform scale-105'
        : 'theme-text-secondary hover:bg-purple-50 hover:text-purple-700',
      indigo: isActive 
        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 theme-button-text shadow-lg shadow-indigo-500/25 transform scale-105'
        : 'theme-text-secondary hover:bg-indigo-50 hover:text-indigo-700',
      amber: isActive 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 theme-button-text shadow-lg shadow-amber-500/25 transform scale-105'
        : 'theme-text-secondary hover:bg-amber-50 hover:text-amber-700',
      green: isActive 
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 theme-button-text shadow-lg shadow-green-500/25 transform scale-105'
        : 'theme-text-secondary hover:bg-green-50 hover:text-green-700',
    };

    const page = pages.find(p => p.key === pageKey);
    return page ? colors[page.color] : colors.blue;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="flex space-x-2 bg-gray-100/70 backdrop-blur-sm p-1.5 rounded-2xl">
      {pages.map((page) => {
        const isActive = pathname === page.path;
        
        return (
          <motion.button
            key={page.key}
            onClick={() => handleNavigation(page.path)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${getPageColors(page.key, isActive)}`}
            whileHover={{ scale: isActive ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {page.label}
          </motion.button>
        );
      })}
    </nav>
  );
}