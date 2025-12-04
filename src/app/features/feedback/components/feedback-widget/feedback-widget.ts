import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCommentDots, faTimes, faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons';
import { FeedbackService, FeedbackData } from '../../services/feedback';
import { HttpErrorResponse } from '@angular/common/http'; // Importante para tipagem de erro
import { lastValueFrom } from 'rxjs'; // Substituto moderno do toPromise

@Component({
  selector: 'app-feedback-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './feedback-widget.html',
  styleUrls: ['./feedback-widget.css']
})
export class FeedbackWidgetComponent implements AfterViewInit, OnInit {
  faCommentDots = faCommentDots;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faStar = faStar;

  // Variáveis de estado
  public mostrarModalLimite = false;
  public showFeedback = false;
  public feedbackText = '';
  public rating = 0;
  public feedbackType: 'bug' | 'suggestion' | 'feature' | 'other' = 'suggestion';
  public isSubmitting = false;
  public submitted = false;
  public emailUsuario = '';

  // Controla se o botão principal aparece
  public isBlocked = false;

  constructor(
    private library: FaIconLibrary,
    private feedbackService: FeedbackService
  ) {
    this.library.addIcons(faCommentDots, faTimes, faPaperPlane, faStar);
  }

  // --- 1. AO INICIAR: Verifica se já foi bloqueado hoje ---
  ngOnInit(): void {
    this.verificarBloqueioDiario();
  }

  // --- 2. Lógica de Draggable (Mantida) ---
  ngAfterViewInit(): void {
    const widget = document.querySelector('.feedback-widget') as HTMLElement;
    if (!widget) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const margin = 40;
    const topLimit = 120;
    const bottomLimit = 60;

    widget.addEventListener('mousedown', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.modal-content') ||
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('textarea')) return;

      isDragging = true;
      widget.style.transition = 'none';
      const rect = widget.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      widget.style.left = `${rect.left}px`;
      widget.style.top = `${rect.top}px`;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;
      const rawX = e.clientX - offsetX;
      const rawY = e.clientY - offsetY;
      const maxX = window.innerWidth - widget.offsetWidth - margin;
      const maxY = window.innerHeight - widget.offsetHeight - bottomLimit;
      let newX = Math.max(margin, Math.min(rawX, maxX));
      let newY = Math.max(topLimit, Math.min(rawY, maxY));
      widget.style.left = `${newX}px`;
      widget.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const rect = widget.getBoundingClientRect();
      const center = window.innerWidth / 2;
      widget.style.transition = 'left 0.2s ease';
      if (rect.left + rect.width / 2 < center) {
        widget.style.left = `${margin}px`;
      } else {
        widget.style.left = `auto`;
        widget.style.right = `${margin}px`;
      }
      setTimeout(() => {
        widget.style.transition = '';
      }, 250);
    });
  }

  toggleFeedback(): void {
    this.showFeedback = !this.showFeedback;
    if (!this.showFeedback) {
      this.resetForm();
    }
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  setFeedbackType(type: 'bug' | 'suggestion' | 'feature' | 'other'): void {
    this.feedbackType = type;
  }

  async sendFeedback(): Promise<void> {
    if (!this.feedbackText.trim()) return;

    this.isSubmitting = true;

    // --- CORREÇÃO AQUI ---
    // Inicializa como null. Se não tiver token, vai nulo mesmo.
    let emailCapturado: string | null = null; 
    
    const token = localStorage.getItem('auth_token'); // Confirme se a chave é esta mesma

    if (token) {
      const emailDoToken = this.extrairEmailDoToken(token);
      if (emailDoToken) {
        emailCapturado = emailDoToken;
        console.log('✅ Email extraído do JWT:', emailCapturado);
      }
    }

    const feedbackData: FeedbackData = {
      tipo: this.feedbackType.toUpperCase() as 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER',
      rating: this.rating > 0 ? this.rating : null,
      mensagem: this.feedbackText.trim(),
      emailUsuario: emailCapturado, // Agora envia o email válido ou null
      pagina: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await lastValueFrom(this.feedbackService.enviarFeedback(feedbackData));

      this.isSubmitting = false;
      this.submitted = true;

      setTimeout(() => {
        this.showFeedback = false;
        this.resetForm();
      }, 2000);

    } catch (error) {
      this.isSubmitting = false;
      const httpError = error as HttpErrorResponse;
      
      console.error('Erro ao enviar feedback:', httpError);

      if (httpError.status === 403) {
        console.error('Token expirado ou inválido (Frontend enviou token?)');
      }
      else if (httpError.status === 429) {
        this.showFeedback = false;
        this.mostrarModalLimite = true;
        this.resetForm();
        this.salvarBloqueioNoStorage();
      }
      // Log extra para ver qual campo deu erro 400
      else if (httpError.status === 400) {
         console.warn('Erro de Validação (400):', httpError.error);
      }
    }
  }
  
  private extrairEmailDoToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null; // Validação básica de estrutura JWT

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      // Alguns JWTs usam 'sub' para o email/username, outros usam 'email'
      return payload.sub || payload.email || null;
    } catch (e) {
      console.error('Erro ao decodificar token JWT', e);
      return null;
    }
  }

  // --- FECHAR MODAL E SUMIR BOTÃO ---
  fecharModal(): void {
    this.mostrarModalLimite = false;
    this.isBlocked = true; // Esconde o widget da tela
  }

  private resetForm(): void {
    this.feedbackText = '';
    this.rating = 0;
    this.feedbackType = 'suggestion';
    this.submitted = false;
    this.emailUsuario = '';
  }

  // --- MÉTODOS DE CONTROLE DIÁRIO ---
  private salvarBloqueioNoStorage(): void {
    const hoje = new Date().toISOString().split('T')[0];
    localStorage.setItem('feedback_limit_date', hoje);
  }

  private verificarBloqueioDiario(): void {
    const dataBloqueio = localStorage.getItem('feedback_limit_date');
    const hoje = new Date().toISOString().split('T')[0];

    // Se a data salva é hoje, mantém bloqueado
    if (dataBloqueio === hoje) {
      this.isBlocked = true;
    } else {
      // Se for data antiga ou inexistente, limpa e libera
      if (dataBloqueio) {
        localStorage.removeItem('feedback_limit_date');
      }
      this.isBlocked = false;
    }
  }
}