'use client';

// Página de login ULTRA SIMPLES - sem nenhuma dependência complexa
import { useState } from 'react';

export default function SimpleLoginPage() {
  const [status, setStatus] = useState('');
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Fazendo login...');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      console.log('🔐 Tentando login:', { email, password });
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('📡 Resposta da API:', data);
      
      if (data.data?.token) {
        localStorage.setItem('auth-token', data.data.token);
        setStatus('✅ Login realizado! Redirecionando...');
        setTimeout(() => {
          window.location.href = '/bombeiro';
        }, 1000);
      } else {
        setStatus('❌ Erro: ' + (data.message || 'Login falhou'));
      }
    } catch (error) {
      console.error('💥 Erro:', error);
      setStatus('❌ Erro de conexão: ' + (error as Error).message);
    }
  };
  
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>🔐 Login Ultra-Simples</h2>
        <p>Página de teste para verificar se o problema é com React/Next.js</p>
        
        {status && (
          <div style={{
            padding: '10px',
            margin: '10px 0',
            background: status.includes('❌') ? '#ffe6e6' : '#e6ffe6',
            border: `1px solid ${status.includes('❌') ? '#ff6b6b' : '#51cf66'}`,
            borderRadius: '5px'
          }}>
            {status}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              defaultValue="demo@gerenciador.com"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Senha:
            </label>
            <input
              type="password"
              name="password"
              defaultValue="demo1234"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🚀 Entrar
          </button>
        </form>
        
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          marginTop: '20px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>🔍 Debug Info:</strong><br/>
          Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other' : 'SSR'}<br/>
          LocalStorage items: {typeof window !== 'undefined' ? Object.keys(localStorage).length : 0}<br/>
          Timestamp: {new Date().toISOString()}
        </div>
        
        <button
          type="button"
          onClick={() => {
            console.log('🧹 Limpando dados...');
            localStorage.clear();
            sessionStorage.clear();
            setStatus('🧹 Dados limpos! Recarregando...');
            setTimeout(() => window.location.reload(), 1000);
          }}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🧹 Limpar Dados e Recarregar
        </button>
      </div>
    </div>
  );
}