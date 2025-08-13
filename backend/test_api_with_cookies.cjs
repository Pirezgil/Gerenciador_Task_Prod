// Este script vai testar a API com cookies de sessão real
// Instruções para uso: copie cookies do browser

console.log('🔍 TESTE DE API COM AUTENTICAÇÃO');
console.log('===============================');
console.log('');
console.log('Para testar, você precisa:');
console.log('1. Abrir http://localhost:3000 no navegador');
console.log('2. Fazer login (se necessário)');
console.log('3. Abrir DevTools (F12)');
console.log('4. Ir para Application > Cookies > http://localhost:3000');
console.log('5. Copiar os valores dos cookies');
console.log('6. Modificar este script com os valores reais');
console.log('');
console.log('Exemplo de cookie de sessão:');
console.log('session=seu_valor_aqui');
console.log('');
console.log('Então executar: node test_api_with_cookies.cjs');
console.log('');

// Função para testar com cookies reais (requer valores do browser)
async function testWithRealCookies() {
  try {
    // VOCÊ PRECISA PREENCHER ESTES VALORES DO BROWSER:
    const cookieValue = 'COOKIE_VALUE_HERE'; // Cole o valor do cookie aqui
    
    if (cookieValue === 'COOKIE_VALUE_HERE') {
      console.log('❌ ERRO: Você precisa preencher o valor real do cookie!');
      console.log('');
      console.log('Passos:');
      console.log('1. Abra http://localhost:3000 no browser');
      console.log('2. Pressione F12 > Application > Cookies');
      console.log('3. Copie o valor do cookie de sessão');
      console.log('4. Cole no script onde está COOKIE_VALUE_HERE');
      return;
    }
    
    const fetch = require('node-fetch');
    const taskId = 'cme9z51cb00048udw760wr0tg';
    const apiUrl = `http://localhost:3001/api/tasks/${taskId}`;
    
    console.log(`🌐 Testando: ${apiUrl}`);
    console.log(`🍪 Cookie: ${cookieValue.substring(0, 20)}...`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': `session=${cookieValue}` // Ajuste o nome do cookie se necessário
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ API FUNCIONANDO!');
      console.log(`📋 Tarefa: ${data.data.description}`);
      console.log(`📎 Anexos retornados: ${data.data.attachments?.length || 0}`);
      
      if (data.data.attachments && data.data.attachments.length > 0) {
        console.log('');
        console.log('📎 ANEXOS ENCONTRADOS:');
        data.data.attachments.forEach((att, i) => {
          console.log(`${i + 1}. ${att.name} (${att.type})`);
        });
        console.log('');
        console.log('✅ CONCLUSÃO: API está retornando anexos corretamente!');
        console.log('   O problema deve estar no frontend.');
      } else {
        console.log('');
        console.log('❌ PROBLEMA: API não está retornando anexos');
      }
    } else {
      console.log('❌ ERRO NA API:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Função alternativa: verificar logs do servidor
console.log('');
console.log('🔍 ALTERNATIVA - VERIFICAR LOGS DO SERVIDOR:');
console.log('============================================');
console.log('1. Abra http://localhost:3000/task/cme9z51cb00048udw760wr0tg');
console.log('2. Monitore os logs do backend para ver se a requisição chega');
console.log('3. Verifique se há erros nos logs');
console.log('');

// Função para verificar o que o frontend está fazendo
console.log('🔍 VERIFICAR FRONTEND:');
console.log('====================');
console.log('1. Abra F12 > Network no browser');
console.log('2. Acesse http://localhost:3000/task/cme9z51cb00048udw760wr0tg');
console.log('3. Procure por requisições para /api/tasks/cme9z51cb00048udw760wr0tg');
console.log('4. Verifique a resposta da API');
console.log('5. Procure por erros no Console');

testWithRealCookies();