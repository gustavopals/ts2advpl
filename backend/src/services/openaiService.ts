import OpenAI from 'openai';
import config from '../config';

// Inicialização do cliente OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Interface para o resultado da conversão
export interface ConversaoResult {
  resultado: string;
  tokens?: number;
  modelo: string;
  tempo: number;
}

// Prompt especializado para conversão TS → AdvPL
const SYSTEM_PROMPT = `Você é um assistente especialista em conversão de código TypeScript para AdvPL (linguagem do ERP Protheus/TOTVS).

REGRAS FUNDAMENTAIS:
1. Sempre explique brevemente o que o código TypeScript faz
2. Converta para AdvPL seguindo as melhores práticas do Protheus
3. Use sintaxe típica: User Function, Local, Static, estruturas de loop
4. Comente o código AdvPL gerado para facilitar compreensão
5. Se algo não puder ser convertido diretamente, marque com ⚠️ e sugira alternativa
6. Use nomes em português quando apropriado (padrão Protheus)
7. Não use recursos externos ao ambiente Protheus
8. Converta async/await para estruturas síncronas
9. Adapte arrays/objetos JS para vetores/estruturas AdvPL
10. Utilize funções padrão da TDN (DbUseArea, DbSeek, etc.)

ESTRUTURA DA RESPOSTA:
1. **Análise**: O que o código faz
2. **Adaptações**: Limitações e ajustes necessários  
3. **Código AdvPL**: Código convertido e comentado
4. **Observações**: Dicas de uso no Protheus`;

const USER_PROMPT_TEMPLATE = `
Converta o seguinte código TypeScript para AdvPL:

\`\`\`typescript
{codigo}
\`\`\`

Siga todas as regras estabelecidas e forneça uma conversão completa e funcional.`;

/**
 * Converte código TypeScript para AdvPL usando OpenAI
 */
export async function converterTsParaAdvpl(codigoTs: string): Promise<ConversaoResult> {
  const startTime = Date.now();
  
  try {
    if (!config.openai.apiKey) {
      throw new Error('OPENAI_API_KEY não configurada no arquivo .env');
    }

    if (!codigoTs || codigoTs.trim().length === 0) {
      throw new Error('Código TypeScript não pode estar vazio');
    }

    // Preparar o prompt
    const userPrompt = USER_PROMPT_TEMPLATE.replace('{codigo}', codigoTs);

    // Chamar a API da OpenAI
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.openai.temperature,
      max_tokens: config.openai.maxTokens,
    });

    const resultado = response.choices[0]?.message?.content;
    
    if (!resultado) {
      throw new Error('Resposta vazia da OpenAI');
    }

    const endTime = Date.now();
    const tempo = endTime - startTime;

    return {
      resultado,
      tokens: response.usage?.total_tokens,
      modelo: config.openai.model,
      tempo
    };

  } catch (error: any) {
    const endTime = Date.now();
    const tempo = endTime - startTime;

    console.error('Erro no serviço OpenAI:', error);
    
    // Tratar erros específicos da OpenAI
    if (error.code === 'insufficient_quota') {
      throw new Error('Cota da API OpenAI esgotada. Verifique seu plano.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Chave da API OpenAI inválida. Verifique as configurações.');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
    }

    throw new Error(`Erro na conversão: ${error.message}`);
  }
}

/**
 * Testa a conexão com a API da OpenAI
 */
export async function testarConexaoOpenAI(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Teste de conexão' }],
      max_tokens: 10
    });
    
    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error('Erro ao testar conexão OpenAI:', error);
    return false;
  }
}

export default {
  converterTsParaAdvpl,
  testarConexaoOpenAI
};