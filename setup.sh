#!/bin/bash

# ============================================================================
# SETUP AUTOMÁTICO - Cérebro-Compatível
# Script para configuração inicial do projeto
# ============================================================================

echo "🧠 Configurando Cérebro-Compatível..."
echo "=================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

# Executar verificação de tipos
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

# Executar linting
echo "🔧 Executando linting..."
npm run lint:fix

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p public/uploads
mkdir -p public/avatars
mkdir -p public/themes

# Configurar permissões (se necessário)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod 755 public/uploads
    chmod 755 public/avatars
    chmod 755 public/themes
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "Para iniciar o projeto:"
echo "  npm run dev"
echo ""
echo "Para acessar:"
echo "  http://localhost:3000"
echo ""
echo "Login de teste:"
echo "  Email: joao@teste.com"
echo "  Senha: 123456"
echo ""
echo "📚 Consulte DOCUMENTATION.md para mais informações."
