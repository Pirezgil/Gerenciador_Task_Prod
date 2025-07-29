# 🧠 Cérebro-Compatível - Documentação Completa

## 🚀 Recursos Implementados

### ✅ Sistema de Autenticação
- **Login/Registro** com email e senha
- **Login com Google** integrado
- **Recuperação de senha** via email
- **Middleware de proteção** de rotas
- **Gerenciamento de sessão** persistente

### ✅ Perfil do Usuário
- **Edição de perfil** completa
- **Upload de avatar** com preview
- **Configurações personalizadas**
- **Alteração de senha** segura
- **Exclusão de conta** com confirmação

### ✅ Sistema de Tema Avançado
- **6 temas predefinidos** (Padrão, Escuro, Natureza, Pôr do Sol, Oceano, Minimalista)
- **Personalização completa** de cores
- **Configuração de layout** (bordas, ícones, espaçamento)
- **Tipografia customizável** (família, tamanho)
- **Efeitos visuais** (animações, glassmorphism)
- **Exportar/Importar** temas
- **Salvar temas** personalizados

### ✅ Sistema de Anexos
- **Upload de arquivos** em tarefas, projetos e notas
- **Preview de anexos** com thumbnails
- **Download direto** de arquivos
- **Múltiplos formatos** suportados
- **Validação de tamanho** e tipo
- **Interface drag & drop**

### ✅ Funcionalidades Neurodivergentes
- **Sistema de energia** com orçamento diário
- **Protocolo de decomposição** automática
- **Sala de repanejamento** para tarefas adiadas
- **Caixa de areia** para pensamentos livres
- **Jardim semanal** com crescimento visual
- **Captura rápida** com triagem inteligente

## 🔧 Como Usar

### Primeiros Passos
1. **Execute os scripts** PowerShell na ordem
2. **Instale dependências**: `npm install`
3. **Execute o projeto**: `npm run dev`
4. **Acesse**: `http://localhost:3000`

### Login de Teste
- **Email**: `joao@teste.com`
- **Senha**: `123456`
- **Google**: Clique em "Continuar com Google"

### Navegação
- **🏎️ Bombeiro**: Tarefas do dia e energia
- **🏗️ Arquiteto**: Projetos e planejamento
- **🏖️ Caixa de Areia**: Pensamentos livres
- **🌲 Floresta**: Visualização de conquistas

### Personalizando o Tema
1. Acesse **Perfil > Aparência**
2. Escolha um **tema predefinido** ou personalize
3. Ajuste **cores, layout e tipografia**
4. **Exporte** seu tema personalizado

### Adicionando Anexos
1. Em qualquer tarefa/projeto/nota, clique na **área de anexos**
2. **Arraste arquivos** ou clique para selecionar
3. **Visualize** com preview automático
4. **Baixe** ou **remova** conforme necessário

## 🎯 Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js
│   ├── auth/              # Página de login
│   ├── profile/           # Página de perfil
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── auth/              # Componentes de autenticação
│   ├── bombeiro/          # Componentes do Bombeiro
│   ├── arquiteto/         # Componentes do Arquiteto
│   ├── caixa-de-areia/    # Componentes da Caixa de Areia
│   ├── floresta/          # Componentes da Floresta
│   ├── layout/            # Componentes de layout
│   ├── profile/           # Componentes de perfil
│   ├── protocols/         # Modais de protocolos
│   └── shared/            # Componentes compartilhados
├── stores/                # Estados Zustand
│   ├── authStore.ts       # Estado de autenticação
│   ├── tasksStore.ts      # Estado de tarefas
│   └── themeStore.ts      # Estado de tema
├── types/                 # Definições TypeScript
└── styles/                # Estilos globais
```

## 🔐 Segurança

### Autenticação
- **Tokens JWT** para sessões
- **Refresh tokens** automáticos
- **Middleware** de proteção
- **Validação** de dados

### Anexos
- **Validação de tipo** de arquivo
- **Limite de tamanho** configurável
- **Preview seguro** de imagens
- **URLs temporárias** para downloads

## 🎨 Temas Disponíveis

### Predefinidos
1. **Padrão**: Azul limpo e profissional
2. **Escuro**: Ideal para trabalho noturno
3. **Natureza**: Verde relaxante
4. **Pôr do Sol**: Laranja energizante
5. **Oceano**: Azul profundo
6. **Minimalista**: Clean e simples

### Personalização
- **Cores primárias** e secundárias
- **Bordas**: Nenhuma, pequena, média, grande
- **Ícones**: Pequeno, médio, grande
- **Espaçamento**: Compacto, normal, confortável
- **Fontes**: Sistema, Inter, Lora
- **Efeitos**: Animações, glassmorphism

## 📱 Responsividade

O sistema é completamente responsivo:
- **Desktop**: Layout completo
- **Tablet**: Adaptação automática
- **Mobile**: Interface otimizada
- **Acessibilidade**: Suporte completo

## 🚀 Próximos Passos

### Implementação em Produção
1. **Configurar backend** real
2. **Implementar APIs** de autenticação
3. **Configurar upload** de arquivos
4. **Deploy** na nuvem

### Melhorias Futuras
- **Sincronização offline**
- **Notificações push**
- **Compartilhamento** de projetos
- **Integração** com calendários
- **App mobile** nativo

## 🆘 Suporte

### Problemas Comuns
- **Erro de build**: Execute `npm run clean && npm install`
- **Tipos TypeScript**: Execute `npm run type-check`
- **Tema não aplica**: Limpe cache do navegador

### Contato
- **GitHub**: Repositório do projeto
- **Email**: Suporte técnico
- **Discord**: Comunidade

---

**Desenvolvido com ❤️ para usuários neurodivergentes**
