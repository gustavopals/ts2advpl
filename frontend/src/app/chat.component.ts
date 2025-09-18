
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  messages: ChatMessage[] = [
    { content: 'Olá! Como posso ajudar você hoje?', sender: 'ai', timestamp: new Date() }
  ];
  userInput = '';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  sendMessage() {
    const content = this.userInput.trim();
    if (!content) return;
    this.messages.push({ content, sender: 'user', timestamp: new Date() });
    this.userInput = '';
    setTimeout(() => this.scrollToBottom(), 100);
    // Simulação de resposta da IA
    setTimeout(() => {
      this.messages.push({
        content: 'Recebi sua mensagem: ' + content,
        sender: 'ai',
        timestamp: new Date()
      });
      this.scrollToBottom();
    }, 800);
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
