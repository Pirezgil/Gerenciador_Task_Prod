'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  preventBackdropClose?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ModernModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  preventBackdropClose = false,
  className
}: ModernModalProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl'
  };

  const handleBackdropClick = () => {
    if (!preventBackdropClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Modern Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={handleBackdropClick}
          />
          
          {/* Modern Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 30,
              mass: 0.8
            }}
            className={cn(
              'relative isolate bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-h-[92vh] overflow-hidden flex flex-col',
              'border-0 ring-1 ring-gray-200/30',
              maxWidthClasses[maxWidth],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ultra Modern Header */}
            <div className="relative z-20 overflow-hidden rounded-t-3xl flex-shrink-0">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                <div className="absolute inset-0 bg-black/5" />
              </div>
              
              {/* Header Content */}
              <div className="relative z-30 px-8 py-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    {Icon && (
                      <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                        className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-sm ring-1 ring-white/30"
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                    )}
                    <div className="space-y-1">
                      <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-2xl font-bold text-white tracking-tight"
                      >
                        {title}
                      </motion.h2>
                      {subtitle && (
                        <motion.p 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-white/90 text-sm font-medium"
                        >
                          {subtitle}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  
                  {showCloseButton && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      onClick={onClose}
                      className="group p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105 hover:rotate-90"
                      type="button"
                    >
                      <X className="w-5 h-5 text-white group-hover:text-white/90 transition-colors" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Subtle Divider Line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Modern Content Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative z-0 px-8 py-8 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/50 to-white/80"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MODERN ACTIONS CONTAINER
// ============================================================================

export interface ModernModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ModernModalActions({ children, className }: ModernModalActionsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn(
        'flex justify-end space-x-4 pt-8 mt-6',
        'border-t border-gray-200/60 bg-gradient-to-r from-gray-50/30 to-white/50',
        'rounded-b-lg -mx-8 px-8 pb-2',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// MODERN BUTTONS
// ============================================================================

export interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ModernButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className
}: ModernButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-violet-500/50 disabled:from-gray-300 disabled:to-gray-400',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-md hover:shadow-lg focus:ring-gray-400/50 disabled:bg-gray-50 disabled:text-gray-400',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500/50 disabled:from-gray-300 disabled:to-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 focus:ring-gray-400/30 disabled:text-gray-400'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && 'cursor-not-allowed opacity-60 hover:scale-100',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processando...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}