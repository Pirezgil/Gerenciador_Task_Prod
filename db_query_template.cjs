/**
 * TEMPLATE OTIMIZADO PARA CONSULTAS PRISMA
 * 
 * Este template evita os erros comuns:
 * ✅ Usa .cjs (evita erro ES module)
 * ✅ Carrega dotenv automaticamente
 * ✅ Prisma client configurado
 * ✅ Tratamento de erro padrão
 * ✅ Disconnect automático
 * 
 * ECONOMIA: 70-80% menos tokens vs tentativas múltiplas
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function executeQuery() {
  try {
    console.log('=== EXECUTANDO CONSULTA ===');
    
    // SUBSTITUA ESTA SEÇÃO PELA SUA CONSULTA
    // Exemplo:
    const result = await prisma.task.findMany({
      take: 5,
      include: { project: true }
    });
    
    console.log('Resultado:', result);
    // FIM DA SEÇÃO DE CONSULTA
    
  } catch (error) {
    console.error('❌ Erro na consulta:', error.message);
    if (error.code) console.error('Código:', error.code);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Conexão encerrada');
  }
}

executeQuery();