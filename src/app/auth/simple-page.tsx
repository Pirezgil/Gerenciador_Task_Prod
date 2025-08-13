// Página de teste ULTRA simples para isolar o problema
export default function SimpleAuthPage() {
  return (
    <html>
      <head>
        <title>Login Simples</title>
        <style>{`
          body { 
            font-family: Arial, sans-serif; 
            max-width: 400px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .form { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .field { 
            margin-bottom: 15px; 
          }
          label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold;
          }
          input { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #ddd; 
            border-radius: 5px;
            box-sizing: border-box;
          }
          button { 
            width: 100%; 
            padding: 12px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { 
            background: #0056b3; 
          }
          .debug {
            background: #f8f9fa;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="form">
          <h2>🔐 Login Direto</h2>
          <p>Página ultra-simples para testar se o problema persiste</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get('email');
            const password = formData.get('password');
            
            console.log('Tentando login:', { email, password });
            
            fetch('http://localhost:3001/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
              console.log('Resposta:', data);
              if (data.data?.token) {
                localStorage.setItem('auth-token', data.data.token);
                alert('Login realizado! Redirecionando...');
                window.location.href = '/bombeiro';
              } else {
                alert('Erro: ' + (data.message || 'Login falhou'));
              }
            })
            .catch(error => {
              console.error('Erro:', error);
              alert('Erro de conexão: ' + error.message);
            });
          }}>
            <div className="field">
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                defaultValue="demo@gerenciador.com"
                required 
              />
            </div>
            
            <div className="field">
              <label htmlFor="password">Senha:</label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                defaultValue="demo1234"
                required 
              />
            </div>
            
            <button type="submit">Entrar</button>
          </form>
          
          <div className="debug">
            <strong>🔍 Debug Info:</strong><br/>
            Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'Unknown'}<br/>
            LocalStorage items: {typeof window !== 'undefined' ? Object.keys(localStorage).length : 0}<br/>
            Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}
          </div>
          
          <button 
            type="button" 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              alert('Dados limpos!');
              window.location.reload();
            }}
            style={{ marginTop: '10px', background: '#dc3545' }}
          >
            🧹 Limpar Tudo
          </button>
        </div>
        
        <script>{`
          console.log('🔍 Página carregada:', new Date().toISOString());
          console.log('🔍 User Agent:', navigator.userAgent);
          console.log('🔍 localStorage keys:', Object.keys(localStorage));
        `}</script>
      </body>
    </html>
  );
}