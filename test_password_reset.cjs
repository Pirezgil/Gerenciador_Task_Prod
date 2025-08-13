const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPasswordResetFlow() {
  try {
    console.log('🔧 Testando fluxo de recuperação de senha...\n');

    // 1. Criar usuário de teste se não existir
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('👤 Criando usuário de teste...');
      user = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'test@example.com',
          password: '$2b$12$hashedpassword' // senha fictícia hasheada
        }
      });
      console.log('✅ Usuário criado:', user.email);
    } else {
      console.log('👤 Usuário de teste encontrado:', user.email);
    }

    // 2. Simular requisição de reset de senha
    console.log('\n📧 Simulando requisição de reset de senha...');
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');
    
    const resetToken = crypto.randomBytes(32).toString('urlsafe-base64');
    const hashedToken = await bcrypt.hash(resetToken, 12);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt
      }
    });

    console.log('✅ Token de reset criado e salvo no banco');
    console.log('🔗 Token de reset:', resetToken);
    console.log('⏰ Expira em:', expiresAt.toISOString());

    // 3. Verificar se token é válido
    console.log('\n🔍 Validando token...');
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { gt: new Date() }
      },
      select: {
        id: true,
        email: true,
        passwordResetToken: true
      }
    });

    let validUser = null;
    for (const u of users) {
      if (u.passwordResetToken) {
        const isValidToken = await bcrypt.compare(resetToken, u.passwordResetToken);
        if (isValidToken) {
          validUser = u;
          break;
        }
      }
    }

    if (validUser) {
      console.log('✅ Token válido para usuário:', validUser.email);
    } else {
      console.log('❌ Token inválido');
      return;
    }

    // 4. Simular reset de senha
    console.log('\n🔑 Simulando reset de senha...');
    const newPassword = 'NovaSenh@123';
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        password: hashedNewPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    });

    console.log('✅ Senha redefinida com sucesso!');

    // 5. Verificar se token foi limpo
    console.log('\n🔍 Verificando se token foi limpo...');
    const userAfterReset = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetExpires: true
      }
    });

    if (!userAfterReset.passwordResetToken && !userAfterReset.passwordResetExpires) {
      console.log('✅ Token de reset foi removido corretamente');
    } else {
      console.log('❌ Erro: Token não foi removido');
    }

    // 6. Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('✅ Usuário de teste removido');

    console.log('\n🎉 Teste de fluxo de recuperação de senha concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPasswordResetFlow();