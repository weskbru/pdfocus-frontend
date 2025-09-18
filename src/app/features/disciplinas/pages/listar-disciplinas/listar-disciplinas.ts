import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DisciplinaService, DisciplinaResponse } from '../../disciplina.service';

/**
 * Componente responsável por listar e gerir as disciplinas do utilizador.
 */
@Component({
  selector: 'app-listar-disciplinas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar-disciplinas.html',
  styleUrls: ['./listar-disciplinas.css']
})
export class ListarDisciplinas implements OnInit {

  disciplinas: DisciplinaResponse[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Propriedades para controlar o nosso novo modal de confirmação
  disciplinaParaDeletar: DisciplinaResponse | null = null;
  showDeleteModal = false;

  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router
  ) { }

  /**
   * Método de ciclo de vida do Angular. É executado na inicialização do componente.
   */
  ngOnInit(): void {
    this.carregarDisciplinas();
  }

  /**
   * Busca a lista de disciplinas do utilizador através do serviço.
   */
  carregarDisciplinas(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.disciplinaService.buscarDisciplinas().subscribe({
      next: (data) => {
        this.disciplinas = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Falha ao carregar as disciplinas. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
        console.error('Erro ao buscar disciplinas:', err);
      }
    });
  }

  /**
   * Navega para a página de criação de uma nova disciplina.
   */
  navegarParaNovaDisciplina(): void {
    this.router.navigate(['/disciplinas/nova']);
  }
  
  navegarParaUpgrade(): void {
    // Lógica futura para a página de planos/upgrade
    console.log('Navegando para a página de upgrade...');
  }

  // --- LÓGICA DO MODAL DE DELEÇÃO ---

  /**
   * Abre o modal de confirmação para apagar uma disciplina.
   * @param disciplina A disciplina que o utilizador pretende apagar.
   */
  abrirModalDelecao(disciplina: DisciplinaResponse): void {
    this.disciplinaParaDeletar = disciplina;
    this.showDeleteModal = true;
  }

  /**
   * Fecha o modal de confirmação.
   */
  fecharModalDelecao(): void {
    this.disciplinaParaDeletar = null;
    this.showDeleteModal = false;
  }

  /**
   * Confirma a exclusão, chama o serviço e atualiza a UI.
   */
  confirmarDelecao(): void {
    if (!this.disciplinaParaDeletar) return;

    const idParaDeletar = this.disciplinaParaDeletar.id;

    this.disciplinaService.deletarDisciplina(idParaDeletar).subscribe({
      next: () => {
        // Atualiza a lista na UI para remover a disciplina apagada instantaneamente.
        this.disciplinas = this.disciplinas.filter(d => d.id !== idParaDeletar);
        this.fecharModalDelecao();
      },
      error: (err) => {
        this.errorMessage = 'Não foi possível apagar a disciplina. Tente novamente.';
        console.error('Erro ao apagar disciplina:', err);
        this.fecharModalDelecao();
      }
    });
  }

 /**
   * Navega o utilizador para o formulário de edição, passando o ID
   * da disciplina selecionada na URL.
   *
   * @param id O UUID da disciplina a ser editada.
   */
  editarDisciplina(id: string): void {
    // Usamos o Router para navegar para a nossa nova rota de edição.
    this.router.navigate(['/disciplinas/editar', id]);
  }

  /**
   * Navega o utilizador para a página de detalhes da disciplina selecionada.
   * @param id O UUID da disciplina a ser visualizada.
   */
  verDetalhes(id: string): void {
    this.router.navigate(['/disciplinas/detalhe', id]);
  }
}

