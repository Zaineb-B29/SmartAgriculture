import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../service/crud.service';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer')
  private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;
  isOpen: boolean = false;
  clientId?: number;

  private shouldScroll = false;

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    try {
      const user = this.crudService.userDetails();
      if (user?.id) {
        this.clientId = user.id;
      }
    } catch {
      // user not logged in — chatbot still works for general questions
    }

    this.messages.push({
      sender: 'bot',
      text: '👋 Bonjour ! Je suis AgroSmart AI. Je peux vous aider concernant vos cultures, maladies des plantes, irrigation et recommandations agricoles.',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScroll = true;
    }
  }

  sendQuick(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const msg = this.userInput.trim();
    if (!msg || this.loading) return;

    this.messages.push({ sender: 'user', text: msg, timestamp: new Date() });
    this.loading = true;
    this.userInput = '';
    this.shouldScroll = true;

    this.messages.push({
      sender: 'bot',
      text: '',
      timestamp: new Date(),
      isLoading: true
    });

    this.crudService.sendMessage(msg, this.clientId).subscribe({
      next: (res) => {
        this.messages = this.messages.filter(m => !m.isLoading);
        this.messages.push({
          sender: 'bot',
          text: res.response,
          timestamp: new Date()
        });
        this.loading = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        this.messages = this.messages.filter(m => !m.isLoading);
        const errorMsg =
          err?.error?.response ||
          '❌ Erreur de connexion. Vérifiez que le serveur Flask est lancé sur le port 5000.';
        this.messages.push({
          sender: 'bot',
          text: errorMsg,
          timestamp: new Date()
        });
        this.loading = false;
        this.shouldScroll = true;
        console.error('Chatbot error:', err);
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearChat(): void {
    this.messages = [{
      sender: 'bot',
      text: '👋 Bonjour ! Je suis AgroSmart AI. Comment puis-je vous aider ?',
      timestamp: new Date()
    }];
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}