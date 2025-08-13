// ============================================================================
// VAPID CONFIGURATION - Configuração das chaves VAPID para push notifications
// ============================================================================

import dotenv from 'dotenv';

dotenv.config();

export const VAPID_CONFIG = {
  // Chaves VAPID geradas para desenvolvimento
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEq0Fm_4no22iBlar6AF_ChbOCAQLEGiKvP69bCBgWXkgyQA18RPpXFNM0QjEZkvM9-W9g0DkR4WjV_LlpcwgYY',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'xUauQW65D84wKE71CgOY45kzz9RVlhgSCbEDN0Rtdic',
  
  // Informações de contato (obrigatório para VAPID)
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@gerenciador-task.com'
};

// Validar configuração
if (!VAPID_CONFIG.publicKey || !VAPID_CONFIG.privateKey) {
  throw new Error('VAPID keys não foram configuradas. Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas variáveis de ambiente.');
}

console.log('🔑 VAPID Configuration loaded:');
console.log('  - Public Key:', VAPID_CONFIG.publicKey.substring(0, 20) + '...');
console.log('  - Subject:', VAPID_CONFIG.subject);