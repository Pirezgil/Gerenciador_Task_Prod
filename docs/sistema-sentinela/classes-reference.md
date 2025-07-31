# 📚 Referência de Classes - Sistema Sentinela

## 🎨 **Cores Base**

### Backgrounds
- `bg-background` - #F7F7F7 (Branco Neve)
- `bg-surface` - #FFFFFF (Branco Puro)
- `bg-primary-500` - #5B86E5 (Azul Sereno)

### Textos
- `text-text-primary` - #333740 (Cinza Nanquim)
- `text-text-secondary` - #64748B (Cinza Médio)
- `text-text-muted` - #94A3B8 (Cinza Claro)

### Bordas
- `border-border` - #EAEAEA (Cinza Suave)
- `border-primary-500` - #5B86E5 (Azul Sereno)

## ⚡ **Sistema de Energia**

### Backgrounds
- `bg-energia-baixa` - #6DD58C (Verde Menta)
- `bg-energia-normal` - #5B86E5 (Azul Sereno)  
- `bg-energia-alta` - #FFB36B (Laranja Suave)

### Transparências
- `bg-energia-baixa/10` - 10% transparência
- `bg-energia-baixa/20` - 20% transparência
- `bg-energia-baixa/30` - 30% transparência

### Textos
- `text-energia-baixa` - Verde Menta
- `text-energia-normal` - Azul Sereno
- `text-energia-alta` - Laranja Suave

### Sombras Especiais
- `shadow-energia-baixa` - Sombra verde suave
- `shadow-energia-normal` - Sombra azul suave
- `shadow-energia-alta` - Sombra laranja suave

## 🎯 **Cores Semânticas**

### Sucesso
- `bg-semantic-success` - #6DD58C
- `bg-semantic-success/20` - Fundo sutil
- `text-semantic-success` - Texto verde
- `border-semantic-success/30` - Borda sutil

### Alerta
- `bg-semantic-warning` - #FFB36B
- `bg-semantic-warning/20` - Fundo sutil
- `text-semantic-warning` - Texto laranja

### Informação
- `bg-semantic-alert` - #FFD76B
- `bg-semantic-alert/20` - Fundo sutil
- `text-semantic-alert` - Texto âmbar

## 🧱 **Componentes**

### Cards
- `.sentinela-card` - Card padrão com sombra suave
- `.sentinela-card-soft` - Card com fundo transparente

### Botões
- `.sentinela-btn` - Botão base
- `.sentinela-btn-primary` - Botão principal (azul)
- `.sentinela-btn-secondary` - Botão secundário (outline)
- `.sentinela-btn-soft` - Botão suave (fundo sutil)

### Energia em Botões (Tailwind)
- `variant="energia-baixa"` - Botão verde menta
- `variant="energia-normal"` - Botão azul sereno
- `variant="energia-alta"` - Botão laranja suave

## 📝 **Tipografia**

### Hierarquia
- `.sentinela-title` - H1/H2 principais (1.875rem, weight 600)
- `.sentinela-subtitle` - H3/H4 secundários (1.25rem, weight 500)
- `.sentinela-text` - Texto padrão
- `.sentinela-text-secondary` - Texto de apoio
- `.sentinela-text-muted` - Texto desbotado

### Classes Tailwind
- `font-sans` - Inter, Poppins (interface)
- `font-serif` - Lora, Merriweather (leitura)

## 🎭 **Animações**

### Classes CSS
- `.sentinela-transition` - Transição suave (0.2s ease)
- `.sentinela-fade-in` - Fade-in suave

### Classes Tailwind
- `animate-fade-in` - Fade-in personalizado
- `animate-slide-up` - Slide up suave
- `animate-pulse-soft` - Pulse sutil
- `animate-hover-float` - Flutuação no hover

## 🔲 **Sombras**

- `shadow-soft` - 0 2px 15px rgba(0, 0, 0, 0.08)
- `shadow-medium` - 0 4px 25px rgba(0, 0, 0, 0.12)
- `shadow-large` - 0 8px 40px rgba(0, 0, 0, 0.16)

## 📐 **Bordas e Raios**

- `rounded-xl` - 12px
- `rounded-2xl` - 16px (padrão Sentinela)
- `rounded-3xl` - 24px (cards especiais)

## 🎨 **O Pátio (Módulo Especial)**

- `bg-patio-background` - #F5F0E6 (Bege Papel)
- `text-patio-text` - #5D4037 (Marrom Escuro)
- `.patio-container` - Container especial do Pátio
- `.patio-text` - Texto com line-height otimizado

## 📱 **Estados Responsivos**

### Mobile (< 768px)
- Raios menores (12px)
- Padding reduzido
- Fonte menor para títulos

### Desktop (≥ 768px)  
- Raios padrão (16px)
- Padding completo
- Fonte padrão

---

**💡 Dica:** Use sempre as classes Sentinela em vez de Tailwind direto para garantir consistência visual!
