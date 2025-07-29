#!/usr/bin/env python3
"""
Correção de Erros Específicos - Gerenciador Task
Corrige useEffect não importado e sincronização de energia
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

def fix_useeffect_import():
    """Corrigir import do useEffect no ThemeCustomizer"""
    file_path = "src/components/profile/ThemeCustomizer.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Corrigir o import do React para incluir useEffect
    old_import = "import React, { useState } from 'react';"
    new_import = "import React, { useState, useEffect } from 'react';"
    
    if old_import in content:
        content = content.replace(old_import, new_import)
        print("✅ Import do useEffect corrigido")
    else:
        # Verificar se já tem useEffect
        if "useEffect" not in content or "import React" not in content:
            print("⚠️ Padrão de import não encontrado, tentando correção alternativa...")
            # Tentar encontrar qualquer import do React
            if "import React" in content:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if "import React" in line and "useState" in line and "useEffect" not in line:
                        lines[i] = line.replace("{ useState }", "{ useState, useEffect }")
                        break
                content = '\n'.join(lines)
                print("✅ Import do useEffect corrigido (método alternativo)")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ ThemeCustomizer corrigido: useEffect agora importado")
    return True

def fix_energy_budget_sync():
    """Corrigir sincronização de energia entre tasksStore e authStore"""
    file_path = "src/stores/tasksStore.ts"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adicionar import do useAuthStore se não existir
    if "import { useAuthStore }" not in content:
        # Encontrar a linha dos imports de stores
        import_line = "import { create } from 'zustand';"
        if import_line in content:
            content = content.replace(
                import_line,
                import_line + "\nimport { useAuthStore } from './authStore';"
            )
            print("✅ Import do useAuthStore adicionado")
    
    # Modificar a função calculateEnergyBudget para usar o valor do authStore
    old_calculate = """      calculateEnergyBudget: () => {
        const state = get();
        const used = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);

        return {
          used,
          total: state.energyBudget.total,
          remaining: state.energyBudget.total - used,
          percentage: Math.min((used / state.energyBudget.total) * 100, 100),
          isOverBudget: used > state.energyBudget.total,
          isComplete: used === state.energyBudget.total,
        };
      },"""
    
    new_calculate = """      calculateEnergyBudget: () => {
        const state = get();
        
        // Buscar o orçamento atual do authStore
        const authState = useAuthStore.getState();
        const dailyBudget = authState.user?.settings.dailyEnergyBudget || 12;
        
        const used = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);

        return {
          used,
          total: dailyBudget,
          remaining: dailyBudget - used,
          percentage: Math.min((used / dailyBudget) * 100, 100),
          isOverBudget: used > dailyBudget,
          isComplete: used === dailyBudget,
        };
      },"""
    
    if old_calculate in content:
        content = content.replace(old_calculate, new_calculate)
        print("✅ calculateEnergyBudget modificado para usar authStore")
    else:
        print("⚠️ Padrão exato não encontrado, tentando correção por partes...")
        
        # Método alternativo: substituir só a parte crítica
        if "total: state.energyBudget.total," in content:
            content = content.replace(
                "const state = get();",
                """const state = get();
        
        // Buscar o orçamento atual do authStore
        const authState = useAuthStore.getState();
        const dailyBudget = authState.user?.settings.dailyEnergyBudget || 12;"""
            )
            
            content = content.replace("total: state.energyBudget.total,", "total: dailyBudget,")
            content = content.replace("remaining: state.energyBudget.total - used,", "remaining: dailyBudget - used,")
            content = content.replace("percentage: Math.min((used / state.energyBudget.total) * 100, 100),", "percentage: Math.min((used / dailyBudget) * 100, 100),")
            content = content.replace("isOverBudget: used > state.energyBudget.total,", "isOverBudget: used > dailyBudget,")
            content = content.replace("isComplete: used === state.energyBudget.total,", "isComplete: used === dailyBudget,")
            
            print("✅ calculateEnergyBudget modificado (método alternativo)")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ TasksStore corrigido: Energia agora sincroniza com authStore")
    return True

def fix_energy_meter_reactivity():
    """Garantir que EnergyMeter reaja a mudanças no authStore"""
    file_path = "src/components/bombeiro/EnergyMeter.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    backup_file(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adicionar import do useAuthStore se não existir
    if "import { useAuthStore }" not in content:
        content = content.replace(
            "import { useTasksStore } from '@/stores/tasksStore';",
            "import { useTasksStore } from '@/stores/tasksStore';\nimport { useAuthStore } from '@/stores/authStore';"
        )
        print("✅ Import do useAuthStore adicionado ao EnergyMeter")
    
    # Adicionar hook do authStore para reatividade
    if "const { user } = useAuthStore();" not in content:
        content = content.replace(
            "export function EnergyMeter() {\n  const { calculateEnergyBudget } = useTasksStore();",
            "export function EnergyMeter() {\n  const { calculateEnergyBudget } = useTasksStore();\n  const { user } = useAuthStore(); // Para reatividade"
        )
        print("✅ Hook do useAuthStore adicionado para reatividade")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ EnergyMeter corrigido: Agora reativo às mudanças do authStore")
    return True

def verify_fixes():
    """Verificar se as correções foram aplicadas"""
    issues = []
    
    # Verificar ThemeCustomizer
    theme_file = "src/components/profile/ThemeCustomizer.tsx"
    if os.path.exists(theme_file):
        with open(theme_file, 'r', encoding='utf-8') as f:
            content = f.read()
        if "useEffect" not in content or "import React, { useState, useEffect }" not in content:
            issues.append("ThemeCustomizer: useEffect ainda não está importado")
    
    # Verificar tasksStore
    tasks_file = "src/stores/tasksStore.ts"
    if os.path.exists(tasks_file):
        with open(tasks_file, 'r', encoding='utf-8') as f:
            content = f.read()
        if "useAuthStore.getState()" not in content:
            issues.append("tasksStore: Ainda não usa authStore para energia")
    
    # Verificar EnergyMeter
    energy_file = "src/components/bombeiro/EnergyMeter.tsx"
    if os.path.exists(energy_file):
        with open(energy_file, 'r', encoding='utf-8') as f:
            content = f.read()
        if "useAuthStore" not in content:
            issues.append("EnergyMeter: Ainda não importa useAuthStore")
    
    return issues

def main():
    """Função principal"""
    print("🔧 Iniciando correção de erros específicos...")
    print("=" * 50)
    
    try:
        # Aplicar correções
        fixes_applied = []
        
        if fix_useeffect_import():
            fixes_applied.append("useEffect import")
        
        if fix_energy_budget_sync():
            fixes_applied.append("Energy budget sync")
        
        if fix_energy_meter_reactivity():
            fixes_applied.append("EnergyMeter reactivity")
        
        print("=" * 50)
        print("✅ CORREÇÕES APLICADAS:")
        for fix in fixes_applied:
            print(f"   • {fix}")
        
        # Verificar se as correções funcionaram
        issues = verify_fixes()
        if issues:
            print(f"\n⚠️ POSSÍVEIS PROBLEMAS DETECTADOS:")
            for issue in issues:
                print(f"   • {issue}")
        
        print(f"\n🎉 {len(fixes_applied)} correções aplicadas!")
        print("\n📝 TESTE AGORA:")
        print("   1. Reinicie o servidor: Ctrl+C e npm run dev")
        print("   2. Vá para /settings - não deve dar erro de useEffect")
        print("   3. Mude os pontos de energia no perfil")
        print("   4. Vá para /bombeiro - energia deve estar atualizada")
        
    except Exception as e:
        print(f"❌ Erro durante a correção: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    main()