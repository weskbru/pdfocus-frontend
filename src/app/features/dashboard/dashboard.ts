// features/dashboard/dashboard.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importe RouterModule
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Adicione RouterModule aos imports para [routerLink] funcionar
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  userName: string = 'Usuário';

  stats = {
    totalMateriais: 0,
    resumosCriados: 0,
    totalDisciplinas: 0,
    storageUsed: '0 MB'
  };

  quickActions = [
    { label: 'Nova Disciplina', icon: '📚', color: 'bg-blue-100', route: '/disciplinas/nova' },
    { label: 'Novo Resumo', icon: '📝', color: 'bg-green-100', route: '/resumos/novo' },
    { label: 'Adicionar Material', icon: '📎', color: 'bg-purple-100', route: '/materiais/novo' },
    { label: 'Ver Disciplinas', icon: '📂', color: 'bg-orange-100', route: '/disciplinas' }
  ];

  recentMateriais = [
    { name: 'Cálculo I - Derivadas.pdf', disciplina: 'Cálculo I', date: '01 de Set, 2025', size: '2.3 MB', type: 'PDF' },
    { name: 'Apresentação Biologia.pptx', disciplina: 'Biologia Celular', date: '28 de Ago, 2025', size: '5.8 MB', type: 'PPTX' },
    { name: 'Notas de Aula - Direito.docx', disciplina: 'Direito Constitucional', date: '30 de Ago, 2025', size: '1.1 MB', type: 'DOCX' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Esta função roda assim que o componente carrega
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
  }

  carregarDadosDoUsuario(): void {
    const token = this.authService.obterToken();
    if (token) {
      try {
        // Decodificamos o payload do token JWT (a parte do meio)
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Nosso back-end coloca o e-mail no campo 'sub' (subject)
        const email = payload.sub;
        // Criamos um nome de usuário a partir do e-mail (ex: 'wesley' de 'wesley@email.com')
        this.userName = email.split('@')[0];
        // Capitalizamos a primeira letra
        this.userName = this.userName.charAt(0).toUpperCase() + this.userName.slice(1);

      } catch (e) {
        console.error('Erro ao decodificar o token:', e);
        this.userName = 'Usuário'; // Usa um valor padrão em caso de erro
      }
    }
  }

  carregarEstatisticas(): void {
    // No futuro, chamaremos a API aqui. Por enquanto, usamos dados de exemplo.
    this.stats = {
      totalMateriais: 12,
      resumosCriados: 28,
      totalDisciplinas: 5,
      storageUsed: '78 MB / 1 GB'
    };
  }

  // Funções de ajuda para o HTML
  getMaterialColor(type: string): string {
    switch (type) {
      case 'PDF': return 'bg-red-100';
      case 'PPTX': return 'bg-orange-100';
      case 'DOCX': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  }

  getMaterialIcon(type: string): string {
    switch (type) {
      case 'PDF': return '📄';
      case 'PPTX': return '📊';
      case 'DOCX': return '📜';
      default: return '📁';
    }
  }

  fazerLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}