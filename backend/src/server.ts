import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import converterRoutes from "./routes/converter";
import config from "./config";
import {
	requestLogger,
	basicValidation,
	timeoutHandler,
	rateLimiter,
} from "./middleware";

// Configuração das variáveis de ambiente
dotenv.config();

// Inicialização do Prisma
const prisma = new PrismaClient();

// Criação da aplicação Express
const app = express();

// Middlewares globais
app.use(cors(config.cors));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middlewares customizados
if (config.logging.logRequests) {
	app.use(requestLogger);
}
app.use(basicValidation);
app.use(timeoutHandler(config.limits.requestTimeout));
app.use(rateLimiter(config.limits.maxRequestsPerMinute));

// Middleware para adicionar Prisma ao request
app.use((req, res, next) => {
	req.prisma = prisma;
	next();
});

// Health check
app.get("/", (req, res) => {
	res.json({
		message: "TS2AdvPL Converter API está rodando! 🚀",
		version: "1.0.0",
		status: "OK",
		timestamp: new Date().toISOString(),
	});
});

// Rotas da API
app.use("/api", converterRoutes);

// Middleware de tratamento de erros
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error("Erro na aplicação:", err);

		res.status(err.status || 500).json({
			error: err.message || "Erro interno do servidor",
			timestamp: new Date().toISOString(),
		});
	}
);

// Middleware para rotas não encontradas
app.use((req, res) => {
	res.status(404).json({
		error: "Rota não encontrada",
		path: req.originalUrl,
		timestamp: new Date().toISOString(),
	});
});

// Configuração da porta
const PORT = config.server.port;

// Função para iniciar o servidor
async function startServer() {
	try {
		// Testa a conexão com o banco
		await prisma.$connect();
		console.log("✅ Conexão com o banco de dados estabelecida");

		// Inicia o servidor
		app.listen(PORT, () => {
			console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
			console.log(`📚 Documentação da API: http://localhost:${PORT}/api`);

			// Teste automático da rota de health check após 2 segundos
			setTimeout(async () => {
				try {
					console.log("🔍 Testando rota de health check...");
					const fetch = (await import("node-fetch")).default;
					const response = await fetch(
						`http://localhost:${PORT}/api/health`
					);

					if (response.ok) {
						console.log(
							"✅ Health check passou - API funcionando corretamente"
						);
						console.log(
							`🔗 Acesse: http://localhost:${PORT}/api/health`
						);
					} else {
						console.log(
							"⚠️ Health check retornou status:",
							response.status
						);
					}
				} catch (healthError) {
					console.log(
						"⚠️ Não foi possível testar health check automaticamente"
					);
					console.log(
						`💡 Teste manual: curl http://localhost:${PORT}/api/health`
					);
				}
			}, 2000);
		});
	} catch (error) {
		console.error("❌ Erro ao iniciar o servidor:", error);
		process.exit(1);
	}
}

// Tratamento de encerramento gracioso
process.on("SIGINT", async () => {
	console.log("\n🔄 Encerrando servidor...");
	await prisma.$disconnect();
	console.log("✅ Servidor encerrado com sucesso");
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🔄 Encerrando servidor...");
	await prisma.$disconnect();
	console.log("✅ Servidor encerrado com sucesso");
	process.exit(0);
});

// Inicia o servidor
startServer();

// Extensão do tipo Request para incluir prisma
declare global {
	namespace Express {
		interface Request {
			prisma: PrismaClient;
		}
	}
}

export default app;
