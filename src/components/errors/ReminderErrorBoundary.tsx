'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleError } from '@/lib/errorHandling';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const DefaultFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="text-center p-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Ops! Algo deu errado com os lembretes
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {error.message?.includes('network') || error.message?.includes('timeout')
            ? 'Problema de conexão detectado. Verifique sua internet.'
            : error.message?.includes('validation')
            ? 'Dados inválidos detectados. Tente novamente.'
            : 'Um erro inesperado ocorreu. Nossa equipe foi notificada.'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Detalhes do erro (dev only)
            </summary>
            <pre className="mt-2 p-4 bg-red-50 rounded text-xs text-red-800 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export class ReminderErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log estruturado do erro
    console.error('🚨 ReminderErrorBoundary capturou erro:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Usar nosso sistema de error handling para logs consistentes
    handleError(error, 'Error Boundary - Sistema de Lembretes', false);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultFallback;
      
      return (
        <Fallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}