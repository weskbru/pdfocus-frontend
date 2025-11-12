import { Component } from '@angular/core';
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
export class FeedbackWidgetComponent {
  // Ícones
  faCommentDots = faCommentDots;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faStar = faStar;

  // Estado do componente
  public showFeedback = false;
  public feedbackText = '';
  public rating = 0;
  public feedbackType: 'bug' | 'suggestion' | 'feature' | 'other' = 'suggestion';
  public isSubmitting = false;
  public submitted = false;
  public emailUsuario = '';

  constructor(
    private library: FaIconLibrary,
    private feedbackService: FeedbackService 
  ) {
    this.library.addIcons(faCommentDots, faTimes, faPaperPlane, faStar);
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

    // Preparar dados para a API
    const feedbackData: FeedbackData = {
      tipo: this.feedbackType.toUpperCase() as 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER',
      rating: this.rating > 0 ? this.rating : null,
      mensagem: this.feedbackText.trim(),
      emailUsuario: this.emailUsuario.trim() || undefined,
      pagina: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      // Chamar a API
      await this.feedbackService.enviarFeedback(feedbackData).toPromise();
      
      this.isSubmitting = false;
      this.submitted = true;
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        this.showFeedback = false;
        this.resetForm();
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      this.isSubmitting = false;
      // Aqui você pode mostrar uma mensagem de erro para o usuário
    }
  }

  private resetForm(): void {
    this.feedbackText = '';
    this.rating = 0;
    this.feedbackType = 'suggestion';
    this.submitted = false;
    this.emailUsuario = '';
  }
}