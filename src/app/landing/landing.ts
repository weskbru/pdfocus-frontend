import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html', 
  styleUrls: ['./landing.css'] 
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
}