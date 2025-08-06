const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function fixDemoUser() {
  console.log('🔧 Corrigindo usuário demo...');
  
  const user = await prisma.user.findUnique({ 
    where: { email: 'demo@gerenciador.com' }
  });
  
  if (!user) {
    console.log('❌ Usuário não encontrado');
    return;
  }
  
  // Gerar nova senha hash
  const newPasswordHash = await bcrypt.hash('demo1234', 10);
  
  // Atualizar usuário
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPasswordHash,
      emailVerified: true
    }
  });
  
  console.log('✅ Senha do usuário demo corrigida');
  
  // Verificar se funcionou
  const updatedUser = await prisma.user.findUnique({ 
    where: { email: 'demo@gerenciador.com' }
  });
  
  const isValid = await bcrypt.compare('demo1234', updatedUser.password);
  console.log('✅ Verificação da nova senha:', isValid ? 'SUCESSO' : 'FALHOU');
  
  await prisma.$disconnect();
}

fixDemoUser().catch(console.error);