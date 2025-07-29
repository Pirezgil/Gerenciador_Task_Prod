#!/usr/bin/env python3

# Script simples para encontrar a função is_binary_file
def find_binary_function():
    try:
        with open('mcp_server.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Encontrar a função is_binary_file
        lines = content.split('\n')
        
        print("🔍 Analisando mcp_server.py...")
        print(f"📄 Total de linhas: {len(lines)}")
        
        # Buscar a função
        for i, line in enumerate(lines):
            if 'def is_binary_file' in line:
                print(f"\n✅ FUNÇÃO ENCONTRADA na linha {i + 1}!")
                print("📋 Conteúdo da função:")
                print("-" * 50)
                
                # Mostrar a função e algumas linhas seguintes
                for j in range(i, min(i + 15, len(lines))):
                    line_content = lines[j]
                    print(f"{j + 1:3d}: {line_content}")
                    
                    # Parar se encontrar próxima função
                    if j > i and line_content.strip().startswith('def ') and 'is_binary_file' not in line_content:
                        break
                
                print("-" * 50)
                return
        
        print("❌ Função is_binary_file não encontrada!")
        
        # Se não encontrou, vamos procurar por variações
        print("\n🔍 Procurando variações...")
        for i, line in enumerate(lines):
            if 'binary' in line.lower() and ('def' in line or 'extension' in line):
                print(f"{i + 1:3d}: {line}")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    find_binary_function()
