// --- MUDANÇA: Adicionar HostListener e ElementRef ---
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService, DashboardEstatisticasResponse } from './dashboard.service'; // Removido MaterialRecenteResponse

// --- Imports dos Modais ---
import { NovoResumoDashboardModalComponent } from './components/novo-resumo-modal/novo-resumo-modal';
import { AdicionarMaterialModalComponent } from './components/adicionar-material-modal/adicionar-material-modal';
import { CriarDisciplinaModalComponent } from './components/criar-disciplina-modal/criar-disciplina-modal';
import { InfoModalComponent } from './components/info-modal/info-modal';

// --- Importar Modal de Perfil ---
import { EditarPerfilModalComponent } from '../profile/components/editar-perfil-modal/editar-perfil-modal'; // Ajuste o caminho se necessário

// --- Imports de Resumo ---
import { DisciplinaService, ResumoResponse } from '../disciplinas/disciplina.service';

// --- Imports de Ícones ---
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
// --- MUDANÇA: Adicionar Ícones do User Menu ---
import { faEye, faDownload, faUserEdit, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';

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

    FontAwesomeModule,
    NovoResumoDashboardModalComponent,
    AdicionarMaterialModalComponent,
    CriarDisciplinaModalComponent,
    InfoModalComponent,
    EditarPerfilModalComponent 

  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  providers: [DatePipe]
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


  public recentResumos: ResumoResponse[] = [];
  public isLoadingResumos = false;
 
 // --- Flags de Controle dos Modais ---
  public isNovoResumoModalOpen = false;
  public isAdicionarMaterialModalOpen = false;
  public isCriarDisciplinaModalOpen = false;
  public isInfoModalOpen = false;
  public infoModalTitle = '';
  public infoModalMessage = '';
  // --- MUDANÇA: Flag para o modal de perfil ---
  public isPerfilModalOpen = false;
  // --- MUDANÇA: Flag para o dropdown do usuário ---
  public isUserMenuOpen = false;

 // --- Ícones ---
  faEye = faEye;
  faDownload = faDownload;
  faUserEdit = faUserEdit;
  faSignOutAlt = faSignOutAlt;
  faBell = faBell;


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
    private disciplinaService: DisciplinaService,
    private dashboardService: DashboardService,
    library: FaIconLibrary,
    private elementRef: ElementRef
  ) {
      library.addIcons(faEye, faDownload, faUserEdit, faSignOutAlt, faBell);
  }

  // --- Métodos de Ciclo de Vida ---
  /**
   * Hook do Angular chamado na inicialização do componente.
   * Dispara o carregamento de todos os dados iniciais do dashboard.
   */
  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarEstatisticas();
    this.carregarResumosRecentes();
  }

/**
   * Escuta cliques em qualquer lugar do documento.
   * Se o clique for FORA do menu do usuário (ícone ou dropdown), fecha o dropdown.
   * @param event O evento de clique do mouse.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const userMenuArea = this.elementRef.nativeElement.querySelector('#user-menu-area');
    // Se o menu está aberto E o clique NÃO foi dentro da área do menu
    if (this.isUserMenuOpen && userMenuArea && !userMenuArea.contains(event.target as Node)) {
      this.isUserMenuOpen = false;
    }
  }

  // --- MUDANÇA: Método para controlar dropdown ---
  /** Alterna a visibilidade do menu dropdown do usuário. */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  abrirModalEditarPerfil(): void {
    console.log("Abrindo modal de editar perfil...");
    this.isPerfilModalOpen = true;
    this.isUserMenuOpen = false; // Fecha o dropdown ao abrir o modal
  }


  /** Fecha o modal de edição de perfil. */
  fecharModalEditarPerfil(): void {
    this.isPerfilModalOpen = false;
  }

  /** Chamado quando o modal de perfil emite sucesso na atualização. Recarrega o nome do usuário. */
  onPerfilAtualizado(novosDados: any): void { // Use 'UserInfo' se tiver essa interface
     console.log('Perfil atualizado, recarregando dados do usuário...', novosDados);
     this.fecharModalEditarPerfil();
     this.carregarDadosDoUsuario(); 
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

   * Busca todos os resumos do usuário, ordena por data de criação (mais recente primeiro)
   * e armazena os 5 primeiros em 'recentResumos'.
   */
  private carregarResumosRecentes(): void {
    this.isLoadingResumos = true; // Inicia loading (opcional)
    this.disciplinaService.buscarTodosResumos().subscribe({
      next: (todosResumos) => {
        // Ordena pela data de criação (string ISO 8601), mais recente primeiro
        const resumosOrdenados = [...todosResumos].sort((a, b) => {
          // Comparação de strings ISO funciona para ordenação cronológica descendente
          return b.dataCriacao.localeCompare(a.dataCriacao);
        });

        // Pega os 5 mais recentes (ou menos, se houver menos que 5)
        this.recentResumos = resumosOrdenados.slice(0, 5);
        this.isLoadingResumos = false; // Finaliza loading
      },
      error: (err) => {
        console.error('Erro ao buscar resumos recentes:', err);
        this.isLoadingResumos = false; // Finaliza loading
        // TODO: Mostrar mensagem de erro específica para esta seção?
      }
    });
  }
 

  /**
   * Navega para a página de detalhes do resumo clicado.
   * @param resumoId O ID do resumo.
   */
  visualizarResumo(resumoId: string): void {
    // IMPORTANTE: Confirme se '/resumos/:id' é a rota correta no seu app.routes.ts
    this.router.navigate(['/resumos', resumoId]);
  }

  /**
   * Busca o conteúdo completo do resumo e inicia o download como arquivo .txt.
   * @param resumo O objeto ResumoResponse clicado.
   */
  baixarResumo(resumo: ResumoResponse): void {
    console.log('Iniciando download para:', resumo.titulo);
    // TODO: Adicionar feedback visual de loading para o download
    this.disciplinaService.buscarResumoPorId(resumo.id).subscribe({
        next: (detalhesResumo) => {
            if (detalhesResumo.conteudo) {
                // Remove caracteres inválidos do nome do arquivo (simplificado)
                const nomeArquivoLimpo = resumo.titulo.replace(/[^a-z0-9\s_-]/gi, '').replace(/\s+/g, '_');
                this.criarEBaixarArquivoTxt(`${nomeArquivoLimpo || 'resumo'}.txt`, detalhesResumo.conteudo);
            } else {
                console.error('Conteúdo do resumo está vazio.');
                alert('Não foi possível baixar o resumo: conteúdo vazio.'); // Exemplo de feedback
            }
             // TODO: Remover feedback de loading
        },
        error: (err) => {
            console.error('Erro ao buscar detalhes do resumo para download:', err);
            alert('Erro ao baixar o resumo. Tente novamente.'); // Exemplo de feedback
             // TODO: Remover feedback de loading
        }
    });
  }



  /**
   * Cria um Blob com o conteúdo de texto e força o download no navegador.
   * @param nomeArquivo O nome desejado para o arquivo (ex: "meu_resumo.txt").
   * @param conteudo O texto a ser salvo no arquivo.
   */
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
public notificationCount = 3;

marcarNotificacoesComoLidas(): void {
  this.hasUnreadNotifications = false;
  this.notificationCount = 0;
}
}