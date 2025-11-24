import { Component, inject } from '@angular/core'; // Importe inject aqui
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Imports do FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCheck, faTimes, faStar, faRocket,
  faCrown, faUser, faInfinity, faBolt, faHeadset,
  faHeart, faArrowRight, faShieldAlt, faCreditCard,
  faSync, faLock
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './assinatura.html',
  styleUrls: ['./assinatura.css']
})
export class AssinaturaComponent {

  // Injeção de dependência moderna (evita o erro do construtor)
  private router = inject(Router);

  // Ícones
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faTimes = faTimes;
  faStar = faStar;
  faRocket = faRocket;
  faCrown = faCrown;
  faUser = faUser;
  faInfinity = faInfinity;
  faBolt = faBolt;
  faHeadset = faHeadset;
  faHeart = faHeart;
  faArrowRight = faArrowRight;
  faShieldAlt = faShieldAlt;
  faCreditCard = faCreditCard;
  faSync = faSync;
  faLock = faLock;
  // Construtor fica vazio ou pode ser removido se não tiver outra lógica
  constructor() { }

  assinarPremium(): void {
    const phoneNumber = '5561995072092';

    const message = `Olá! Tenho interesse no Plano Premium do PDFocus (R$ 9,90/mês) para ter resumos ilimitados. Como faço para assinar?`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}