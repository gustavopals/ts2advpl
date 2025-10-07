#!/bin/bash

echo "🧪 Testando API TS2AdvPL..."

# Testar health check
echo -e "\n1. Health Check:"
curl -s http://localhost:3000/ | jq '.' 2>/dev/null || curl -s http://localhost:3000/

# Testar API health
echo -e "\n\n2. API Health:"
curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health

# Testar conversão (exemplo simples)
echo -e "\n\n3. Teste de Conversão:"
curl -s -X POST http://localhost:3000/api/converter \
  -H "Content-Type: application/json" \
  -d '{"codigoTs": "function soma(a: number, b: number) { return a + b; }"}' \
  | jq '.' 2>/dev/null || echo "Erro na conversão ou OpenAI não configurada"

echo -e "\n\n✅ Testes concluídos!"