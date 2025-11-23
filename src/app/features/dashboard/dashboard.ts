import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { DashboardService, DashboardEstatisticasResponse, MaterialRecenteResponse } from './dashboard.service';

// --- Imports dos Modais ---
import { NovoResumoDashboardModalComponent } from './components/novo-resumo-modal/novo-resumo-modal';
import { AdicionarMaterialModalComponent } from './components/adicionar-material-modal/adicionar-material-modal';
import { CriarDisciplinaModalComponent } from './components/criar-disciplina-modal/criar-disciplina-modal';
import { InfoModalComponent } from './components/info-modal/info-modal';

// --- Importar Modal de Perfil ---
import { EditarPerfilModalComponent } from '../profile/components/editar-perfil-modal/editar-perfil-modal';

// --- Imports de Resumo ---
import { DisciplinaService, ResumoResponse } from '../disciplinas/disciplina.service';

// --- Imports de Ícones ---
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
// --- MUDANÇA: Adicionar Ícones do User Menu ---
import { faEye, faDownload, faUserEdit, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    NovoResumoDashboardModalComponent,
    AdicionarMaterialModalComponent,
    CriarDisciplinaModalComponent,
    InfoModalComponent,
    EditarPerfilModalComponent,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  providers: []
})
export class Dashboard implements OnInit {

  // --- Propriedades Públicas (usadas no Template)---
  public userName: string = 'Carregando...';
  public stats: DashboardEstatisticasResponse = { totalDisciplinas: 0, resumosCriados: 0, totalMateriais: 0 };
  public quickActions = [
    { label: 'Nova Disciplina', icon: '📚', color: 'bg-blue-100', route: null },
    { label: 'Novo Resumo', icon: '📝', color: 'bg-green-100', route: null },
    { label: 'Adicionar Material', icon: '📎', color: 'bg-purple-100', route: null },
    { label: 'Ver Disciplinas', icon: '📂', color: 'bg-orange-100', route: '/disciplinas' }
  ];

  /** Lista de materiais adicionados recentemente. */
  public recentMateriais: MaterialRecenteResponse[] = [];
  public recentResumos: ResumoResponse[] = [];
  public isLoadingResumos = false;

  // --- Flags de Controle dos Modais ---
  public isNovoResumoModalOpen = false;
  public isAdicionarMaterialModalOpen = false;
  public isCriarDisciplinaModalOpen = false;
  public isInfoModalOpen = false;
  public infoModalTitle = '';
  public infoModalMessage = '';
  public isPerfilModalOpen = false;
  public isUserMenuOpen = false;
  public notifications: { id: number; message: string; date: Date }[] = [];

  // --- Ícones ---
  faEye = faEye;
  faDownload = faDownload;
  faUserEdit = faUserEdit;
  faSignOutAlt = faSignOutAlt;
  faBell = faBell;

  // --- Construtor ---
  constructor(
    private authService: AuthService,
    private router: Router,
    private disciplinaService: DisciplinaService,
    private dashboardService: DashboardService,
    library: FaIconLibrary,
    private elementRef: ElementRef
  ) {
    library.addIcons(faEye, faDownload, faUserEdit, faSignOutAlt, faBell);
  }

  // --- Métodos de Ciclo de Vida ---
  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
    this.carregarResumosRecentes();


  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const userMenuArea = this.elementRef.nativeElement.querySelector('#user-menu-area');
    const isClickInsideUserMenu = userMenuArea?.contains(event.target as Node);

    // Fecha o menu do usuário
    if (this.isUserMenuOpen && !isClickInsideUserMenu) {
      this.isUserMenuOpen = false;
    }

    // Fecha o painel de notificações
    const notificationButton = this.elementRef.nativeElement.querySelector('[aria-label="Notificações"]');
    const notificationPanel = this.elementRef.nativeElement.querySelector('.notification-panel');

    const isInsideNotificationButton = notificationButton?.contains(event.target as Node);
    const isInsideNotificationPanel = notificationPanel?.contains(event.target as Node);

    if (this.isNotificationPanelOpen && !isInsideNotificationButton && !isInsideNotificationPanel) {
      this.isNotificationPanelOpen = false;
    }
  }


  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  abrirModalEditarPerfil(): void {
    console.log("Abrindo modal de editar perfil...");
    this.isPerfilModalOpen = true;
    this.isUserMenuOpen = false;
  }

  fecharModalEditarPerfil(): void {
    this.isPerfilModalOpen = false;
  }

  onPerfilAtualizado(novosDados: any): void {
    console.log('Perfil atualizado, recarregando dados do usuário...', novosDados);
    this.fecharModalEditarPerfil();
    this.carregarDadosDoUsuario();
  }

  // --- Métodos de Ação (Chamados pelo Template) ---
  handleActionClick(action: { label: string, route: string | null }): void {
    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.label === 'Nova Disciplina') {
      this.isCriarDisciplinaModalOpen = true;
    }
    else if (action.label === 'Novo Resumo') {
      if (this.stats.totalDisciplinas > 0) {
        this.isNovoResumoModalOpen = true;
      } else {
        this.infoModalTitle = 'Crie uma Disciplina Primeiro';
        this.infoModalMessage = 'Você precisa ter pelo menos uma disciplina criada para poder adicionar um resumo.';
        this.isInfoModalOpen = true;
      }
    }
    else if (action.label === 'Adicionar Material') {
      if (this.stats.totalDisciplinas > 0) {
        this.isAdicionarMaterialModalOpen = true;
      } else {
        this.infoModalTitle = 'Crie uma Disciplina Primeiro';
        this.infoModalMessage = 'Você precisa ter pelo menos uma disciplina criada para poder adicionar um material.';
        this.isInfoModalOpen = true;
      }
    }
  }

  handleInfoModalAction(): void {
    this.isInfoModalOpen = false;
    this.isCriarDisciplinaModalOpen = true;
  }

  fazerLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // --- Métodos Privados de Busca de Dados ---
  private carregarDadosDoUsuario(): void {
    this.authService.buscarUsuarioLogado().subscribe({
      next: (dadosDoUsuario) => { this.userName = dadosDoUsuario.nome; },
      error: (err) => {
        console.error('Erro ao buscar dados do usuário:', err);
        this.fazerLogout();
      }
    });
  }

  private carregarEstatisticas(): void {
    this.dashboardService.buscarEstatisticas().subscribe({
      next: (dadosDasEstatisticas) => { this.stats = dadosDasEstatisticas; },
      error: (err) => { console.error('Erro ao buscar estatísticas:', err); }
    });
  }

  private carregarResumosRecentes(): void {
    this.isLoadingResumos = true;
    this.disciplinaService.buscarTodosResumos().subscribe({
      next: (todosResumos) => {
        const resumosOrdenados = [...todosResumos].sort((a, b) => {
          return b.dataCriacao.localeCompare(a.dataCriacao);
        });
        this.recentResumos = resumosOrdenados.slice(0, 5);
        this.isLoadingResumos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar resumos recentes:', err);
        this.isLoadingResumos = false;
      }
    });
  }

  visualizarResumo(resumoId: string): void {
    this.router.navigate(['/resumos', resumoId]);
  }

  baixarResumo(resumo: ResumoResponse): void {
    console.log('Iniciando download para:', resumo.titulo);
    this.disciplinaService.buscarResumoPorId(resumo.id).subscribe({
      next: (detalhesResumo) => {
        if (detalhesResumo.conteudo) {
          const nomeArquivoLimpo = resumo.titulo.replace(/[^a-z0-9\s_-]/gi, '').replace(/\s+/g, '_');
          this.criarEBaixarArquivoTxt(`${nomeArquivoLimpo || 'resumo'}.txt`, detalhesResumo.conteudo);
        } else {
          console.error('Conteúdo do resumo está vazio.');
          alert('Não foi possível baixar o resumo: conteúdo vazio.');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes do resumo para download:', err);
        alert('Erro ao baixar o resumo. Tente novamente.');
      }
    });
  }

  private criarEBaixarArquivoTxt(nomeArquivo: string, conteudo: string): void {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  public hasUnreadNotifications = true;
  public notificationCount = 1;

  marcarNotificacoesComoLidas(): void {
    this.hasUnreadNotifications = false;
    this.notificationCount = 0;
  }


  public isNotificationPanelOpen = false;

  toggleNotificationPanel(): void {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;

    if (this.isNotificationPanelOpen) {

      // Se ainda não existem notificações, cria a "motivacional"
      if (this.notifications.length === 0) {
        this.notifications = [
          {
            id: 1,
            message: 'Bem-vindo. Sua área de estudos está atualizada e pronta para continuar seus progresso.',
            date: new Date()
          }

        ];
      }

      // Marca como lidas
      this.hasUnreadNotifications = false;
      this.notificationCount = this.notifications.length;
    }
  }

}










