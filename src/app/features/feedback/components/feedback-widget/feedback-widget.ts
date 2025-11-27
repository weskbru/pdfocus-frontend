import { Component, AfterViewInit, OnInit } from '@angular/core'; // <--- Adicionado OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCommentDots, faTimes, faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons';
import { FeedbackService, FeedbackData } from '../../services/feedback';

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

  // NOVA VARIÁVEL: Controla se o botão principal aparece
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

  // Lógica de Draggable (Arrastar) - Mantida intacta
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

    // Tenta pegar o token e extrair o email
    let emailCapturado = 'Anônimo';
    const token = localStorage.getItem('auth_token');

    if (token) {
      const emailDoToken = this.extrairEmailDoToken(token);
      if (emailDoToken) {
        emailCapturado = emailDoToken;
        console.log('✅ Email extraído do JWT:', emailCapturado);
      }
    } else {
      console.warn('⚠️ Token não encontrado. Enviando como Anônimo.');
    }

    const feedbackData: FeedbackData = {
      tipo: this.feedbackType.toUpperCase() as 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER',
      rating: this.rating > 0 ? this.rating : null,
      mensagem: this.feedbackText.trim(),
      emailUsuario: emailCapturado,
      pagina: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await this.feedbackService.enviarFeedback(feedbackData).toPromise();

      this.isSubmitting = false;
      this.submitted = true;

      setTimeout(() => {
        this.showFeedback = false;
        this.resetForm();
      }, 2000);

    } catch (error: any) {
      this.isSubmitting = false;
      console.error('Erro ao enviar feedback:', error);

      if (error.status === 403) {
        console.error('Token expirado ou inválido');
      }
      // --- TRATAMENTO DO LIMITE (429) ---
      else if (error.status === 429) {
        this.showFeedback = false;      // Fecha form
        this.mostrarModalLimite = true; // Abre aviso
        this.resetForm();

        // SALVA QUE BLOQUEOU HOJE
        this.salvarBloqueioNoStorage();
      }
    }
  }

  private extrairEmailDoToken(token: string): string | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      return payload.sub || payload.email || null;
    } catch (e) {
      console.error('Erro ao decodificar token JWT', e);
      return null;
    }
  }

  // --- FECHAR MODAL E SUMIR BOTÃO ---
  fecharModal(): void {
    this.mostrarModalLimite = false;
    this.isBlocked = true; // <--- Some o botão imediatamente
  }

  private resetForm(): void {
    this.feedbackText = '';
    this.rating = 0;
    this.feedbackType = 'suggestion';
    this.submitted = false;
    this.emailUsuario = '';
  }

  // --- NOVOS MÉTODOS DE CONTROLE DIÁRIO ---

  private salvarBloqueioNoStorage(): void {
    // Salva "2025-11-27"
    const hoje = new Date().toISOString().split('T')[0];
    localStorage.setItem('feedback_limit_date', hoje);
  }

  private verificarBloqueioDiario(): void {
    const dataBloqueio = localStorage.getItem('feedback_limit_date');
    const hoje = new Date().toISOString().split('T')[0];

    // Se existe data salva e é hoje, bloqueia
    if (dataBloqueio === hoje) {
      this.isBlocked = true;
      console.log('🚫 Limite diário já atingido. Widget oculto.');
    } else {
      // Se for data velha, limpa e libera
      if (dataBloqueio) {
        localStorage.removeItem('feedback_limit_date');
      }
      this.isBlocked = false;
    }
  }
}