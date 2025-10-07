import { Router, Request, Response } from 'express';
import { converterTsParaAdvpl, testarConexaoOpenAI } from '../services/openaiService';
import config from '../config';
import { ConversaoRequest as IConversaoRequest, ApiResponse } from '../types';

const router = Router();

/**
 * POST /api/converter
 * Converte código TypeScript para AdvPL
 */
router.post('/converter', async (req: Request, res: Response) => {
  try {
    const { codigoTs, salvarHistorico = true }: IConversaoRequest = req.body;

    // Validações
    if (!codigoTs) {
      return res.status(400).json({
        error: 'Código TypeScript é obrigatório',
        timestamp: new Date().toISOString()
      });
    }

    if (codigoTs.length > config.limits.maxCodeLength) {
      return res.status(400).json({
        error: `Código muito longo. Máximo de ${config.limits.maxCodeLength} caracteres.`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔄 Iniciando conversão... Tamanho: ${codigoTs.length} caracteres`);

    // Chama o serviço de conversão
    const resultado = await converterTsParaAdvpl(codigoTs);

    // Salva no histórico se solicitado
    if (salvarHistorico) {
      try {
        await req.prisma.conversao.create({
          data: {
            codigoTs,
            resultado: resultado.resultado,
            modelo: resultado.modelo,
            tokens: resultado.tokens,
            tempo: resultado.tempo
          }
        });
        console.log('✅ Conversão salva no histórico');
      } catch (dbError) {
        console.error('⚠️ Erro ao salvar no banco:', dbError);
        // Não falha a requisição se não conseguir salvar
      }
    }

    console.log(`✅ Conversão concluída em ${resultado.tempo}ms`);

    res.json({
      success: true,
      data: {
        resultado: resultado.resultado,
        metadata: {
          modelo: resultado.modelo,
          tokens: resultado.tokens,
          tempo: resultado.tempo,
          caracteres: codigoTs.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro na conversão:', error);
    
    res.status(500).json({
      error: error.message || 'Erro interno na conversão',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/historico
 * Lista o histórico de conversões
 */
router.get('/historico', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [conversoes, total] = await Promise.all([
      req.prisma.conversao.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          codigoTs: true,
          resultado: true,
          modelo: true,
          tokens: true,
          tempo: true,
          createdAt: true
        }
      }),
      req.prisma.conversao.count()
    ]);

    res.json({
      success: true,
      data: {
        conversoes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico:', error);
    
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/conversao/:id
 * Busca uma conversão específica por ID
 */
router.get('/conversao/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        timestamp: new Date().toISOString()
      });
    }

    const conversao = await req.prisma.conversao.findUnique({
      where: { id }
    });

    if (!conversao) {
      return res.status(404).json({
        error: 'Conversão não encontrada',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: conversao,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar conversão:', error);
    
    res.status(500).json({
      error: 'Erro ao buscar conversão',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/conversao/:id
 * Remove uma conversão do histórico
 */
router.delete('/conversao/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        timestamp: new Date().toISOString()
      });
    }

    await req.prisma.conversao.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Conversão removida com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao remover conversão:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Conversão não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: 'Erro ao remover conversão',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/stats
 * Estatísticas das conversões
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalConversoes,
      totalTokens,
      tempoMedio,
      ultimasConversoes
    ] = await Promise.all([
      req.prisma.conversao.count(),
      req.prisma.conversao.aggregate({
        _sum: { tokens: true }
      }),
      req.prisma.conversao.aggregate({
        _avg: { tempo: true }
      }),
      req.prisma.conversao.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          tempo: true,
          tokens: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalConversoes,
        totalTokens: totalTokens._sum.tokens || 0,
        tempoMedio: Math.round(tempoMedio._avg.tempo || 0),
        ultimasConversoes
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health
 * Verifica saúde da API e conexão com OpenAI
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Testa conexão com banco
    const dbStatus = await req.prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - startTime;
    
    // Testa conexão com OpenAI
    const openaiStartTime = Date.now();
    const openaiStatus = await testarConexaoOpenAI();
    const openaiTime = Date.now() - openaiStartTime;

    res.json({
      success: true,
      data: {
        status: 'OK',
        database: {
          status: dbStatus ? 'connected' : 'disconnected',
          responseTime: `${dbTime}ms`
        },
        openai: {
          status: openaiStatus ? 'connected' : 'disconnected',
          responseTime: `${openaiTime}ms`
        },
        uptime: process.uptime(),
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro no health check:', error);
    
    res.status(503).json({
      success: false,
      error: 'Serviço indisponível',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;