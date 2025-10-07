import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import { CommonModule } from '@angular/common';
import { ApiService, ConversaoResponse } from './services/api.service';

// Register languages you need
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
// Registrar AdvPL como uma variação de Pascal/SQL
hljs.registerLanguage('advpl', () => ({
  case_insensitive: true,
  keywords: {
    keyword: 'User Function EndUser Local Static Private Public Return If Else ElseIf EndIf For To Next While EndWhile Do Case EndCase Exit Loop DbUseArea DbCloseArea DbSelectArea DbGoTop DbSkip DbSeek RecLock DbCommit DbRollback',
    built_in: 'Len Empty Val Str Transform PadL PadR SubStr At AllTrim LTrim RTrim Upper Lower cValToChar',
    literal: 'true false nil'
  },
  contains: [
    hljs.COMMENT('//', '$'),
    hljs.COMMENT('/\\*', '\\*/'),
    hljs.QUOTE_STRING_MODE,
    hljs.NUMBER_MODE
  ]
}));

interface Message {
  sender: 'user' | 'bot';
  text: string;
  code?: string;
  language?: 'typescript' | 'advpl' | 'python' | 'html' | 'css';
  isError?: boolean;
  metadata?: {
    modelo?: string;
    tokens?: number;
    tempo?: number;
    caracteres?: number;
  };
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  
  // Flag para controlar o highlight
  private needsHighlighting = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.messages.push({
      sender: 'bot',
      text: 'Olá! Sou o TS2AdvPL Converter! 🚀<br><br>Envie seu código TypeScript e eu convertirei para AdvPL (linguagem do ERP Protheus/TOTVS).<br><br>📝 <strong>Exemplo:</strong><br>Digite: <code>function soma(a: number, b: number) { return a + b; }</code>'
    });
  }

  ngAfterViewChecked(): void {
    // MUDANÇA: O código de highlight agora só roda se a flag for verdadeira
    if (this.needsHighlighting) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
      // Desarmamos a flag para não rodar de novo desnecessariamente
      this.needsHighlighting = false;
    }
    this.scrollToBottom();
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.newMessage.trim() === '') {
      return;
    }

    const userMessage = this.newMessage.trim();
    this.messages.push({ sender: 'user', text: userMessage });
    this.newMessage = '';
    this.isLoading = true;
    this.scrollToBottom();

    // Verificar se parece ser código TypeScript
    if (this.isTypeScriptCode(userMessage)) {
      this.convertCode(userMessage);
    } else {
      this.handleGeneralMessage(userMessage);
    }
  }

  private isTypeScriptCode(text: string): boolean {
    // Verifica se o texto parece ser código TypeScript
    const codeIndicators = [
      'function',
      'const',
      'let',
      'var',
      'class',
      '=>',
      'interface',
      'type',
      'import',
      'export'
    ];
    
    return codeIndicators.some(indicator => text.includes(indicator));
  }

  private convertCode(codigoTs: string): void {
    this.apiService.converter(codigoTs).subscribe({
      next: (response: ConversaoResponse) => {
        const botMessage: Message = {
          sender: 'bot',
          text: this.formatConversaoResponse(response.data.resultado),
          metadata: response.data.metadata
        };
        
        this.messages.push(botMessage);
        this.needsHighlighting = true;
        this.isLoading = false;
      },
      error: (error) => {
        const errorMessage: Message = {
          sender: 'bot',
          text: `❌ <strong>Erro na conversão:</strong><br>${error.error?.error || error.message || 'Erro desconhecido'}`,
          isError: true
        };
        
        this.messages.push(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private handleGeneralMessage(message: string): void {
    setTimeout(() => {
      const response: Message = {
        sender: 'bot',
        text: `Entendi! Para converter código TypeScript para AdvPL, por favor envie o código diretamente.<br><br>📝 <strong>Exemplos que posso converter:</strong><br>• Funções<br>• Classes<br>• Interfaces<br>• Loops e condicionais<br>• Operações matemáticas<br><br>💡 <strong>Dica:</strong> Cole seu código TypeScript e eu farei a conversão automaticamente!`
      };
      
      this.messages.push(response);
      this.isLoading = false;
    }, 1000);
  }

  private formatConversaoResponse(resultado: string): string {
    // Processa o resultado da conversão para extrair e formatar o código AdvPL
    const lines = resultado.split('\n');
    let formattedResponse = '';
    let inCodeBlock = false;
    let codeContent = '';
    
    for (const line of lines) {
      if (line.includes('```advpl') || line.includes('```')) {
        if (inCodeBlock) {
          // Fim do bloco de código
          formattedResponse += `<div class="code-block-container"><pre><code class="language-advpl">${codeContent.trim()}</code></pre></div>`;
          codeContent = '';
          inCodeBlock = false;
        } else {
          // Início do bloco de código
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeContent += line + '\n';
      } else {
        // Texto normal - formatar markdown básico
        let formattedLine = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/⚠️/g, '⚠️')
          .replace(/✅/g, '✅');
        
        if (formattedLine.trim()) {
          formattedResponse += formattedLine + '<br>';
        }
      }
    }
    
    // Se ainda há código pendente
    if (codeContent.trim()) {
      formattedResponse += `<div class="code-block-container"><pre><code class="language-advpl">${codeContent.trim()}</code></pre></div>`;
    }
    
    return formattedResponse;
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}