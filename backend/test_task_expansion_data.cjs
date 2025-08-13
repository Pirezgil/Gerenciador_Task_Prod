const { PrismaClient } = require('@prisma/client');

async function testTaskExpansionData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 TESTE: Verificando dados para visualização expandida de tarefas');
    console.log('==================================================================\n');
    
    // Buscar primeiro usuário disponível
    const user = await prisma.user.findFirst({
      select: { id: true, name: true, email: true }
    });
    
    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    console.log(`📋 USUÁRIO DE TESTE: ${user.name} (${user.email})`);
    console.log(`🆔 ID: ${user.id}\n`);
    
    // Buscar tarefas do usuário com todos os includes necessários
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        isDeleted: false
      },
      include: {
        project: {
          select: { id: true, name: true, icon: true, color: true }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        attachments: true,
        history: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        recurrence: true,
        appointment: true
      },
      take: 3, // Pegar apenas 3 tarefas para teste
      orderBy: { createdAt: 'desc' }
    });
    
    if (tasks.length === 0) {
      console.log('❌ Nenhuma tarefa encontrada para este usuário');
      return;
    }
    
    console.log(`✅ TAREFAS ENCONTRADAS: ${tasks.length}\n`);
    
    // Analisar cada tarefa para verificar dados de expansão
    tasks.forEach((task, index) => {
      console.log(`📝 TAREFA ${index + 1}: ${task.description}`);
      console.log(`🆔 ID: ${task.id}`);
      console.log(`📊 Status: ${task.status}`);
      console.log(`⚡ Energia: ${task.energyPoints}`);
      console.log(`🔧 Tipo: ${task.type || 'task'}`);
      
      // Verificar projeto
      if (task.project) {
        console.log(`📁 Projeto: ${task.project.icon} ${task.project.name}`);
      } else {
        console.log(`📁 Projeto: Nenhum`);
      }
      
      // Verificar comentários
      console.log(`💬 Comentários: ${task.comments?.length || 0}`);
      if (task.comments && task.comments.length > 0) {
        task.comments.forEach((comment, i) => {
          console.log(`   ${i + 1}. ${comment.author}: "${comment.content.substring(0, 50)}..."`);
        });
      }
      
      // Verificar anexos
      console.log(`📎 Anexos: ${task.attachments?.length || 0}`);
      if (task.attachments && task.attachments.length > 0) {
        task.attachments.forEach((attachment, i) => {
          console.log(`   ${i + 1}. ${attachment.name} (${attachment.type})`);
        });
      }
      
      // Verificar histórico
      console.log(`📋 Histórico: ${task.history?.length || 0}`);
      if (task.history && task.history.length > 0) {
        task.history.slice(0, 3).forEach((entry, i) => {
          console.log(`   ${i + 1}. ${entry.action} - ${new Date(entry.timestamp).toLocaleString('pt-BR')}`);
        });
      }
      
      // Verificar configurações especiais
      if (task.isRecurring && task.recurrence) {
        console.log(`🔄 Recorrência: ${task.recurrence.frequency}`);
        if (task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0) {
          console.log(`   📅 Dias: ${task.recurrence.daysOfWeek.join(', ')}`);
        }
      }
      
      if (task.isAppointment && task.appointment) {
        console.log(`📅 Compromisso: ${task.appointment.scheduledTime}`);
        if (task.appointment.location) {
          console.log(`   📍 Local: ${task.appointment.location}`);
        }
      }
      
      // Verificar links externos
      if (task.externalLinks && Array.isArray(task.externalLinks) && task.externalLinks.length > 0) {
        console.log(`🔗 Links externos: ${task.externalLinks.length}`);
        task.externalLinks.forEach((link, i) => {
          console.log(`   ${i + 1}. ${link}`);
        });
      } else {
        console.log(`🔗 Links externos: 0`);
      }
      
      console.log('─'.repeat(50));
    });
    
    // TESTE ESPECÍFICO: Simular requisição da API
    console.log('\n🌐 TESTE DE API: Simulando requisição GET /api/tasks');
    console.log('================================================\n');
    
    // Simular resposta da API (básica para lista)
    const apiListResponse = tasks.map(task => ({
      id: task.id,
      description: task.description,
      status: task.status,
      energyPoints: task.energyPoints,
      type: task.type,
      isRecurring: task.isRecurring,
      isAppointment: task.isAppointment,
      dueDate: task.dueDate?.toISOString().split('T')[0] || null,
      project: task.project || undefined,
      // IMPORTANTE: Dados de expansão devem estar presentes
      comments: task.comments?.map(c => ({
        id: c.id,
        author: c.author,
        content: c.content,
        createdAt: c.createdAt.toISOString()
      })) || [],
      attachments: task.attachments?.map(a => ({
        id: a.id,
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size.toString()
      })) || [],
      history: task.history?.map(h => ({
        id: h.id,
        action: h.action,
        timestamp: h.timestamp.toISOString(),
        details: h.details
      })) || [],
      externalLinks: task.externalLinks || [],
      recurrence: task.recurrence || undefined,
      appointment: task.appointment || undefined
    }));
    
    console.log('📊 ESTRUTURA DA RESPOSTA DA API (primeira tarefa):');
    console.log(JSON.stringify(apiListResponse[0], null, 2));
    
    // VERIFICAÇÃO CRÍTICA
    console.log('\n🔍 VERIFICAÇÃO CRÍTICA PARA EXPANSÃO:');
    console.log('=====================================\n');
    
    const firstTask = apiListResponse[0];
    const checks = [
      {
        name: 'Comentários carregados',
        condition: Array.isArray(firstTask.comments),
        value: firstTask.comments?.length || 0
      },
      {
        name: 'Histórico carregado', 
        condition: Array.isArray(firstTask.history),
        value: firstTask.history?.length || 0
      },
      {
        name: 'Anexos carregados',
        condition: Array.isArray(firstTask.attachments),
        value: firstTask.attachments?.length || 0
      },
      {
        name: 'Links externos carregados',
        condition: Array.isArray(firstTask.externalLinks),
        value: firstTask.externalLinks?.length || 0
      },
      {
        name: 'Projeto carregado',
        condition: firstTask.project !== undefined,
        value: firstTask.project?.name || 'N/A'
      }
    ];
    
    checks.forEach(check => {
      const status = check.condition ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.value}`);
    });
    
    // DIAGNÓSTICO FINAL
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('===============\n');
    
    const hasExpansionData = checks.some(check => 
      (check.name.includes('Comentários') && check.value > 0) ||
      (check.name.includes('Histórico') && check.value > 0) ||
      (check.name.includes('Anexos') && check.value > 0) ||
      (check.name.includes('Links') && check.value > 0)
    );
    
    if (hasExpansionData) {
      console.log('✅ DADOS DE EXPANSÃO DISPONÍVEIS');
      console.log('   → As tarefas possuem dados para exibir na visualização expandida');
    } else {
      console.log('⚠️  DADOS DE EXPANSÃO LIMITADOS');
      console.log('   → As tarefas não possuem comentários, histórico, anexos ou links');
      console.log('   → A visualização expandida pode aparecer vazia');
    }
    
    console.log('\n🔧 RECOMENDAÇÕES:');
    console.log('1. Verificar se o endpoint GET /api/tasks inclui todos os dados necessários');
    console.log('2. Verificar se o frontend está fazendo a requisição correta');
    console.log('3. Verificar se há dados de teste suficientes no banco');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTaskExpansionData();