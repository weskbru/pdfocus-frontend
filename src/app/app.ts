// app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // ← Adicione RouterOutlet aqui
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'pdfocus-frontend';
}