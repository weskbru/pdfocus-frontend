import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { DashboardService, DashboardEstatisticasResponse, MaterialRecenteResponse } from './dashboard.service';

// --- Imports dos Modais ---
import { NovoResumoDashboardModalComponent } from './components/novo-resumo-modal/novo-resumo-modal';
import { AdicionarMaterialModalComponent } from './components/adicionar-material-modal/adicionar-material-modal';
import { CriarDisciplinaModalComponent } from './components/criar-disciplina-modal/criar-disciplina-modal';

// --- Importar Modal de Perfil ---
import { EditarPerfilModalComponent } from '../profile/components/editar-perfil-modal/editar-perfil-modal';

// --- Imports de Resumo ---
import { CriarResumoDeMaterialCommand, DisciplinaService, ResumoResponse } from '../disciplinas/disciplina.service';

// --- Imports de Ícones ---
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faPlus, faEye, faTimes, faDownload, faUserEdit, faSignOutAlt, faBell, faCrown, faRocket, faCheck } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';

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
    EditarPerfilModalComponent,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  providers: []
})
export class Dashboard implements OnInit {

  // --- Propriedades Públicas ---
  public userName: string = 'Carregando...';
  public stats: DashboardEstatisticasResponse = { totalDisciplinas: 0, resumosCriados: 0, totalMateriais: 0 };
  public quickActions = [
    { label: 'Nova Disciplina', icon: '📚', color: 'bg-blue-100', route: null },
    { label: 'Novo Resumo', icon: '📝', color: 'bg-green-100', route: null },
    { label: 'Adicionar Material', icon: '📎', color: 'bg-purple-100', route: null },
    { label: 'Ver Disciplinas', icon: '📂', color: 'bg-orange-100', route: '/disciplinas' }
  ];

  public recentMateriais: MaterialRecenteResponse[] = [];
  public recentResumos: ResumoResponse[] = [];
  public isLoadingResumos = false;

  // --- Flags de Modais ---
  public isNovoResumoModalOpen = false;
  public isAdicionarMaterialModalOpen = false;
  public isCriarDisciplinaModalOpen = false;

  // Modal Genérico (Info/Error/CreateFirst)
  public isInfoModalOpen = false;
  public infoModalTitle = '';
  public infoModalMessage = '';
  public infoModalActionType: 'CREATE_DISCIPLINA' | 'UPGRADE' | null = null;

  // Modal de Upgrade
  public isUpgradeModalOpen = false;

  // Perfil e Menu
  public isPerfilModalOpen = false;
  public isUserMenuOpen = false;

  // Notificações e Sucesso
  public notifications: { id: number; message: string; date: Date }[] = [];
  public isSuccessModalOpen = false;
  public successMessage = '';
  public isNotificationPanelOpen = false;
  public hasUnreadNotifications = true;
  public notificationCount = 1;

  // --- Ícones ---
  faEye = faEye;
  faDownload = faDownload;
  faUserEdit = faUserEdit;
  faSignOutAlt = faSignOutAlt;
  faBell = faBell;
  faCrown = faCrown;
  faRocket = faRocket;
  faCheck = faCheck;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faPlus = faPlus;


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

  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
    this.carregarResumosRecentes();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const userMenuArea = this.elementRef.nativeElement.querySelector('#user-menu-area');
    const isClickInsideUserMenu = userMenuArea?.contains(event.target as Node);

