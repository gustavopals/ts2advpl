# TS2AdvPL Backend

Backend da aplicação de conversão de código TypeScript para AdvPL usando OpenAI.

## 🚀 Tecnologias

- **Node.js 22+**
- **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **OpenAI API** - Conversão inteligente de código

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrações do banco
├── src/
│   ├── routes/
│   │   └── converter.ts       # Rotas da API
│   ├── services/
│   │   └── openaiService.ts   # Serviço da OpenAI
│   └── server.ts              # Servidor principal
├── .env                       # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 🔧 Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env`:
```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sua_chave_da_openai"
PORT=3000
```

### 3. Configurar banco de dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Conversão
- `POST /api/converter` - Converte código TS para AdvPL
- `GET /api/health` - Status da API e conexões

### Histórico
- `GET /api/historico` - Lista conversões (paginado)
- `GET /api/conversao/:id` - Busca conversão por ID
- `DELETE /api/conversao/:id` - Remove conversão

### Estatísticas
- `GET /api/stats` - Estatísticas das conversões

## 🔄 Exemplo de Uso

### Converter código
```bash
curl -X POST http://localhost:3000/api/converter \
  -H "Content-Type: application/json" \
  -d '{
    "codigoTs": "function soma(a: number, b: number) { return a + b; }",
    "salvarHistorico": true
  }'
```

### Resposta
```json
{
  "success": true,
  "data": {
    "resultado": "User Function Soma(nA, nB)\n    Local nResultado := 0\n    nResultado := nA + nB\nReturn nResultado",
    "metadata": {
      "modelo": "gpt-4",
      "tokens": 150,
      "tempo": 1250,
      "caracteres": 45
    }
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## 📊 Banco de Dados

### Modelo Conversao
```prisma
model Conversao {
  id         Int      @id @default(autoincrement())
  codigoTs   String   // Código TypeScript enviado
  resultado  String   // Código AdvPL gerado
  prompt     String?  // Prompt usado (opcional)
  modelo     String   @default("gpt-4") // Modelo usado
  tokens     Int?     // Tokens consumidos
  tempo      Int?     // Tempo de processamento em ms
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Executar versão de produção
- `npm run prisma:generate` - Gerar cliente Prisma
- `npm run prisma:migrate` - Executar migrações
- `npm run prisma:studio` - Abrir Prisma Studio

## 🛡️ Tratamento de Erros

A API possui tratamento robusto de erros:

- **400** - Dados inválidos
- **404** - Recurso não encontrado
- **500** - Erro interno
- **503** - Serviço indisponível

Todos os erros retornam formato padronizado:
```json
{
  "error": "Mensagem do erro",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## 🔐 Segurança

- CORS configurado para frontend
- Validação de entrada
- Limitação de tamanho de código (50KB)
- Sanitização de erros

## 🔍 Monitoramento

- Health check em `/api/health`
- Logs estruturados no console
- Métricas de performance e tokens

## 📝 Próximas Melhorias

- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Cache de respostas
- [ ] Múltiplos modelos de IA
- [ ] Webhook para notificações
- [ ] Métricas avançadas

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request