#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORREÇÃO RÁPIDA - AUTH STORE SANDBOX
Adicionar sandboxAuth ao authStore
"""

import re
from pathlib import Path
from datetime import datetime

def fix_auth_store_quick():
    """
    Adicionar sandboxAuth ao authStore rapidamente
    """
    print("🔧 CORREÇÃO RÁPIDA - AUTH STORE SANDBOX")
    print("=" * 50)
    
    # Localizar arquivo
    auth_store_path = Path("src/stores/authStore.ts")
    
    if not auth_store_path.exists():
        print(f"❌ Arquivo não encontrado: {auth_store_path}")
        return False
    
    # Backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{auth_store_path}.backup_sandbox_fix_{timestamp}"
    
    try:
        content = auth_store_path.read_text(encoding='utf-8')
        Path(backup_path).write_text(content, encoding='utf-8')
        print(f"💾 Backup criado: {backup_path}")
        
        # Verificar se já tem sandboxAuth
        if 'sandboxAuth:' in content:
            print("   ℹ️ sandboxAuth já existe no authStore")
            
            # Verificar se tem as funções
            if 'unlockSandbox' not in content:
                print("   🔧 Adicionando funções de sandbox...")
                
                # Adicionar funções na interface
                interface_pattern = r'(interface AuthState \{[^}]+)(  \/\/ Utilities|  generateId:)'
                if re.search(interface_pattern, content):
                    sandbox_actions_interface = '''
  // Actions - Sandbox Security
  unlockSandbox: () => void;
  lockSandbox: () => void;
  
  \\2'''
                    content = re.sub(interface_pattern, '\\1' + sandbox_actions_interface, content)
                
                # Adicionar implementações
                impl_pattern = r'(      \/\/ Utilities\s+generateId:)'
                if re.search(impl_pattern, content):
                    sandbox_implementations = '''
      // Actions - Sandbox Security
      unlockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: true,
            lastUnlockTime: new Date().toISOString(),
            failedAttempts: 0
          }
        }));
      },
      
      lockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: false,
            lastUnlockTime: undefined
          }
        }));
      },

      \\1'''
                    content = re.sub(impl_pattern, sandbox_implementations, content)
                
                auth_store_path.write_text(content, encoding='utf-8')
                print("   ✅ Funções de sandbox adicionadas!")
            else:
                print("   ✅ Funções de sandbox já existem!")
            
            return True
        
        print("   🔧 Adicionando sandboxAuth completo...")
        
        # Adicionar SandboxAuth na interface principal se não existir
        if 'sandboxAuth: SandboxAuth;' not in content:
            # Procurar onde adicionar na interface AuthState
            interface_match = re.search(r'interface AuthState \{([^}]+)\}', content, re.DOTALL)
            if interface_match:
                interface_content = interface_match.group(1)
                
                # Adicionar sandboxAuth na interface
                new_interface_content = interface_content + '''
  sandboxAuth: SandboxAuth;'''
                
                content = content.replace(interface_match.group(0), 
                    f'interface AuthState {{{new_interface_content}\n}}')
        
        # Adicionar sandboxAuth no estado inicial
        if 'sandboxAuth:' not in content:
            # Procurar estado inicial
            initial_state_match = re.search(r'(set, get\) => \(\{[^}]+)(,?\s*\}\),)', content, re.DOTALL)
            if initial_state_match:
                initial_content = initial_state_match.group(1)
                
                # Adicionar sandboxAuth no estado inicial
                new_initial_content = initial_content + ''',
      
      // Sandbox Security
      sandboxAuth: {
        isUnlocked: false,
        lastUnlockTime: undefined,
        failedAttempts: 0,
      },'''
                
                content = content.replace(initial_state_match.group(0), 
                    new_initial_content + initial_state_match.group(2))
        
        # Adicionar funções na interface se não existirem
        if 'unlockSandbox:' not in content:
            interface_pattern = r'(interface AuthState \{[^}]+)(  \/\/ Utilities|  generateId:|\})'
            if re.search(interface_pattern, content):
                sandbox_actions_interface = '''
  
  // Actions - Sandbox Security
  unlockSandbox: () => void;
  lockSandbox: () => void;
  
\\2'''
                content = re.sub(interface_pattern, '\\1' + sandbox_actions_interface, content)
        
        # Adicionar implementações das funções
        if 'unlockSandbox: () => {' not in content:
            impl_pattern = r'(      \/\/ Utilities\s+generateId:)'
            if re.search(impl_pattern, content):
                sandbox_implementations = '''
      // Actions - Sandbox Security
      unlockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: true,
            lastUnlockTime: new Date().toISOString(),
            failedAttempts: 0
          }
        }));
      },
      
      lockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: false,
            lastUnlockTime: undefined
          }
        }));
      },

      \\1'''
                content = re.sub(impl_pattern, sandbox_implementations, content)
        
        # Salvar arquivo corrigido
        auth_store_path.write_text(content, encoding='utf-8')
        print("   ✅ sandboxAuth adicionado ao authStore!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante correção: {e}")
        return False

if __name__ == "__main__":
    success = fix_auth_store_quick()
    
    if success:
        print("")
        print("🎉 CORREÇÃO AUTH STORE CONCLUÍDA!")
        print("✅ sandboxAuth configurado corretamente")
        print("")
        print("🚀 TESTE AGORA:")
        print("   npm run dev")
        print("")
        print("💡 Se ainda houver erro, me informe!")
    else:
        print("❌ Falha na correção")
        print("💡 Pode ser necessário correção manual")