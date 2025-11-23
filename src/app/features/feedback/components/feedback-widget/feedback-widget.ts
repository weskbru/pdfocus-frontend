import { Component, AfterViewInit } from '@angular/core';
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
export class FeedbackWidgetComponent implements AfterViewInit {
  faCommentDots = faCommentDots;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faStar = faStar;

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

  ngAfterViewInit(): void {
    const widget = document.querySelector('.feedback-widget') as HTMLElement;
    if (!widget) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const margin = 40;            // distância mínima lateral
    const topLimit = 120;         // não deixar encostar na navbar
    const bottomLimit = 60;       // não deixar sumir no rodapé

    widget.addEventListener('mousedown', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.modal-content')) return;

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

    const feedbackData: FeedbackData = {
      tipo: this.feedbackType.toUpperCase() as 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER',
      rating: this.rating > 0 ? this.rating : null,
      mensagem: this.feedbackText.trim(),
      emailUsuario: this.emailUsuario.trim() || undefined,
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

    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      this.isSubmitting = false;
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
