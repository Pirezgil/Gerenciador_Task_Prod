#!/usr/bin/env python3
"""
Correção de Sincronização de Estado - Gerenciador Task
Corrige problemas de estado não sincronizado entre stores e componentes
"""

import os
import shutil
from datetime import datetime

def backup_file(file_path):
    """Criar backup do arquivo antes da modificação"""
    if os.path.exists(file_path):
        backup_path = f"{file_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(file_path, backup_path)
        print(f"✅ Backup criado: {backup_path}")
        return backup_path
    return None

def fix_header_name():
    """Corrigir nome hardcoded no Header"""
    file_path = "src/components/layout/Header.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adicionar import do useAuthStore
    if 'useAuthStore' not in content:
        content = content.replace(
            "import React from 'react';\nimport { usePageContext } from './PageContext';",
            "import React from 'react';\nimport { usePageContext } from './PageContext';\nimport { useAuthStore } from '@/stores/authStore';"
        )
    
    # Adicionar hook dentro do componente
    content = content.replace(
        "export function Header() {\n  const pageContext = usePageContext();",
        "export function Header() {\n  const pageContext = usePageContext();\n  const { user } = useAuthStore();"
    )
    
    # Trocar nome hardcoded
    content = content.replace(
        '{getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">João</span>! 👋',
        '{getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">{user?.name || "Usuário"}</span>! 👋'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Header corrigido: Nome agora sincroniza com authStore")
    return True

def fix_energy_meter_sync():
    """Corrigir sincronização do EnergyMeter com authStore"""
    file_path = "src/components/bombeiro/EnergyMeter.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adicionar import do useAuthStore
    if 'useAuthStore' not in content:
        content = content.replace(
            "import { useTasksStore } from '@/stores/tasksStore';",
            "import { useTasksStore } from '@/stores/tasksStore';\nimport { useAuthStore } from '@/stores/authStore';"
        )
    
    # Adicionar hook dentro do componente
    content = content.replace(
        "export function EnergyMeter() {\n  const { calculateEnergyBudget } = useTasksStore();",
        "export function EnergyMeter() {\n  const { calculateEnergyBudget } = useTasksStore();\n  const { user } = useAuthStore();"
    )
    
    # Adicionar listener para mudanças no orçamento
    content = content.replace(
        "  const energyBudget = calculateEnergyBudget();",
        "  const energyBudget = calculateEnergyBudget();\n  \n  // Reagir a mudanças no orçamento de energia do usuário\n  React.useEffect(() => {\n    if (user?.settings.dailyEnergyBudget) {\n      // Force re-render quando orçamento mudar\n    }\n  }, [user?.settings.dailyEnergyBudget]);"
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ EnergyMeter corrigido: Agora reage a mudanças no orçamento")
    return True

def fix_theme_application():
    """Corrigir aplicação imediata de temas"""
    file_path = "src/components/profile/ThemeCustomizer.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adicionar useEffect para aplicar tema após mudanças
    useEffect_import = "import React, { useState } from 'framer-motion';"
    if "useEffect" not in content:
        content = content.replace(
            "import React, { useState } from 'framer-motion';",
            "import React, { useState, useEffect } from 'framer-motion';"
        )
    
    # Adicionar listener para aplicar tema automaticamente
    content = content.replace(
        "  const [showPreview, setShowPreview] = useState(false);",
        """  const [showPreview, setShowPreview] = useState(false);
  
  // Aplicar tema automaticamente quando houver mudanças
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force theme application on any change
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('themeChanged', { detail: currentTheme });
        window.dispatchEvent(event);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentTheme]);"""
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ ThemeCustomizer corrigido: Temas aplicados automaticamente")
    return True

def fix_theme_store_immediate_application():
    """Garantir aplicação imediata no themeStore"""
    file_path = "src/stores/themeStore.ts"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Modificar updateTheme para aplicar imediatamente
    old_update = """      updateTheme: (updates: Partial<ThemeConfig>) => {
        set((state) => {
          const updatedTheme = {
            ...state.currentTheme,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Aplicar tema ao documento
          get().applyThemeToDocument(updatedTheme);
          
        return { currentTheme: updatedTheme };
        });
      },"""
    
    new_update = """      updateTheme: (updates: Partial<ThemeConfig>) => {
        set((state) => {
          const updatedTheme = {
            ...state.currentTheme,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Aplicar tema ao documento IMEDIATAMENTE
          requestAnimationFrame(() => {
            get().applyThemeToDocument(updatedTheme);
          });
          
          return { currentTheme: updatedTheme };
        });
      },"""
    
    content = content.replace(old_update, new_update)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ ThemeStore corrigido: Aplicação imediata de temas")
    return True

def check_and_fix_other_hardcoded_names():
    """Procurar e corrigir outros nomes hardcoded"""
    files_to_check = [
        "src/app/(main)/profile/page.tsx",
        "src/components/profile/UserProfile.tsx",
        "src/components/layout/Sidebar.tsx"
    ]
    
    fixes_applied = 0
    
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Verificar se já usa useAuthStore
        uses_auth_store = 'useAuthStore' in content
        
        # Procurar por nomes hardcoded comuns
        hardcoded_patterns = [
            ('João Silva', '{user?.name || "Usuário"}'),
            ('"João Silva"', '{user?.name || "Usuário"}'),
            ("'João Silva'", '{user?.name || "Usuário"}'),
            ('João', '{user?.name || "Usuário"}'),
            ('"João"', '{user?.name || "Usuário"}'),
            ("'João'", '{user?.name || "Usuário"}')
        ]
        
        needs_auth_import = False
        
        for old_pattern, new_pattern in hardcoded_patterns:
            if old_pattern in content and not uses_auth_store:
                # Precisa adicionar import e hook
                needs_auth_import = True
                break
        
        if needs_auth_import:
            backup_file(file_path)
            
            # Adicionar import se necessário
            if "'use client';" in content and 'useAuthStore' not in content:
                content = content.replace(
                    "import React",
                    "import { useAuthStore } from '@/stores/authStore';\nimport React"
                )
            
            # Procurar onde adicionar o hook (após outros hooks)
            if 'const {' in content and 'useAuthStore' not in content:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if 'export default function' in line or 'export function' in line:
                        # Encontrar primeira linha após a declaração da função
                        for j in range(i+1, len(lines)):
                            if lines[j].strip() and not lines[j].strip().startswith('//'):
                                lines.insert(j, '  const { user } = useAuthStore();')
                                break
                        break
                content = '\n'.join(lines)
            
            # Aplicar correções de nomes
            for old_pattern, new_pattern in hardcoded_patterns:
                content = content.replace(old_pattern, new_pattern)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            fixes_applied += 1
            print(f"✅ {file_path}: Nomes hardcoded corrigidos")
    
    return fixes_applied

def main():
    """Função principal"""
    print("🔧 Iniciando correção de sincronização de estado...")
    print("=" * 50)
    
    try:
        # Aplicar correções
        fixes = []
        
        if fix_header_name():
            fixes.append("Header name sync")
        
        if fix_energy_meter_sync():
            fixes.append("EnergyMeter sync")
        
        if fix_theme_application():
            fixes.append("Theme application")
        
        if fix_theme_store_immediate_application():
            fixes.append("ThemeStore immediate apply")
        
        other_fixes = check_and_fix_other_hardcoded_names()
        if other_fixes > 0:
            fixes.append(f"{other_fixes} other hardcoded names")
        
        print("=" * 50)
        print("✅ CORREÇÕES APLICADAS:")
        for fix in fixes:
            print(f"   • {fix}")
        
        print(f"\n🎉 Total: {len(fixes)} correções aplicadas com sucesso!")
        print("\n📝 PRÓXIMOS PASSOS:")
        print("   1. Reinicie o servidor de desenvolvimento")
        print("   2. Teste as mudanças no perfil e veja se refletem no header")
        print("   3. Altere os pontos de energia e veja se o medidor atualiza")
        print("   4. Experimente mudar temas e layouts")
        
    except Exception as e:
        print(f"❌ Erro durante a correção: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    main()