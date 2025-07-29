#!/usr/bin/env python3
# Testando leitura do mcp_server.py

import os

def read_mcp_server():
    try:
        with open('mcp_server.py', 'r', encoding='utf-8') as f:
            content = f.read()
        print("✅ Arquivo lido com sucesso!")
        print(f"📏 Tamanho: {len(content)} caracteres")
        
        # Procurar pela função is_binary_file
        if 'is_binary_file' in content:
            print("🔍 Função is_binary_file encontrada!")
            
            # Extrair a função
            lines = content.split('\n')
            start_idx = None
            for i, line in enumerate(lines):
                if 'def is_binary_file' in line:
                    start_idx = i
                    break
            
            if start_idx:
                print(f"📍 Função encontrada na linha {start_idx + 1}")
                # Mostrar algumas linhas da função
                for i in range(start_idx, min(start_idx + 20, len(lines))):
                    print(f"{i+1:3d}: {lines[i]}")
        else:
            print("❌ Função is_binary_file não encontrada")
            
        # Vamos procurar também por onde a função é usada
        print("\n🔍 Procurando usos da função...")
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'is_binary_file' in line and 'def ' not in line:
                print(f"{i+1:3d}: {line.strip()}")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    read_mcp_server()
