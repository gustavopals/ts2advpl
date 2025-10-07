export const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Configurações do CORS
  cors: {
    // origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  },

  // Configurações da OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1')
  },

  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },

  // Limites da aplicação
  limits: {
    maxCodeLength: parseInt(process.env.MAX_CODE_LENGTH || '50000'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10')
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logRequests: process.env.LOG_REQUESTS === 'true'
  }
};

export default config;