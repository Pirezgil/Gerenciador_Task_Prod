const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTaskAttachments() {
  try {
    const taskId = 'cme9z51cb00048udw760wr0tg';
    
    console.log('🔍 VERIFICAÇÃO DE ANEXOS DA TAREFA');
    console.log('=====================================');
    console.log(`📋 Task ID: ${taskId}`);
    console.log('');

    // 1. Verificar se a tarefa existe
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!task) {
      console.log('❌ TAREFA NÃO ENCONTRADA');
      return;
    }

    console.log('✅ TAREFA ENCONTRADA:');
    console.log(`   - Descrição: ${task.description}`);
    console.log(`   - User ID: ${task.userId}`);
    console.log(`   - Criada: ${task.createdAt.toLocaleString('pt-BR')}`);
    console.log(`   - Atualizada: ${task.updatedAt.toLocaleString('pt-BR')}`);
    console.log('');

    // 2. Verificar anexos na tabela TaskAttachment
    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      orderBy: { uploadedAt: 'desc' }
    });

    console.log('📎 ANEXOS NA TABELA task_attachments:');
    console.log(`   Total: ${attachments.length} anexo(s)`);
    console.log('');

    if (attachments.length > 0) {
      attachments.forEach((att, index) => {
        console.log(`   ${index + 1}. ID: ${att.id}`);
        console.log(`      - Nome: ${att.name}`);
        console.log(`      - Tipo: ${att.type}`);
        console.log(`      - Tamanho: ${att.size} bytes`);
        console.log(`      - URL: ${att.url.substring(0, 50)}...`);
        console.log(`      - Uploaded: ${att.uploadedAt.toLocaleString('pt-BR')}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Nenhum anexo encontrado na tabela');
    }

    // 3. Verificar dados da tarefa com include de anexos (como o service faz)
    const taskWithAttachments = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        attachments: true
      }
    });

    console.log('🔗 TAREFA COM ANEXOS (include relation):');
    console.log(`   Anexos carregados: ${taskWithAttachments?.attachments?.length || 0}`);
    
    if (taskWithAttachments?.attachments && taskWithAttachments.attachments.length > 0) {
      console.log('   ✅ Anexos encontrados via relação:');
      taskWithAttachments.attachments.forEach((att, index) => {
        console.log(`      ${index + 1}. ${att.name} (${att.type})`);
      });
    } else {
      console.log('   ❌ Nenhum anexo encontrado via relação');
    }

    console.log('');
    console.log('🔍 RESUMO:');
    console.log(`   - Tarefa existe: ${task ? '✅ Sim' : '❌ Não'}`);
    console.log(`   - Anexos na tabela: ${attachments.length}`);
    console.log(`   - Anexos via relação: ${taskWithAttachments?.attachments?.length || 0}`);
    
    if (attachments.length > 0 && (!taskWithAttachments?.attachments || taskWithAttachments.attachments.length === 0)) {
      console.log('   ⚠️  PROBLEMA: Anexos existem na tabela mas não são carregados via relação');
    } else if (attachments.length === taskWithAttachments?.attachments?.length && attachments.length > 0) {
      console.log('   ✅ Dados consistentes entre tabela e relação');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar anexos:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTaskAttachments();