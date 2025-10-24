import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { DashboardService, DashboardEstatisticasResponse, MaterialRecenteResponse } from './dashboard.service';

// Importa o novo modal de resumo criado para este dashboard
import { NovoResumoDashboardModalComponent } from './components/novo-resumo-modal/novo-resumo-modal';
import { AdicionarMaterialModalComponent } from './components/adicionar-material-modal/adicionar-material-modal';
import { CriarDisciplinaModalComponent } from './components/criar-disciplina-modal/criar-disciplina-modal';
import { InfoModalComponent } from './components/info-modal/info-modal';
/**
 * Componente principal do Dashboard.
 * Exibe um resumo das estatísticas do usuário, ações rápidas e materiais recentes.
 * Também gerencia a lógica para abrir o modal de "Novo Resumo".
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NovoResumoDashboardModalComponent,
    AdicionarMaterialModalComponent,
    CriarDisciplinaModalComponent,
    InfoModalComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  // --- Propriedades Públicas (usadas no Template) ---

  /** Nome do usuário logado. */
  public userName: string = 'Carregando...';

  /** Objeto com as estatísticas (disciplinas, resumos, materiais). */
  public stats: DashboardEstatisticasResponse = { totalDisciplinas: 0, resumosCriados: 0, totalMateriais: 0 };

  /** Lista de ações rápidas exibidas nos cards. */
  public quickActions = [
    { label: 'Nova Disciplina', icon: '📚', color: 'bg-blue-100', route: null },// 'null' indica que a ação abre um modal
    { label: 'Novo Resumo', icon: '📝', color: 'bg-green-100', route: null },
    { label: 'Adicionar Material', icon: '📎', color: 'bg-purple-100', route: null },
    { label: 'Ver Disciplinas', icon: '📂', color: 'bg-orange-100', route: '/disciplinas' }
  ];

  /** Lista de materiais adicionados recentemente. */
  public recentMateriais: MaterialRecenteResponse[] = [];


  // --- Flags de Controle dos Modais ---
  /** Controla a visibilidade (aberto/fechado) do modal de novo resumo. */
  public isNovoResumoModalOpen = false;
  /** Controla a visibilidade do modal de criar disciplina. */
  public isCriarDisciplinaModalOpen = false;
  /** Controla a visibilidade do modal de adicionar material. */
  public isAdicionarMaterialModalOpen = false;
  public isInfoModalOpen = false;
  public infoModalTitle = '';
  public infoModalMessage = '';

  // --- Construtor ---
  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  // --- Métodos de Ciclo de Vida ---

  /**
   * Hook do Angular chamado na inicialização do componente.
   * Dispara o carregamento de todos os dados iniciais do dashboard.
   */
  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
    this.carregarMateriaisRecentes();
  }

  // --- Métodos de Ação (Chamados pelo Template) ---

  /**
   * Decide o que fazer quando um card de "Ação Rápida" é clicado.
   * Se a ação tiver uma rota, navega.
   * Se for "Novo Resumo", abre o modal.
   * @param action O objeto da ação clicada (do array 'quickActions').
   */
  handleActionClick(action: { label: string, route: string | null }): void {

    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.label === 'Nova Disciplina') {
      this.isCriarDisciplinaModalOpen = true;
    }
    // ---Lógica do "Novo Resumo" atualizada ---
    else if (action.label === 'Novo Resumo') {
      // VERIFICA SE EXISTEM DISCIPLINAS
      if (this.stats.totalDisciplinas > 0) {
        // Se sim, abre o modal de novo resumo normalmente
        this.isNovoResumoModalOpen = true;
      } else {
        // Se não, configura e abre o MODAL DE AVISO
        this.infoModalTitle = 'Crie uma Disciplina Primeiro';
        this.infoModalMessage = 'Você precisa ter pelo menos uma disciplina criada para poder adicionar um resumo.';
        this.isInfoModalOpen = true;
      }
    } 
    else if (action.label === 'Adicionar Material') {
       // A lógica aqui pode precisar da mesma verificação se fizer sentido
       if (this.stats.totalDisciplinas > 0) {
           this.isAdicionarMaterialModalOpen = true; // Abre modal de upload
       } else {
           // Se não, configura e abre o MODAL DE AVISO (reaproveitando)
           this.infoModalTitle = 'Crie uma Disciplina Primeiro';
           this.infoModalMessage = 'Você precisa ter pelo menos uma disciplina criada para poder adicionar um material.';
           this.isInfoModalOpen = true;
       }
    }
  }

  // --- função para lidar com a ação do modal de aviso ---
  /**
   * Chamado quando o usuário clica no botão principal do modal de aviso.
   * Fecha o modal de aviso e abre o modal de criar disciplina.
   */
  handleInfoModalAction(): void {
    this.isInfoModalOpen = false; // Fecha o aviso
    this.isCriarDisciplinaModalOpen = true; // Abre o de criar disciplina
  }

  /**
   * Realiza o logout do usuário e o redireciona para a página de login.
   */
  fazerLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // --- Métodos Privados de Busca de Dados ---

  /**
   * Busca os dados do usuário logado (ex: nome) via AuthService.
   */
  private carregarDadosDoUsuario(): void {
    this.authService.buscarUsuarioLogado().subscribe({
      next: (dadosDoUsuario) => { this.userName = dadosDoUsuario.nome; },
      error: (err) => {
        console.error('Erro ao buscar dados do usuário:', err);
        this.fazerLogout(); // Desloga o usuário se houver erro (ex: token expirado)
      }
    });
  }

  /**
   * Busca as estatísticas (contagens) via DashboardService.
   */
  private carregarEstatisticas(): void {
    this.dashboardService.buscarEstatisticas().subscribe({
      next: (dadosDasEstatisticas) => { this.stats = dadosDasEstatisticas; },
      error: (err) => { console.error('Erro ao buscar estatísticas:', err); }
    });
  }

  /**
   * Busca a lista de materiais recentes via DashboardService.
   */
  private carregarMateriaisRecentes(): void {
    this.dashboardService.buscarMateriaisRecentes().subscribe({
      next: (listaDeMateriais) => { this.recentMateriais = listaDeMateriais; },
      error: (err) => { console.error('Erro ao buscar materiais recentes:', err); }
    });
  }

  // --- Métodos de Ajuda (Helpers) para o Template ---

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
}