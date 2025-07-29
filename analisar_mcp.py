#!/usr/bin/env python3
import sys
import os

def analyze_mcp_server():
    """Analisa o mcp_server.py para encontrar restrições de arquivo"""
    try:
        # Ler o arquivo mcp_server.py
        with open('mcp_server.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("✅ Arquivo mcp_server.py lido com sucesso!")
        print(f"📏 Tamanho: {len(content):,} caracteres")
        print("=" * 60)
        
        # Dividir em linhas para análise
        lines = content.split('\n')
        
        # 1. Procurar pela função is_binary_file
        print("🔍 PROCURANDO: def is_binary_file")
        found_function = False
        for i, line in enumerate(lines):
            if 'def is_binary_file' in line:
                print(f"\n📍 ENCONTRADA na linha {i + 1}:")
                found_function = True
                
                # Mostrar a função completa
                indent_level = len(line) - len(line.lstrip())
                j = i
                while j < len(lines):
                    current_line = lines[j]
                    
                    # Se chegou a uma nova função ou classe no mesmo nível
                    if (j > i and current_line.strip() and 
                        (len(current_line) - len(current_line.lstrip())) <= indent_level and
                        (current_line.strip().startswith('def ') or 
                         current_line.strip().startswith('class ') or
                         current_line.strip().startswith('@'))):
                        break
                    
                    print(f"{j + 1:3d}: {current_line}")
                    j += 1
                break
        
        if not found_function:
            print("❌ Função is_binary_file NÃO ENCONTRADA")
        
        print("\n" + "=" * 60)
        
        # 2. Procurar por usos da função
        print("🔍 PROCURANDO: usos de is_binary_file")
        usage_count = 0
        for i, line in enumerate(lines):
            if 'is_binary_file' in line and 'def is_binary_file' not in line:
                print(f"{i + 1:3d}: {line.strip()}")
                usage_count += 1
        
        if usage_count == 0:
            print("❌ Nenhum uso encontrado")
        else:
            print(f"📊 Total de usos: {usage_count}")
            
        print("\n" + "=" * 60)
        
        # 3. Procurar por outras restrições de arquivo
        print("🔍 PROCURANDO: outras restrições de arquivo")
        restriction_keywords = ['binary', 'extension', 'allowed', 'blocked', 'filter', 'skip']
        
        for keyword in restriction_keywords:
            print(f"\n--- Procurando '{keyword}' ---")
            found_any = False
            for i, line in enumerate(lines):
                if keyword.lower() in line.lower() and not line.strip().startswith('#'):
                    print(f"{i + 1:3d}: {line.strip()}")
                    found_any = True
            if not found_any:
                print(f"❌ Nenhuma ocorrência de '{keyword}' encontrada")
                
    except FileNotFoundError:
        print("❌ Arquivo mcp_server.py não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    analyze_mcp_server()