    if (this.isUserMenuOpen && !isClickInsideUserMenu) {
      this.isUserMenuOpen = false;
    }

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
    this.isPerfilModalOpen = true;
    this.isUserMenuOpen = false;
  }

  fecharModalEditarPerfil(): void {
    this.isPerfilModalOpen = false;
  }

  onPerfilAtualizado(novosDados: any): void {
    this.fecharModalEditarPerfil();
    this.carregarDadosDoUsuario();
  }

  // --- AÇÕES DO DASHBOARD ---
  handleActionClick(action: { label: string, route: string | null }): void {
    if (action.route) {
      this.router.navigate([action.route]);
    }
    else if (action.label === 'Nova Disciplina') {
      this.isCriarDisciplinaModalOpen = true;
    }
    else if (action.label === 'Novo Resumo') {
      if (this.stats.totalDisciplinas > 0) {
        this.isNovoResumoModalOpen = true;
      } else {
        this.configurarInfoModalParaCriarDisciplina();
      }
    }
    else if (action.label === 'Adicionar Material') {
      if (this.stats.totalDisciplinas > 0) {
        this.isAdicionarMaterialModalOpen = true;
      } else {
        this.configurarInfoModalParaCriarDisciplina();
      }
    }
  }

  private configurarInfoModalParaCriarDisciplina(): void {
    this.infoModalTitle = 'Primeiros Passos';
    this.infoModalMessage = 'Para começar, você precisa criar sua primeira disciplina. Vamos lá?';
    this.infoModalActionType = 'CREATE_DISCIPLINA';
    this.isInfoModalOpen = true;
  }

  fazerLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarDadosDoUsuario(): void {
    this.authService.buscarUsuarioLogado().subscribe({
      next: (dadosDoUsuario) => { this.userName = dadosDoUsuario.nome; },
      error: (err) => { this.fazerLogout(); }
    });
  }

  public carregarEstatisticas(): void {
    this.dashboardService.buscarEstatisticas().subscribe({
      next: (dadosDasEstatisticas) => { this.stats = dadosDasEstatisticas; },
      error: (err) => {
        if (err.status === 401 || err.status === 403) this.fazerLogout();
      }
    });
  }

  public carregarResumosRecentes(): void {
    this.isLoadingResumos = true;
    this.disciplinaService.buscarTodosResumos().subscribe({
      next: (todosResumos) => {
        const resumosOrdenados = [...todosResumos].sort((a, b) => {
          const dateA = new Date(a.dataCriacao).getTime();
          const dateB = new Date(b.dataCriacao).getTime();
          return dateB - dateA;
        });
        this.recentResumos = resumosOrdenados.slice(0, 5);
        this.isLoadingResumos = false;
      },
      error: (err) => { this.isLoadingResumos = false; }
    });
  }

  public handleResumoSubmission(comando: CriarResumoDeMaterialCommand): void {
    this.isNovoResumoModalOpen = false;
    this.isLoadingResumos = true;
    this.infoModalMessage = '';

    this.disciplinaService.gerarResumoAutomatico(comando).subscribe({
      next: (resumoReal) => {
        this.isLoadingResumos = false;
        this.carregarEstatisticas();
        this.carregarResumosRecentes();
        this.mostrarMensagemSucesso('Resumo criado com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingResumos = false;
        if (err.status === 429) {
          this.isUpgradeModalOpen = true; // Abre direto o modal de Upgrade
        }
        else if (err.status === 401 || err.status === 403) {
          this.fazerLogout();
        }
        else {
          this.infoModalTitle = 'Erro ao Criar Resumo';
          this.infoModalMessage = 'Ocorreu um erro inesperado.';
          this.infoModalActionType = null;
          this.isInfoModalOpen = true;
        }
      }
    });
  }

  handleInfoModalAction(): void {
    this.isInfoModalOpen = false;
    if (this.infoModalActionType === 'CREATE_DISCIPLINA') {
      this.isCriarDisciplinaModalOpen = true;
    }
    else if (this.infoModalActionType === 'UPGRADE') {
      this.router.navigate(['/assinatura']);
    }
    this.infoModalActionType = null;
  }

  private mostrarMensagemSucesso(mensagem: string): void {
    this.successMessage = mensagem;
    this.isSuccessModalOpen = true;
    setTimeout(() => { if (this.isSuccessModalOpen) this.isSuccessModalOpen = false; }, 3000);
  }

  fecharSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }

  visualizarResumo(resumoId: string): void {
    this.router.navigate(['/resumos', resumoId]);
  }

  baixarResumo(resumo: ResumoResponse): void {
    this.disciplinaService.buscarResumoPorId(resumo.id).subscribe({
      next: (detalhesResumo) => {
        if (detalhesResumo.conteudo) {
          const nomeArquivoLimpo = resumo.titulo.replace(/[^a-z0-9\s_-]/gi, '').replace(/\s+/g, '_');
          this.criarEBaixarArquivoTxt(`${nomeArquivoLimpo || 'resumo'}.txt`, detalhesResumo.conteudo);
        } else {
          alert('Conteúdo vazio.');
        }
      },
      error: () => alert('Erro ao baixar.')
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

  toggleNotificationPanel(): void {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    if (this.isNotificationPanelOpen) {
      if (this.notifications.length === 0) {
        this.notifications = [
          { id: 1, message: 'Bem-vindo ao PDFocus.', date: new Date() }
        ];
      }
      this.hasUnreadNotifications = false;
      this.notificationCount = this.notifications.length;
    }
  }

  fazerUpgrade(): void {
    this.fecharUpgradeModal(); // Fecha o modal se estiver aberto
    this.router.navigate(['/assinatura']);
  }

  fecharInfoModal(): void {
    this.isInfoModalOpen = false;
  }

  // ADICIONADO: Este método estava faltando e é usado pelo HTML do modal de upgrade
  fecharUpgradeModal(): void {
    this.isUpgradeModalOpen = false;
  }
}