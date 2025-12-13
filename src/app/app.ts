import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FeedbackWidgetComponent } from './features/feedback/components/feedback-widget/feedback-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FeedbackWidgetComponent],
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'pdfocus-frontend';

  constructor(public router: Router) {}

  // Lógica para decidir se mostra ou esconde o botão
  shouldShowFeedback(): boolean {
    
    const hiddenRoutes = ['/', '/login', '/cadastro', '/landing'];
    const currentUrl = this.router.url;

    // Se a URL atual estiver na lista proibida, retorna false (esconde)
    // O .split('?')[0] garante que ignoramos parametros de url (ex: /login?error=true)
    const cleanUrl = currentUrl.split('?')[0];
    return !hiddenRoutes.includes(cleanUrl);
  }
}