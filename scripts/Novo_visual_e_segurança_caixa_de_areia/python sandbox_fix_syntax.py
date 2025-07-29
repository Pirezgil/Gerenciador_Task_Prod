#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORREÇÃO RÁPIDA - ERRO DE SINTAXE TASKSSTORE
Corrigir problema de mistura entre interface e implementação
"""

import os
import re
from pathlib import Path
from datetime import datetime

def fix_tasksstore_syntax():
    """
    Corrigir erro de sintaxe específico no tasksStore.ts
    """
    print("🔧 CORREÇÃO RÁPIDA - SINTAXE TASKSSTORE")
    print("=" * 50)
    
    # Localizar arquivo
    project_root = Path(".")
    tasks_store_path = project_root / "src/stores/tasksStore.ts"
    
    if not tasks_store_path.exists():
        print(f"❌ Arquivo não encontrado: {tasks_store_path}")
        return False
    
    # Backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{tasks_store_path}.backup_syntax_fix_{timestamp}"
    
    try:
        content = tasks_store_path.read_text(encoding='utf-8')
        Path(backup_path).write_text(content, encoding='utf-8')
        print(f"💾 Backup criado: {backup_path}")
        
        # Identificar e corrigir o problema
        print("🔍 Analisando erro de sintaxe...")
        
        # O problema está na mistura de definição de interface com implementação
        # Vamos remover a implementação mal posicionada e deixar apenas as definições de tipo
        
        # Padrão problemático encontrado no erro
        problematic_pattern = r'  reorganizeNotes: \(mode: \'free\' \| \'grid\' \| \'list\' \| \'masonry\'\) => void;\s*// Actions - Layout Management\s*setLayoutMode: \(mode\) => \{[^}]+\}[^}]+\},'
        
        # Verificar se o padrão problemático existe
        if re.search(problematic_pattern, content, re.DOTALL):
            print("   ✅ Padrão problemático identificado")
            # Remover a implementação incorreta
            content = re.sub(problematic_pattern, '  reorganizeNotes: (mode: \'free\' | \'grid\' | \'list\' | \'masonry\') => void;', content, flags=re.DOTALL)
        else:
            # Abordagem mais específica baseada no erro
            # Procurar pela linha com problema e corrigir
            lines = content.split('\n')
            corrected_lines = []
            skip_next = False
            
            for i, line in enumerate(lines):
                if skip_next:
                    skip_next = False
                    continue
                
                # Identificar a linha problemática
                if 'reorganizeNotes: (mode:' in line and '=>' in line and 'void;' in line:
                    # Esta é a linha da interface, manter
                    corrected_lines.append(line)
                    
                    # Verificar se as próximas linhas são implementação que devem ser removidas
                    j = i + 1
                    while j < len(lines) and (
                        '// Actions - Layout Management' in lines[j] or
                        'setLayoutMode: (mode) =>' in lines[j] or
                        'set(state => ({' in lines[j] or
                        'sandboxLayout: {' in lines[j] or
                        '}));' in lines[j] or
                        '},' in lines[j]
                    ):
                        j += 1
                    
                    # Pular as linhas de implementação incorreta
                    if j > i + 1:
                        # Encontrou implementação após definição de tipo - remover
                        print(f"   🔧 Removendo implementação incorreta nas linhas {i+2} a {j}")
                        # Continuar a partir da linha j
                        for k in range(i + 1, j):
                            skip_next = True
                        continue
                
                corrected_lines.append(line)
            
            content = '\n'.join(corrected_lines)
        
        # Verificar se precisa adicionar as implementações no local correto
        # Procurar pelo local da implementação (após o estado inicial)
        implementation_location = content.find('// Utilities\n      generateUniqueId: () =>')
        
        if implementation_location == -1:
            print("   ⚠️ Local de implementação não encontrado, tentando padrão alternativo...")
            implementation_location = content.find('generateUniqueId: () => Date.now().toString()')
        
        if implementation_location != -1:
            # Verificar se as implementações já existem
            if 'setLayoutMode: (mode)' not in content:
                print("   🔧 Adicionando implementações das funções de layout...")
                
                layout_implementations = '''
      // Actions - Layout Management
      setLayoutMode: (mode) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, layoutMode: mode }
        }));
      },
      
      setSnapToGrid: (snap) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, snapToGrid: snap }
        }));
      },
      
      setGridSize: (size) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, gridSize: size }
        }));
      },
      
      setShowGrid: (show) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, showGrid: show }
        }));
      },
      
      reorganizeNotes: (mode) => {
        const state = get();
        const notes = state.sandboxLayout.notes;
        const newNotes = [...notes];
        
        switch (mode) {
          case 'grid':
            const cols = Math.floor((window?.innerWidth || 1200) / 320);
            newNotes.forEach((note, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              note.position = {
                x: 50 + (col * 320),
                y: 150 + (row * 220)
              };
            });
            break;
          
          case 'list':
            newNotes.forEach((note, index) => {
              note.position = {
                x: 50,
                y: 150 + (index * 180)
              };
            });
            break;
        }
        
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, notes: newNotes }
        }));
      },

      '''
                
                # Inserir antes da linha do generateUniqueId
                content = content[:implementation_location] + layout_implementations + content[implementation_location:]
        
        # Verificar se a interface tem as definições necessárias
        interface_match = re.search(r'interface TasksState \{(.*?)(?=\n\s*// Actions|\n\s*generateUniqueId)', content, re.DOTALL)
        if interface_match and 'setLayoutMode:' not in interface_match.group(1):
            print("   🔧 Adicionando definições de tipo na interface...")
            
            layout_types = '''
  // Actions - Layout Management
  setLayoutMode: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  reorganizeNotes: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
  '''
            
            # Encontrar onde inserir (antes de // Actions ou generateUniqueId)
            insert_pos = content.find('  // Utilities\n  generateUniqueId: () => string;')
            if insert_pos != -1:
                content = content[:insert_pos] + layout_types + '\n  ' + content[insert_pos:]
        
        # Verificar se o sandboxLayout tem os campos necessários
        sandbox_layout_match = re.search(r'sandboxLayout: \{([^}]+)\}', content)
        if sandbox_layout_match and 'layoutMode:' not in sandbox_layout_match.group(1):
            print("   🔧 Atualizando estado inicial do sandboxLayout...")
            
            new_sandbox_layout = '''sandboxLayout: {
        notes: [],
        selectedNoteId: null,
        gridSize: 20,
        showGrid: false,
        layoutMode: 'free',
        snapToGrid: true,
        density: 'normal',
      },'''
            
            content = re.sub(r'sandboxLayout: \{[^}]+\},', new_sandbox_layout, content)
        
        # Salvar arquivo corrigido
        tasks_store_path.write_text(content, encoding='utf-8')
        print("   ✅ Arquivo corrigido e salvo!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante correção: {e}")
        return False

if __name__ == "__main__":
    success = fix_tasksstore_syntax()
    
    if success:
        print("")
        print("🎉 CORREÇÃO DE SINTAXE CONCLUÍDA!")
        print("✅ O erro foi corrigido com sucesso")
        print("")
        print("🚀 PRÓXIMOS PASSOS:")
        print("   1. Execute novamente: npm run dev")
        print("   2. Acesse http://localhost:3000")
        print("   3. Teste a aba 'Caixa de Areia'")
        print("   4. Aproveite os novos layouts customizáveis!")
    else:
        print("")
        print("❌ Não foi possível corrigir automaticamente")
        print("💡 Solução manual:")
        print("   1. Abra src/stores/tasksStore.ts")
        print("   2. Remova as linhas de implementação misturadas na interface")
        print("   3. Mantenha apenas as definições de tipo na interface TasksState")