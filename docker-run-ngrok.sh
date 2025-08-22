#!/bin/bash

echo "======================================"
echo " DEPLOY NGROK - GERENCIADOR DE TAREFAS"
echo "======================================"
echo

echo "[1/5] Verificando Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não encontrado!"
    exit 1
fi

echo
echo "[2/5] Testando conexão com Docker..."
if ! docker ps &> /dev/null; then
    echo "ERRO: Docker Desktop não está rodando!"
    echo "Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi

echo
echo "[3/5] Parando containers locais (se existirem)..."
docker-compose -f docker-compose.local.yml down &> /dev/null

echo
echo "[4/5] Construindo imagens Docker para ngrok..."
docker-compose -f docker-compose.ngrok.yml --env-file .env.ngrok build

echo
echo "[5/5] Subindo containers para ngrok..."
docker-compose -f docker-compose.ngrok.yml --env-file .env.ngrok up -d

echo
echo "======================================"
echo " DEPLOY NGROK CONCLUÍDO!"
echo "======================================"
echo
echo "Local:    http://localhost"
echo "Ngrok:    https://antelope-leading-deeply.ngrok-free.app"
echo
echo "IMPORTANTE: Execute o comando do ngrok em outro terminal:"
echo "ngrok http --url=antelope-leading-deeply.ngrok-free.app 80"
echo
echo "Para ver logs: docker-compose -f docker-compose.ngrok.yml logs -f"
echo "Para parar:   docker-compose -f docker-compose.ngrok.yml down"
echo