'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Calendar, AlertTriangle } from 'lucide-react';

interface PostponeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  taskDescription: string;
  currentPostponementCount?: number;
}

export function PostponeConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  taskDescription,
  currentPostponementCount = 0 
}: PostponeConfirmModalProps) {
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingPostponements = 3 - currentPostponementCount;
  const isLastPostponement = remainingPostponements === 1;

  const handleConfirm = () => {
    setStep('reason');
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      handleClose();
    } catch (error) {
      console.error('Erro ao adiar tarefa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {step === 'confirm' ? 'Adiar Tarefa?' : 'Justificativa do Adiamento'}
                </h2>
                {step === 'confirm' && isLastPostponement && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <p className="text-sm text-amber-600">Último adiamento permitido</p>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'confirm' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Tarefa:</p>
                  <p className="text-gray-900">{taskDescription}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Adiamentos restantes:</span>
                    <span className={`font-medium ${remainingPostponements <= 1 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {remainingPostponements} de 3
                    </span>
                  </div>
                  
                  {isLastPostponement && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        ⚠️ Este é seu último adiamento para esta tarefa. Após isso, ela deverá ser realizada obrigatoriamente.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  Tem certeza de que deseja adiar a execução desta tarefa?
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Por que você está adiando esta tarefa? *
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descreva o motivo do adiamento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta justificativa será adicionada ao histórico da tarefa.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            {step === 'confirm' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Sim, adiar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('confirm')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!reason.trim() || isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? 'Adiando...' : 'Confirmar adiamento'}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}