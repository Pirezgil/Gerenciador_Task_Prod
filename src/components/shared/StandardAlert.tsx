'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AlertType = 'warning' | 'danger' | 'success' | 'error' | 'info';

interface StandardAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: AlertType;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    buttonClass: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200'
  },
  danger: {
    icon: Trash2,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    buttonClass: 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    buttonClass: 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    buttonClass: 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    buttonClass: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200'
  }
};

export const StandardAlert: React.FC<StandardAlertProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm
}) => {
  const config = alertConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${config.textColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">
                  {type === 'danger' && 'Esta ação não pode ser desfeita'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              {showCancel && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 rounded-md px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                variant="outline"
                size="sm"
                className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 rounded-md px-2 ${config.buttonClass}`}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para facilitar o uso
export const useStandardAlert = () => {
  const [alertState, setAlertState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    showCancel: boolean;
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancelar'
  });

  const showAlert = React.useCallback((
    title: string,
    message: string,
    type: AlertType = 'info',
    options?: {
      showCancel?: boolean;
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
    }
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      showCancel: options?.showCancel || false,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Cancelar',
      onConfirm: options?.onConfirm
    });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const AlertComponent = React.useCallback(() => (
    <StandardAlert
      {...alertState}
      onClose={hideAlert}
    />
  ), [alertState, hideAlert]);

  return {
    showAlert,
    hideAlert,
    AlertComponent
  };
};