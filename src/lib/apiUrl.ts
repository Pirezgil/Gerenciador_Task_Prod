/**
 * Utilitário para detectar automaticamente a API URL baseada no hostname atual
 * Centraliza a lógica para ser reutilizada em todo o projeto
 */

export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for ngrok, usar a própria URL + /api
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free.app')) {
      return `${protocol}//${hostname}/api`;
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    } else if (hostname === '192.168.0.252') {
      return 'http://192.168.0.252:3001/api';
    }
  }
  // Fallback para a variável de ambiente ou localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

// Versão que retorna apenas a base (sem /api) - útil para alguns casos
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for ngrok, usar a própria URL
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free.app')) {
      return `${protocol}//${hostname}`;
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    } else if (hostname === '192.168.0.252') {
      return 'http://192.168.0.252:3001';
    }
  }
  // Fallback
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
};