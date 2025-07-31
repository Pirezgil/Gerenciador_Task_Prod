# 🎨 Sistema Sentinela - Design System

**Versão:** 2.0  
**Última atualização:** Janeiro 2025  
**Status:** ✅ Implementado e Padronizado

## 📖 Visão Geral

O Sistema Sentinela é o design system oficial do Gerenciador_Task, baseado na filosofia de **"Minimalismo Acolhedor"** - interfaces que são modernas e eficientes, mas nunca frias ou corporativas.

## 🎯 Princípios Fundamentais

### 1. **Minimalismo Acolhedor**
- Layouts limpos baseados em grids
- Apenas elementos essenciais visíveis
- Complexidade revelada sob demanda
- Amplo uso de espaço em branco

### 2. **Cores Fracas e Dessaturadas**
- Ambiente de baixa estimulação
- Cores fortes apenas para ações importantes
- Paleta calmante e intencional

### 3. **Geometria Acolhedora**
- Cantos arredondados em todos os elementos
- Texturas sutis
- Sombras suaves

## 🎨 Paleta de Cores

### **Cores Primárias**
```css
--sentinela-primary: #5B86E5;        /* Azul Sereno */
--sentinela-background: #F7F7F7;     /* Branco Neve */
--sentinela-surface: #FFFFFF;
--sentinela-text: #333740;           /* Cinza Nanquim */
--sentinela-border: #EAEAEA;         /* Cinza Suave */
```

### **Sistema de Energia**
```css
--energia-baixa: #6DD58C;            /* 🔋 Verde Menta */
--energia-normal: #5B86E5;           /* 🧠 Azul Sereno */
--energia-alta: #FFB36B;             /* ⚡ Laranja Suave */
```

### **Cores Semânticas**
```css
--sentinela-alert: #FFD76B;          /* Amarelo Âmbar */
--sentinela-success: #6DD58C;        /* Verde Menta */
--sentinela-warning: #FFB36B;        /* Laranja Suave */
```

## 🧱 Componentes Base

### **Cards Acolhedores**
```css
.sentinela-card {
  background: var(--sentinela-surface);
  border: 1px solid var(--sentinela-border);
  border-radius: var(--sentinela-radius);  /* 16px */
  padding: 1.5rem;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.sentinela-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
}
```

### **Botões Sentinela**
```css
.sentinela-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--sentinela-radius);
  font-weight: 500;
  transition: all 0.2s ease;
}

.sentinela-btn-primary {
  background: var(--sentinela-primary);
  color: white;
}

.sentinela-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3);
}
```

## 📚 Classes Utilitárias

### **Tipografia**
- `.sentinela-title` - Títulos principais (1.875rem, peso 600)
- `.sentinela-subtitle` - Subtítulos (1.25rem, peso 500)  
- `.sentinela-text` - Texto padrão
- `.sentinela-text-secondary` - Texto secundário
- `.sentinela-text-muted` - Texto desbotado

### **Animações**
- `.sentinela-transition` - Transição suave padrão
- `.sentinela-fade-in` - Animação de fade-in
- `.animate-hover-float` - Efeito de flutuação no hover

### **Energia Visual**
- `.energia-baixa-indicador` - Indicador verde menta
- `.energia-normal-indicador` - Indicador azul sereno
- `.energia-alta-indicador` - Indicador laranja suave

## 🎯 Exemplo de Uso

```tsx
// ✅ BOM - Usando classes Sentinela
<div className="sentinela-card sentinela-fade-in">
  <h2 className="sentinela-title">Título</h2>
  <p className="sentinela-text-secondary">Descrição</p>
  <button className="sentinela-btn sentinela-btn-primary">
    Ação
  </button>
</div>

// ❌ EVITAR - Classes hardcoded
<div className="bg-white/70 rounded-2xl p-6 shadow-xl">
  <h2 className="text-xl font-bold text-gray-800">Título</h2>
  <p className="text-sm text-gray-600">Descrição</p>
  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
    Ação
  </button>
</div>
```

## 🔧 Tailwind Integration

O Sistema Sentinela é completamente integrado com Tailwind CSS:

```tsx
// Classes do sistema disponíveis
className="bg-energia-baixa text-white shadow-energia-baixa"
className="bg-semantic-success/20 border-semantic-success/30"
className="sentinela-card hover:shadow-medium"
```

## 📱 Responsividade

```css
/* Mobile First */
@media (max-width: 768px) {
  :root {
    --sentinela-radius: 12px;
    --sentinela-spacing: 0.75rem;
  }
}
```

## ✅ Checklist de Implementação

Ao criar novos componentes, verifique:

- [ ] ✅ Usa classes `.sentinela-*` em vez de Tailwind direto
- [ ] ✅ Aplica `.sentinela-transition` para animações
- [ ] ✅ Usa variáveis CSS em vez de cores hardcoded
- [ ] ✅ Implementa cantos arredondados (rounded-xl/2xl)
- [ ] ✅ Aplica sombras suaves (.shadow-soft/.shadow-medium)
- [ ] ✅ Segue hierarquia tipográfica (.sentinela-title/.sentinela-text)
- [ ] ✅ Usa sistema de energia quando apropriado
- [ ] ✅ Implementa estados de hover acolhedores

---

**📞 Suporte:** Para dúvidas sobre implementação, consulte a equipe de Frontend ou este guia.
