#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORREÇÃO EMERGENCIAL - tasksStore.ts
Corrige erro de sintaxe crítico causado pela aplicação incorreta do regex

PROBLEMA: Linha 155 - canAddTask: (energyPoints) => { misturada na interface
SOLUÇÃO: Corrigir definição da interface e implementação
"""

import shutil
from datetime import datetime
from pathlib import Path

def fix_syntax_error():
    """Corrige erro de sintaxe no tasksStore.ts"""
    print("🚨 CORREÇÃO EMERGENCIAL - tasksStore.ts")
    print("=" * 50)
    
    file_path = Path("src/stores/tasksStore.ts")
    
    if not file_path.exists():
        print(f"❌ ERRO: Arquivo não encontrado: {file_path}")
        return False
    
    # Backup de segurança
    backup_path = file_path.with_suffix(f".ts.backup_emergency_{datetime.now().strftime('%H%M%S')}")
    try:
        shutil.copy2(file_path, backup_path)
        print(f"📁 Backup criado: {backup_path.name}")
    except Exception as e:
        print(f"⚠️  Aviso: Não foi possível criar backup: {e}")
    
    try:
        # Ler arquivo
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("📖 Arquivo lido com sucesso")
        
        # Verificar e corrigir imports necessários
        if "import type { EnergyBudget } from './energyStore';" not in content:
            # Adicionar import do tipo EnergyBudget
            import_line = "import { useEnergyStore } from './energyStore';"
            if import_line in content:
                content = content.replace(
                    import_line,
                    import_line + "\nimport type { EnergyBudget } from './energyStore';"
                )
                print("✅ Import do tipo EnergyBudget adicionado")
        
        # Definir correção específica
        # PROBLEMA: A linha está misturada na interface
        problematic_section = """  // Actions - Energia
  canAddTask: (energyPoints) => {
  const state = get();
  const energyStore = useEnergyStore.getState();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.canPerformAction(energyPoints, usedEnergy);
},"""

        # SOLUÇÃO: Corrigir para definição de interface adequada
        corrected_section = """  // Actions - Energia
  canAddTask: (energyPoints: number) => boolean;
  getRemainingEnergy: () => number;
  calculateEnergyBudget: () => EnergyBudget;"""
        
        if problematic_section in content:
            content = content.replace(problematic_section, corrected_section)
            print("✅ Correção aplicada na interface")
        else:
            print("⚠️  Seção problemática não encontrada exatamente - aplicando correção alternativa")
            # Correção alternativa mais robusta
            lines = content.split('\n')
            corrected_lines = []
            i = 0
            
            while i < len(lines):
                line = lines[i].strip()
                
                # Encontrar a linha problemática
                if 'canAddTask: (energyPoints) => {' in line:
                    print(f"🎯 Encontrada linha problemática: {i+1}")
                    
                    # Substituir por definição correta da interface
                    corrected_lines.append("  // Actions - Energia")
                    corrected_lines.append("  canAddTask: (energyPoints: number) => boolean;")
                    corrected_lines.append("  getRemainingEnergy: () => number;")
                    corrected_lines.append("  calculateEnergyBudget: () => EnergyBudget;")
                    
                    # Pular todas as linhas até o próximo comentário ou final da seção
                    i += 1
                    while i < len(lines) and not lines[i].strip().startswith('//') and not lines[i].strip() == '}':
                        i += 1
                    
                    # Voltar uma linha para não pular o próximo item
                    if i < len(lines) and not lines[i].strip() == '}':
                        i -= 1
                else:
                    corrected_lines.append(lines[i])
                
                i += 1
            
            content = '\n'.join(corrected_lines)
        
        # Adicionar implementação no local correto (após a criação do store)
        # Procurar pela implementação existente e adicionar as funções de energia
        implementation_insertion_point = "      // Actions - Navegação"
        
        if implementation_insertion_point in content:
            energy_implementation = """      
      // Actions - Energia
      canAddTask: (energyPoints) => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.canPerformAction(energyPoints, usedEnergy);
      },
      
      getRemainingEnergy: () => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.getRemainingEnergy(usedEnergy);
      },
      
      calculateEnergyBudget: () => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.calculateBudget(usedEnergy);
      },

"""
            content = content.replace("      // Actions - Navegação", energy_implementation + "      // Actions - Navegação")
            print("✅ Implementação adicionada no local correto")
        
        # Salvar arquivo corrigido
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("💾 Arquivo salvo com correções")
        
        # Verificar sintaxe básica
        try:
            # Contagem básica de chaves balanceadas
            open_braces = content.count('{')
            close_braces = content.count('}')
            
            if open_braces != close_braces:
                print(f"⚠️  AVISO: Chaves não balanceadas ({open_braces} abrir, {close_braces} fechar)")
            else:
                print("✅ Verificação básica de sintaxe: OK")
        except Exception as e:
            print(f"⚠️  Não foi possível verificar sintaxe: {e}")
        
        print()
        print("✅ CORREÇÃO CONCLUÍDA!")
        print("🔄 Teste agora com: npm run dev")
        print(f"📁 Backup disponível em: {backup_path.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ ERRO durante correção: {e}")
        
        # Tentar restaurar backup se houver erro
        if backup_path.exists():
            try:
                shutil.copy2(backup_path, file_path)
                print(f"🔄 Backup restaurado automaticamente")
            except:
                pass
        
        return False

if __name__ == '__main__':
    success = fix_syntax_error()
    
    if success:
        print("\n🎉 PRONTO! Execute 'npm run dev' para testar")
    else:
        print("\n💥 FALHA! Verifique os erros acima")
        print("🔄 Restaure manualmente do backup se necessário")