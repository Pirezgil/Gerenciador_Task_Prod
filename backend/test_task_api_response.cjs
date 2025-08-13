const fetch = require('node-fetch');

async function testTaskAPIResponse() {
  try {
    const taskId = 'cme9z51cb00048udw760wr0tg';
    const apiUrl = `http://localhost:3001/api/tasks/${taskId}`;
    
    console.log('🔍 TESTE DA API DE TAREFAS');
    console.log('==========================');
    console.log(`📋 Task ID: ${taskId}`);
    console.log(`🌐 URL: ${apiUrl}`);
    console.log('');

    // Note: Esta requisição pode falhar por falta de autenticação
    // Mas vamos ver se conseguimos alguma resposta
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`📊 STATUS: ${response.status} ${response.statusText}`);
    console.log('');

    if (response.status === 401) {
      console.log('⚠️  Erro 401: Não autenticado (esperado em teste direto)');
      console.log('   A API requer autenticação via cookies HTTP-only');
      console.log('   Vamos testar diretamente o service...');
      return;
    }

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ RESPOSTA DA API:');
      console.log('');
      
      if (data.success && data.data) {
        const task = data.data;
        console.log(`📋 Tarefa: ${task.description}`);
        console.log(`📎 Anexos: ${task.attachments ? task.attachments.length : 0}`);
        console.log('');
        
        if (task.attachments && task.attachments.length > 0) {
          console.log('📎 DETALHES DOS ANEXOS:');
          task.attachments.forEach((att, index) => {
            console.log(`   ${index + 1}. ${att.name}`);
            console.log(`      - Tipo: ${att.type}`);
            console.log(`      - Tamanho: ${att.size} bytes`);
            console.log(`      - ID: ${att.id}`);
            console.log(`      - Upload: ${att.uploadedAt}`);
          });
        } else {
          console.log('❌ Nenhum anexo retornado pela API');
        }
      } else {
        console.log('❌ Resposta inesperada da API:');
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      console.log('❌ ERRO NA API:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('⚠️  Servidor não está rodando em localhost:3001');
      console.log('   Certifique-se de que o backend está ativo');
    }
  }
}

// Função para testar diretamente o service
async function testServiceDirectly() {
  try {
    // Importar o service diretamente (pode falhar se houver dependências)
    console.log('🔧 TESTANDO SERVICE DIRETAMENTE');
    console.log('===============================');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const taskId = 'cme9z51cb00048udw760wr0tg';
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // ID do usuário de teste
    
    // Simular chamada do service
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        userId: userId 
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' }
        },
        attachments: true,
        recurrence: true,
        appointment: true,
        history: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!task) {
      console.log('❌ Tarefa não encontrada no service');
      return;
    }

    console.log('✅ SERVICE RESPONSE:');
    console.log(`   - Tarefa: ${task.description}`);
    console.log(`   - Anexos carregados: ${task.attachments ? task.attachments.length : 0}`);
    
    if (task.attachments && task.attachments.length > 0) {
      console.log('');
      console.log('📎 ANEXOS DO SERVICE:');
      task.attachments.forEach((att, index) => {
        console.log(`   ${index + 1}. ${att.name}`);
        console.log(`      - Tipo: ${att.type}`);
        console.log(`      - Tamanho: ${att.size} bytes`);
        console.log(`      - ID: ${att.id}`);
      });
      
      // Testar mapeamento como o service faz
      const mappedAttachments = task.attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size.toString(),
        uploadedAt: attachment.uploadedAt.toISOString()
      }));
      
      console.log('');
      console.log('📋 ANEXOS MAPEADOS (como na resposta):');
      console.log(JSON.stringify(mappedAttachments, null, 2));
    } else {
      console.log('❌ Nenhum anexo encontrado pelo service');
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Erro ao testar service:', error.message);
  }
}

// Executar ambos os testes
async function runTests() {
  await testTaskAPIResponse();
  console.log('\n' + '='.repeat(50) + '\n');
  await testServiceDirectly();
}

runTests();