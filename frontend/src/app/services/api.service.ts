import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para a API
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
      tokens: number;
      tempo: number;
      caracteres: number;
    };
  };
  timestamp: string;
}

export interface HistoricoResponse {
  success: boolean;
  data: {
    conversoes: Array<{
      id: number;
      codigoTs: string;
      resultado: string;
      modelo: string;
      tokens?: number;
      tempo?: number;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

export interface StatsResponse {
  success: boolean;
  data: {
    totalConversoes: number;
    totalTokens: number;
    tempoMedio: number;
    ultimasConversoes: Array<{
      id: number;
      createdAt: string;
      tempo?: number;
      tokens?: number;
    }>;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Converte código TypeScript para AdvPL
   */
  converter(codigoTs: string, salvarHistorico: boolean = true): Observable<ConversaoResponse> {
    const body: ConversaoRequest = {
      codigoTs,
      salvarHistorico
    };
    
    return this.http.post<ConversaoResponse>(`${this.baseUrl}/converter`, body, this.httpOptions);
  }

  /**
   * Busca histórico de conversões
   */
  buscarHistorico(page: number = 1, limit: number = 10): Observable<HistoricoResponse> {
    return this.http.get<HistoricoResponse>(`${this.baseUrl}/historico?page=${page}&limit=${limit}`);
  }

  /**
   * Busca estatísticas
   */
  buscarStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/stats`);
  }

  /**
   * Health check da API
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  /**
   * Remove uma conversão do histórico
   */
  removerConversao(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/conversao/${id}`);
  }
}