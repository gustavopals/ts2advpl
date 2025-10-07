import { PrismaClient } from "@prisma/client";

// Extender o tipo Request do Express para incluir Prisma
declare global {
	namespace Express {
		interface Request {
			prisma: PrismaClient;
		}
	}
}

// Interfaces da aplicação
export interface ConversaoRequest {
	codigoTs: string;
	salvarHistorico?: boolean;
}

export interface ConversaoResponse {
	success: boolean;
	data: {
		resultado: string;
		metadata: {
			modelo: string;
			tokens?: number;
			tempo: number;
			caracteres: number;
		};
	};
	timestamp: string;
}

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	timestamp: string;
}

export interface HistoricoResponse {
	conversoes: Array<{
		id: number;
		codigoTs: string;
		resultado: string;
		modelo: string;
		tokens?: number;
		tempo?: number;
		createdAt: Date;
	}>;
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface StatsResponse {
	totalConversoes: number;
	totalTokens: number;
	tempoMedio: number;
	ultimasConversoes: Array<{
		id: number;
		createdAt: Date;
		tempo?: number;
		tokens?: number;
	}>;
}

export interface HealthResponse {
	status: string;
	database: {
		status: "connected" | "disconnected";
		responseTime: string;
	};
	openai: {
		status: "connected" | "disconnected";
		responseTime: string;
	};
	uptime: number;
	version: string;
}

// Tipos para erros
export interface ApiError extends Error {
	status?: number;
	code?: string;
}

// Tipos para OpenAI
export interface OpenAIConfig {
	model: string;
	temperature: number;
	maxTokens: number;
}

export interface ConversaoResult {
	resultado: string;
	tokens?: number;
	modelo: string;
	tempo: number;
}
