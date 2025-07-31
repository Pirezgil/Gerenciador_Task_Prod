# 🚀 Guia de Migração - Sistema Sentinela

## 📋 Substituições Comuns

### **Backgrounds**
```tsx
// ❌ Antes
className="bg-white/70 backdrop-blur-xl"

// ✅ Depois  
className="sentinela-card"
```

### **Textos**
```tsx
// ❌ Antes
className="text-xl font-bold text-gray-800"

// ✅ Depois
className="sentinela-title"
```

### **Botões**
```tsx
// ❌ Antes
className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"

// ✅ Depois
className="sentinela-btn sentinela-btn-primary"
```

### **Energia**
```tsx
// ❌ Antes
className="bg-green-200 text-green-800"

// ✅ Depois
className="bg-energia-baixa/20 text-energia-baixa"
```

## 🛠️ Script de Migração Automática

```bash
# Executar refatoração automática
python run.py manifest.yaml

# Verificar mudanças
git diff

# Testar componentes
npm run dev
```

## ✅ Validação Pós-Migração

1. **Visual:** Verificar se os componentes mantêm aparência
2. **Animações:** Testar hover states e transições
3. **Responsividade:** Verificar em mobile e desktop
4. **Consistência:** Comparar com outros componentes migrados
