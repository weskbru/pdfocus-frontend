import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
// O nosso DisciplinaService já sabe como fazer o upload de materiais.
import { DisciplinaService } from '../../../disciplinas/disciplina.service';

/**
 * Componente responsável pelo formulário de upload de novos materiais.
 */
@Component({
  selector: 'app-adicionar-material',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './adicionar-material.html',
  styleUrls: ['./adicionar-material.css']
})
export class AdicionarMaterial implements OnInit {

  isLoading = false;
  errorMessage: string | null = null;
  
  // Propriedade para guardar o ficheiro que o utilizador selecionou.
  arquivoSelecionado: File | null = null;

  private disciplinaId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private disciplinaService: DisciplinaService
  ) { }

  /**
   * Na inicialização, captura o ID da disciplina a partir dos parâmetros da rota.
   */
  ngOnInit(): void {
    this.disciplinaId = this.route.snapshot.paramMap.get('disciplinaId');
    if (!this.disciplinaId) {
      this.errorMessage = "Erro: ID da disciplina não encontrado na URL. Por favor, volte e tente novamente.";
      console.error("ID da disciplina é nulo na rota.");
    }
  }

  /**
   * Método executado quando o utilizador seleciona um ficheiro no input.
   * @param event O evento do input de ficheiro.
   */
  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Guardamos o primeiro ficheiro selecionado na nossa propriedade.
      this.arquivoSelecionado = input.files[0];
      this.errorMessage = null; // Limpa erros antigos de validação.
    } else {
      this.arquivoSelecionado = null;
    }
  }

  /**
   * Método executado quando o formulário é submetido.
   */
  onSubmit(): void {
    // Valida se o ID da disciplina e um ficheiro foram selecionados.
    if (!this.disciplinaId) {
       this.errorMessage = "Não foi possível identificar a disciplina. Por favor, volte e tente novamente.";
       return;
    }
    if (!this.arquivoSelecionado) {
      this.errorMessage = "Por favor, selecione um ficheiro para enviar.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Delega a operação de upload para o serviço.
    this.disciplinaService.adicionarMaterial(this.disciplinaId, this.arquivoSelecionado).subscribe({
      next: (materialCriado) => {
        this.isLoading = false;
        // Após o sucesso, navega o utilizador de volta para a página de detalhes da disciplina.
        this.router.navigate(['/disciplinas/detalhe', this.disciplinaId]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Ocorreu um erro ao enviar o material. Por favor, tente novamente.';
        console.error('Erro ao adicionar material:', err);
      }
    });
  }

  /**
   * Navega o utilizador de volta para a página de detalhes da disciplina.
   */
  cancelar(): void {
    if (this.disciplinaId) {
      this.router.navigate(['/disciplinas/detalhe', this.disciplinaId]);
    } else {
      this.router.navigate(['/disciplinas']); // Rota de fallback caso o ID se perca.
    }
  }
}

