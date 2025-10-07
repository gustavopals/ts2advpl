import { Request, Response, NextFunction } from "express";

// Middleware para logging de requisições
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const start = Date.now();
	const { method, url, ip } = req;

	// Log da requisição iniciada
	console.log(
		`📨 ${method} ${url} - IP: ${ip} - ${new Date().toISOString()}`
	);

	// Interceptar o final da resposta para logar o resultado
	const originalSend = res.send;
	res.send = function (data) {
		const duration = Date.now() - start;
		const statusCode = res.statusCode;

		// Emoji baseado no status code
		const statusEmoji =
			statusCode >= 400 ? "❌" : statusCode >= 300 ? "⚠️" : "✅";

		console.log(
			`${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`
		);

		return originalSend.call(this, data);
	};

	next();
};

// Middleware para validação básica
export const basicValidation = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Verificar Content-Type para requisições POST/PUT
	if (["POST", "PUT", "PATCH"].includes(req.method)) {
		if (!req.headers["content-type"]?.includes("application/json")) {
			return res.status(400).json({
				error: "Content-Type deve ser application/json",
				timestamp: new Date().toISOString(),
			});
		}
	}

	next();
};

// Middleware para tratamento de timeout
export const timeoutHandler = (timeoutMs: number = 300000) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const timeout = setTimeout(() => {
			if (!res.headersSent) {
				res.status(408).json({
					error: "Request timeout - operação demorou muito para ser concluída",
					timestamp: new Date().toISOString(),
				});
			}
		}, timeoutMs);

		// Limpar timeout quando a resposta for enviada
		res.on("finish", () => {
			clearTimeout(timeout);
		});

		next();
	};
};

// Middleware para rate limiting simples
export const rateLimiter = (maxRequestsPerMinute: number = 10) => {
	const requests = new Map<string, number[]>();

	return (req: Request, res: Response, next: NextFunction) => {
		const ip = req.ip || req.connection.remoteAddress || "unknown";
		const now = Date.now();
		const minute = 60 * 1000;

		// Obter ou criar array de timestamps para este IP
		const timestamps = requests.get(ip) || [];

		// Filtrar timestamps dentro do último minuto
		const recentTimestamps = timestamps.filter(
			(timestamp) => now - timestamp < minute
		);

		// Verificar se excedeu o limite
		if (recentTimestamps.length >= maxRequestsPerMinute) {
			return res.status(429).json({
				error: `Muitas requisições. Máximo ${maxRequestsPerMinute} por minuto.`,
				timestamp: new Date().toISOString(),
			});
		}

		// Adicionar timestamp atual
		recentTimestamps.push(now);
		requests.set(ip, recentTimestamps);

		next();
	};
};

export default {
	requestLogger,
	basicValidation,
	timeoutHandler,
	rateLimiter,
};
