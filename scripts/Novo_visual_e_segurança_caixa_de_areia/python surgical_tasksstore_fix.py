#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORREÇÃO CIRÚRGICA FINAL - TASKSSTORE
Resolver definitivamente o problema de sintaxe
"""

import re
from pathlib import Path
from datetime import datetime

def surgical_fix_tasksstore():
    """
    Correção cirúrgica para separar interface de implementação
    """
    print("🔧 CORREÇÃO CIRÚRGICA FINAL - TASKSSTORE")
    print("=" * 50)
    
    tasks_store_path = Path("src/stores/tasksStore.ts")
    
    if not tasks_store_path.exists():
        print(f"❌ Arquivo não encontrado: {tasks_store_path}")
        return False
    
    # Backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{tasks_store_path}.backup_surgical_{timestamp}"
    
    try:
        content = tasks_store_path.read_text(encoding='utf-8')
        Path(backup_path).write_text(content, encoding='utf-8')
        print(f"💾 Backup criado: {backup_path}")
        
        print("🔍 Identificando estrutura...")
        
        # Encontrar início e fim da interface TasksState
        interface_start = content.find("interface TasksState {")
        if interface_start == -1:
            print("❌ Interface TasksState não encontrada")
            return False
        
        # Encontrar o final da interface (onde começa export const useTasksStore)
        export_start = content.find("export const useTasksStore = create")
        if export_start == -1:
            print("❌ Export da store não encontrado")
            return False
        
        print("✅ Estrutura identificada")
        
        # Extrair a parte da interface
        interface_section = content[interface_start:export_start]
        
        # Limpar a interface removendo QUALQUER implementação
        print("🧹 Limpando interface...")
        
        lines = interface_section.split('\n')
        clean_interface_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Se é uma linha de definição de tipo, manter
            if (': (' in line or ': string' in line or ': number' in line or ': boolean' in line or 
                'interface TasksState' in line or line.strip() == '{' or line.strip() == '}' or
                line.strip().startswith('//') or line.strip() == '' or
                ': Task' in line or ': Project' in line or ': Note' in line or
                '| null' in line or '[]' in line):
                clean_interface_lines.append(line)
                i += 1
                continue
            
            # Se contém implementação (=> { ou function body), pular
            if ('=>' in line and '{' in line) or 'set(state =>' in line:
                print(f"   🗑️ Removendo implementação: {line.strip()[:50]}...")
                i += 1
                # Pular até encontrar o final desta implementação
                brace_count = line.count('{') - line.count('}')
                while i < len(lines) and brace_count > 0:
                    i += 1
                    if i < len(lines):
                        brace_count += lines[i].count('{') - lines[i].count('}')
                        print(f"   🗑️ Removendo: {lines[i].strip()[:50]}...")
                continue
            
            # Manter outras linhas válidas da interface
            clean_interface_lines.append(line)
            i += 1
        
        # Reconstruir interface limpa
        clean_interface = '\n'.join(clean_interface_lines)
        
        # Garantir que a interface tem as definições necessárias
        layout_types = '''
  // Actions - Layout Management
  setLayoutMode: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  reorganizeNotes: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
'''
        
        # Verificar se precisa adicionar as definições
        if 'setLayoutMode:' not in clean_interface:
            # Encontrar onde inserir (antes de // Utilities)
            utils_pos = clean_interface.find('  // Utilities')
            if utils_pos != -1:
                clean_interface = clean_interface[:utils_pos] + layout_types + '\n' + clean_interface[utils_pos:]
                print("   ✅ Definições de layout adicionadas")
        
        # Reconstruir o arquivo completo
        new_content = content[:interface_start] + clean_interface + content[export_start:]
        
        # Agora garantir que as implementações estão no local correto
        print("🔧 Verificando implementações...")
        
        # Procurar onde adicionar implementações se não existirem
        impl_location = new_content.find('// Utilities\n      generateUniqueId: () =>')
        if impl_location == -1:
            impl_location = new_content.find('generateUniqueId: () => Date.now().toString()')
        
        if impl_location != -1 and 'setLayoutMode: (mode)' not in new_content:
            print("   🔧 Adicionando implementações...")
            
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
            
            new_content = new_content[:impl_location] + layout_implementations + new_content[impl_location:]
        
        # Verificar sandboxLayout inicial
        if 'layoutMode:' not in new_content or 'snapToGrid:' not in new_content:
            print("   🔧 Atualizando sandboxLayout inicial...")
            
            new_sandbox_layout = '''sandboxLayout: {
        notes: [],
        selectedNoteId: null,
        gridSize: 20,
        showGrid: false,
        layoutMode: 'free',
        snapToGrid: true,
        density: 'normal',
      },'''
            
            new_content = re.sub(r'sandboxLayout: \{[^}]+\},', new_sandbox_layout, new_content)
        
        # Salvar arquivo corrigido
        tasks_store_path.write_text(new_content, encoding='utf-8')
        print("   ✅ Arquivo reconstruído e salvo!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante correção cirúrgica: {e}")
        return False

if __name__ == "__main__":
    success = surgical_fix_tasksstore()
    
    if success:
        print("")
        print("🎉 CORREÇÃO CIRÚRGICA CONCLUÍDA!")
        print("✅ Interface e implementação separadas corretamente")
        print("")
        print("🚀 TESTE AGORA:")
        print("   npm run dev")
    else:
        print("❌ Falha na correção cirúrgica")
        print("💡 Recomendação: Usar PowerShell como fallback")