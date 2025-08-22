/**
 * Utilitário para detectar automaticamente a API URL baseada no hostname atual
 * Centraliza a lógica para ser reutilizada em todo o projeto
 */

export const getApiUrl = (): string => {
  // Primeiro, verificar variável de ambiente NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for ngrok, usar a própria URL + /api (proxy reverso do Next.js)
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free.app')) {
      return `${protocol}//${hostname}/api`;
    }
    
    // Para desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001/api`;
    }
    
    // Para IPs da rede local, sempre usar proxy reverso
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `${protocol}//${hostname}/api`;
    }
  }
  
  // Fallback final - usar proxy reverso
  return '/api';
};

// Versão que retorna apenas a base (sem /api) - útil para alguns casos
export const getApiBaseUrl = (): string => {
  // Primeiro, verificar variável de ambiente
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se for ngrok, usar a própria URL (proxy reverso)
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free.app')) {
      return `${protocol}//${hostname}`;
    }
    
    // Para desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }
    
    // Para IPs da rede local, usar o próprio hostname (proxy reverso)
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `${protocol}//${hostname}`;
    }
  }
  
  // Fallback - usar origem atual
  return '';
};