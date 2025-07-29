import React, { useEffect, useRef } from 'react';
import { useEnergyBudget } from '../../hooks/useEnergyBudget';

/**
 * Monitor de Energia com Proteção Anti-Loop
 * CORREÇÃO: Sistema avançado de detecção e prevenção de loops infinitos
 */
export const EnergyMonitor: React.FC = () => {
  const { current, percentage } = useEnergyBudget();
  
  // ===== PROTEÇÕES ANTI-LOOP =====
  const updateCountRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const isUpdatingEnergy = useRef(false); // Flag anti-loop
  const energyHistoryRef = useRef<number[]>([]); // Histórico para debounce
  
  // Sistema de throttle para atualizações
  const throttleCheck = () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    updateCountRef.current++;
    lastUpdateRef.current = now;
    
    // CORREÇÃO: Detectar possível loop infinito
    if (timeSinceLastUpdate < 50) { // Muito rápido = possível loop
      if (updateCountRef.current > 15 && !warningShownRef.current) {
        console.error('🚨 LOOP INFINITO DETECTADO no sistema de energia!');
        console.error('❌ Atualizações muito frequentes:', {
          updates: updateCountRef.current,
          timeSpan: timeSinceLastUpdate,
          currentEnergy: current,
          timestamp: new Date().toISOString()
        });
        
        warningShownRef.current = true;
        
        // CORREÇÃO: Forçar pausa no sistema de energia
        isUpdatingEnergy.current = true;
        setTimeout(() => {
          isUpdatingEnergy.current = false;
          console.log('✅ Sistema de energia liberado após detecção de loop');
        }, 1000); // Pausa de 1 segundo
        
        // Auto-reset após 10 segundos
        setTimeout(() => {
          warningShownRef.current = false;
          updateCountRef.current = 0;
          console.log('🔄 Monitor de energia resetado');
        }, 10000);
      }
    } else if (timeSinceLastUpdate > 1000) {
      // Reset contador se passou tempo suficiente (1 segundo)
      updateCountRef.current = 0;
      warningShownRef.current = false;
    }
    
    // Manter histórico de energia para análise de padrões
    energyHistoryRef.current.push(current);
    if (energyHistoryRef.current.length > 50) {
      energyHistoryRef.current = energyHistoryRef.current.slice(-25); // Manter últimas 25
    }
  };
  
  useEffect(() => {
    // CORREÇÃO: Evitar execução se sistema está em pausa
    if (!isUpdatingEnergy.current) {
      throttleCheck();
    }
  }, [current, percentage]);
  
  // CORREÇÃO: Sistema de debug para desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugInterval = setInterval(() => {
        if (updateCountRef.current > 5) {
          console.log('🔍 Energy Monitor Status:', {
            updates: updateCountRef.current,
            energy: current,
            percentage,
            isBlocked: isUpdatingEnergy.current,
            historySize: energyHistoryRef.current.length
          });
        }
      }, 5000); // Log a cada 5 segundos se ativo
      
      return () => clearInterval(debugInterval);
    }
  }, [current, percentage]);
  
  // CORREÇÃO: Cleanup geral
  useEffect(() => {
    return () => {
      // Reset todos os refs ao desmontar
      updateCountRef.current = 0;
      lastUpdateRef.current = 0;
      warningShownRef.current = false;
      isUpdatingEnergy.current = false;
      energyHistoryRef.current = [];
    };
  }, []);
  
  // Componente invisível - apenas para monitoramento
  return null;
};

// ===== EXPORT ADICIONAL PARA DEBUGGING =====
export const EnergyDebugInfo = () => {
  const { current, max, percentage } = useEnergyBudget();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      🔋 Energy: {current}/{max} ({percentage}%)
    </div>
  );
};
