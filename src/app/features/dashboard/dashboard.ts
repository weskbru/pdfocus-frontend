import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { DashboardService, DashboardEstatisticasResponse, MaterialRecenteResponse } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  userName: string = 'Carregando...';
  stats: DashboardEstatisticasResponse = { totalDisciplinas: 0, resumosCriados: 0, totalMateriais: 0 };
  quickActions = [
    { label: 'Nova Disciplina', icon: '📚', color: 'bg-blue-100', route: '/disciplinas/nova' },
    { label: 'Novo Resumo', icon: '📝', color: 'bg-green-100', route: '/resumos/novo' },
    { label: 'Adicionar Material', icon: '📎', color: 'bg-purple-100', route: '/materiais/novo' },
    { label: 'Ver Disciplinas', icon: '📂', color: 'bg-orange-100', route: '/disciplinas' }
  ];
  recentMateriais: MaterialRecenteResponse[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
    this.carregarMateriaisRecentes();
  }

  carregarDadosDoUsuario(): void {
    this.authService.buscarUsuarioLogado().subscribe({
      next: (dadosDoUsuario) => { this.userName = dadosDoUsuario.nome; },
      error: (err) => { console.error('Erro ao buscar dados do usuário:', err); this.fazerLogout(); }
    });
  }

  carregarEstatisticas(): void {
    this.dashboardService.buscarEstatisticas().subscribe({
      next: (dadosDasEstatisticas) => { this.stats = dadosDasEstatisticas; },
      error: (err) => { console.error('Erro ao buscar estatísticas:', err); }
    });
  }

  carregarMateriaisRecentes(): void {
    this.dashboardService.buscarMateriaisRecentes().subscribe({
      next: (listaDeMateriais) => { this.recentMateriais = listaDeMateriais; },
      error: (err) => { console.error('Erro ao buscar materiais recentes:', err); }
    });
  }

  /**
   * Função de ajuda para o template. Retorna uma classe de cor da Tailwind
   * com base na extensão do nome do arquivo.
   * @param nomeArquivo O nome completo do arquivo (ex: "relatorio.pdf").
   * @returns A classe CSS para a cor de fundo.
   */
  getMaterialColor(nomeArquivo: string): string {
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return 'bg-red-100';
      case 'pptx': return 'bg-orange-100';
      case 'docx': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  }

  /**
   * Função de ajuda para o template. Retorna um ícone (emoji) com base
   * na extensão do nome do arquivo.
   * @param nomeArquivo O nome completo do arquivo (ex: "relatorio.pdf").
   * @returns O caractere do ícone.
   */
  getMaterialIcon(nomeArquivo: string): string {
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return '📄';
      case 'pptx': return '📊';
      case 'docx': return '📜';
      default: return '📁';
    }
  }

  fazerLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

