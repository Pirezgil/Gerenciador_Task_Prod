'use client';

// ============================================================================
// SECURITY SETTINGS - Configurações de segurança + Senha Caixa de Areia
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Settings,
  Database
} from 'lucide-react';

export function SecuritySettings() {
  const { user, updateSettings } = useAuthStore();
  
  // Estados para senha da caixa de areia
  const [sandboxPassword, setSandboxPassword] = useState('');
  const [confirmSandboxPassword, setConfirmSandboxPassword] = useState('');
  const [showSandboxPassword, setShowSandboxPassword] = useState(false);
  const [showConfirmSandbox, setShowConfirmSandbox] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState('');
  const [sandboxIsError, setSandboxIsError] = useState(false);
  
  // Estados para senha principal
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordIsError, setPasswordIsError] = useState(false);

  // Handler para salvar senha da caixa de areia
  const handleSandboxPasswordSave = () => {
    // Limpar mensagens anteriores
    setSandboxMessage('');
    setSandboxIsError(false);

    // Validações
    if (!sandboxPassword.trim()) {
      setSandboxMessage('Digite uma senha válida');
      setSandboxIsError(true);
      return;
    }

    if (sandboxPassword.length < 4) {
      setSandboxMessage('A senha deve ter pelo menos 4 caracteres');
      setSandboxIsError(true);
      return;
    }

    if (sandboxPassword !== confirmSandboxPassword) {
      setSandboxMessage('As senhas não coincidem');
      setSandboxIsError(true);
      return;
    }

    // Salvar senha
    updateSettings({ 
      sandboxPassword: sandboxPassword,
      sandboxEnabled: true 
    });
    
    // Limpar campos
    setSandboxPassword('');
    setConfirmSandboxPassword('');
    
    // Mostrar sucesso
    setSandboxMessage('Senha da Caixa de Areia configurada com sucesso!');
    setSandboxIsError(false);
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => setSandboxMessage(''), 3000);
  };

  // Handler para desabilitar proteção da caixa de areia
  const handleDisableSandboxPassword = () => {
    updateSettings({ 
      sandboxEnabled: false, 
      sandboxPassword: undefined 
    });
    
    setSandboxPassword('');
    setConfirmSandboxPassword('');
    setSandboxMessage('Proteção da Caixa de Areia desabilitada');
    setSandboxIsError(false);
    
    setTimeout(() => setSandboxMessage(''), 3000);
  };

  // Handler para alterar senha principal
  const handlePasswordChange = () => {
    // Limpar mensagens anteriores
    setPasswordMessage('');
    setPasswordIsError(false);

    // Validações
    if (!passwordData.currentPassword.trim()) {
      setPasswordMessage('Digite sua senha atual');
      setPasswordIsError(true);
      return;
    }

    if (!passwordData.newPassword.trim()) {
      setPasswordMessage('Digite uma nova senha');
      setPasswordIsError(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('A nova senha deve ter pelo menos 8 caracteres');
      setPasswordIsError(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('As senhas não coincidem');
      setPasswordIsError(true);
      return;
    }
    
    // Simular alteração de senha (implementar API real)
    setPasswordMessage('Senha alterada com sucesso!');
    setPasswordIsError(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    setTimeout(() => setPasswordMessage(''), 3000);
  };

  const isSandboxEnabled = user?.settings?.sandboxEnabled;
  const hasSandboxPassword = user?.settings?.sandboxPassword;

  return (
    <div className="space-y-8">
      {/* Título da página */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Segurança</h1>
            <p className="text-gray-600">Gerencie suas senhas e configurações de privacidade</p>
          </div>
        </div>
      </motion.div>

      {/* Senha da Caixa de Areia */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-lg">🏖️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Caixa de Areia Privada</h2>
            <p className="text-gray-600">Configure uma senha para proteger suas notas privadas</p>
          </div>
        </div>

        {/* Status atual */}
        <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {isSandboxEnabled && hasSandboxPassword ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Caixa de Areia protegida por senha</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Caixa de Areia não protegida</span>
              </>
            )}
          </div>
          
          {isSandboxEnabled && hasSandboxPassword && (
            <p className="text-sm text-gray-600 mt-2">
              Uma senha será solicitada sempre que você acessar a Caixa de Areia
            </p>
          )}
        </div>

        {/* Configuração da senha */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha da Caixa de Areia
            </label>
            <div className="relative">
              <input
                type={showSandboxPassword ? 'text' : 'password'}
                value={sandboxPassword}
                onChange={(e) => setSandboxPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 pr-12"
                placeholder="Digite uma senha para a Caixa de Areia"
              />
              <button
                type="button"
                onClick={() => setShowSandboxPassword(!showSandboxPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showSandboxPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmSandbox ? 'text' : 'password'}
                value={confirmSandboxPassword}
                onChange={(e) => setConfirmSandboxPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 pr-12"
                placeholder="Confirme a senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmSandbox(!showConfirmSandbox)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showConfirmSandbox ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de feedback */}
          {sandboxMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl ${
                sandboxIsError 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {sandboxIsError ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{sandboxMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Botões de ação */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSandboxPasswordSave}
              disabled={!sandboxPassword.trim() || !confirmSandboxPassword.trim()}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                sandboxPassword.trim() && confirmSandboxPassword.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {hasSandboxPassword ? 'Alterar Senha' : 'Definir Senha'}
            </motion.button>
            
            {isSandboxEnabled && hasSandboxPassword && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDisableSandboxPassword}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:border-red-300 hover:text-red-600 transition-all duration-300"
              >
                Desabilitar
              </motion.button>
            )}
          </div>
        </div>

        {/* Dica de segurança */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <Key className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Dica de Segurança</h4>
              <p className="text-sm text-amber-700 mt-1">
                Use uma senha única e fácil de lembrar. Esta senha protegerá todas as suas notas privadas na Caixa de Areia.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alteração de Senha Principal */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alterar Senha Principal</h2>
            <p className="text-gray-600">Altere a senha da sua conta</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 pr-12"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400"
              placeholder="Digite sua nova senha (mín. 8 caracteres)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400"
              placeholder="Confirme sua nova senha"
            />
          </div>

          {/* Mensagem de feedback */}
          {passwordMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl ${
                passwordIsError 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {passwordIsError ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{passwordMessage}</span>
              </div>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePasswordChange}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
              passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Alterar Senha Principal
          </motion.button>
        </div>
      </motion.div>

      {/* Sessões Ativas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sessões Ativas</h2>
            <p className="text-gray-600">Gerencie suas sessões de login</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Sessão Atual</h4>
              <p className="text-sm text-gray-600">Navegador Web • Santo André, São Paulo</p>
              <p className="text-xs text-gray-500">Última atividade: agora</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              Ativo
            </span>
          </div>
        </div>
      </motion.div>

      {/* Configurações de Privacidade */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurações de Privacidade</h2>
            <p className="text-gray-600">Controle como seus dados são utilizados</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Dados de Uso</h4>
              <p className="text-sm text-gray-600">Permitir coleta de dados para melhorar o serviço</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-600">Compartilhar estatísticas anônimas de uso</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Zona de Perigo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-2 border-red-200 rounded-2xl p-8 bg-red-50"
      >
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-xl font-bold text-red-900">Zona de Perigo</h2>
            <p className="text-red-700">Ações irreversíveis que afetarão permanentemente sua conta</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-red-700">
            Ao excluir sua conta, todos os seus dados serão permanentemente removidos e não poderão ser recuperados.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold"
          >
            Excluir Conta Permanentemente
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
