import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import { CommonModule } from '@angular/common';

// Register languages you need
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);

// A interface não muda
interface Message {
  sender: 'user' | 'bot';
  text: string;
  code?: string;
  language?: 'typescript' | 'python' | 'html' | 'css';
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
    imports: [
      FormsModule,
      CommonModule
    ]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  
  // MUDANÇA: Adicionamos uma flag para controlar o highlight
  private needsHighlighting = false;

  ngOnInit(): void {
    this.messages.push({
      sender: 'bot',
      text: 'Olá! Sou o DevBot, seu assistente de programação. Como posso te ajudar a programar hoje?'
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

    this.messages.push({ sender: 'user', text: this.newMessage });
    this.newMessage = '';
    this.isLoading = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.botResponse();
    }, 1500);
  }

  private botResponse(): void {
    const response: Message = {
      sender: 'bot',
      text: `Claro! Aqui está um exemplo de como criar um "Hello World" com uma função em TypeScript:`,
      code: `function saudar(nome: string): void {
  console.log(\`Olá, \${nome}!\`);
}

saudar('Mundo');`,
      language: 'typescript'
    };
    
    this.messages.push(response);
    
    // MUDANÇA: Armamos a flag aqui, pois sabemos que uma nova mensagem com código foi adicionada
    if (response.code) {
      this.needsHighlighting = true;
    }
    
    this.isLoading = false;
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}