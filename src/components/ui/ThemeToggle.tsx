'use client';

// ============================================================================
// THEME TOGGLE - Botão universal para alternar modo escuro
// ============================================================================

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ThemeToggle({ 
  variant = 'icon', 
  size = 'default',
  className = '' 
}: ThemeToggleProps) {
  const { isDark, toggleDarkMode, setDarkMode, isSystemDark } = useTheme();
  
  // Variant simples - apenas ícone
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : 'icon'}
        onClick={toggleDarkMode}
        className={`sentinela-transition hover:bg-primary-50 dark:hover:bg-primary-900/20 ${className}`}
        title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        ) : (
          <Moon className="w-4 h-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        )}
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }
  
  // Variant botão com texto
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleDarkMode}
        className={`sentinela-transition ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 mr-2" />
            Modo Claro
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 mr-2" />
            Modo Escuro
          </>
        )}
      </Button>
    );
  }
  
  // Variant dropdown com opções
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`sentinela-transition ${className}`}
          >
            {isDark ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span className="sr-only">Opções de tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="sentinela-card">
          <DropdownMenuItem 
            onClick={() => setDarkMode(false)}
            className="sentinela-transition"
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Modo Claro</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDarkMode(true)}
            className="sentinela-transition"
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Modo Escuro</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDarkMode(isSystemDark)}
            className="sentinela-transition"
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return null;
}

// Componente simplificado para casos específicos
export function DarkModeToggle({ className = '' }: { className?: string }) {
  return <ThemeToggle variant="icon" className={className} />;
}
