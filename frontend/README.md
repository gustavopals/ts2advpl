# TS2AdvPL Frontend

Interface web para conversão de código TypeScript para AdvPL usando Angular e integração com OpenAI.

## 🚀 Funcionalidades

- **Chat Interface Intuitiva**: Interface de conversação para enviar código TypeScript
- **Conversão Inteligente**: Integração com OpenAI para conversão TS → AdvPL
- **Syntax Highlighting**: Destaque de sintaxe para TypeScript e AdvPL
- **Metadados Detalhados**: Informações sobre tokens, tempo de processão e modelo usado
- **Design Responsivo**: Interface adaptada para desktop e mobile
- **Tratamento de Erros**: Feedback visual para erros de conversão

## 🎯 Como Usar

1. **Cole seu código TypeScript** na área de texto
2. **Pressione Enter** ou clique no botão enviar
3. **Aguarde a conversão** (indicador de carregamento)
4. **Receba o código AdvPL** formatado e comentado
5. **Veja os metadados** da conversão (tokens, tempo, etc.)

## 🔧 Configuração

### Desenvolvimento
```bash
npm install
ng serve --port 4201
```

### Build
```bash
ng build
```

## 🛠️ Tecnologias

- **Angular 19**: Framework principal
- **TypeScript**: Linguagem de desenvolvimento
- **Highlight.js**: Syntax highlighting
- **RxJS**: Programação reativa
- **SCSS**: Estilização avançada

## 📡 Integração com Backend

Base URL: `http://localhost:3000/api`

### Exemplo de Uso
```typescript
// Enviar código
{
  "codigoTs": "function soma(a: number, b: number) { return a + b; }"
}

// Receber conversão
{
  "success": true,
  "data": {
    "resultado": "User Function Soma(nA, nB)\n  Return nA + nB\nEndUser",
    "metadata": {
      "modelo": "gpt-4",
      "tokens": 542,
      "tempo": 6693
    }
  }
}
```

## 🎨 Interface

- 🤖 **Mensagens do Bot**: Código AdvPL convertido
- 👤 **Mensagens do Usuário**: Código TypeScript enviado
- 📊 **Metadados**: Informações da conversão
- ⚠️ **Tratamento de Erros**: Feedback visual
