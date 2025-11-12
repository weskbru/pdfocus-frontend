import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 
import { FeedbackWidgetComponent } from './features/feedback/components/feedback-widget/feedback-widget'; // ← ADICIONE ESTA LINHA

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FeedbackWidgetComponent], // ← ADICIONE FeedbackWidgetComponent
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'pdfocus-frontend';
}