#!/bin/bash

echo "======================================"
echo " DEPLOY DOCKER - GERENCIADOR DE TAREFAS"
echo "======================================"
echo

echo "[1/4] Verificando Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não encontrado!"
    exit 1
fi

echo
echo "[2/4] Testando conexão com Docker..."
if ! docker ps &> /dev/null; then
    echo "ERRO: Docker Desktop não está rodando!"
    echo "Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi

echo
echo "[3/4] Construindo imagens Docker..."
docker-compose -f docker-compose.local.yml --env-file .env.docker build

echo
echo "[4/4] Subindo containers..."
docker-compose -f docker-compose.local.yml --env-file .env.docker up -d

echo
echo "======================================"
echo " DEPLOY CONCLUÍDO!"
echo "======================================"
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo
echo "Para ver logs: docker-compose -f docker-compose.local.yml logs -f"
echo "Para parar:   docker-compose -f docker-compose.local.yml down"
echo