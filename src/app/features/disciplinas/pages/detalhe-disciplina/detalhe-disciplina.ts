import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// 1. Importamos o nosso serviço e as novas interfaces
import { DisciplinaService, DetalheDisciplinaResponse, ResumoSimples, MaterialSimples } from '../../disciplina.service';

/**
 * Componente responsável por exibir os detalhes de uma única disciplina,
 * incluindo os seus resumos e materiais associados.
 */
@Component({
  selector: 'app-detalhe-disciplina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalhe-disciplina.html',
  styleUrls: ['./detalhe-disciplina.css']
})
export class DetalheDisciplina implements OnInit {

  // Propriedades para guardar os dados que vêm da API
  disciplina: DetalheDisciplinaResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  
  private disciplinaId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disciplinaService: DisciplinaService // 2. Injetamos o serviço de disciplinas
  ) { }

  ngOnInit(): void {
    // Lemos o ID da disciplina a partir da URL.
    this.disciplinaId = this.route.snapshot.paramMap.get('id');
    
    if (this.disciplinaId) {
      // Se temos um ID, chamamos a API para buscar os dados reais.
      this.carregarDetalhesDaDisciplina(this.disciplinaId);
    } else {
      // Se não há ID, é um erro de navegação.
      this.isLoading = false;
      this.errorMessage = "ID da disciplina não fornecido na URL.";
    }
  }

  /**
   * Busca os dados detalhados da disciplina na API.
   * @param id O UUID da disciplina a ser carregada.
   */
  carregarDetalhesDaDisciplina(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.disciplinaService.buscarDetalhesDisciplina(id).subscribe({
      next: (dados) => {
        // Quando os dados chegam com sucesso, preenchemos a nossa propriedade.
        this.disciplina = dados;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Não foi possível carregar os detalhes da disciplina.";
        console.error('Erro ao buscar detalhes da disciplina:', err);
        // Opcional: redirecionar para a lista de disciplinas após um erro.
        // setTimeout(() => this.router.navigate(['/disciplinas']), 3000);
      }
    });
  }

  // Função de ajuda para os ícones, agora adaptada para receber MaterialSimples
  getMaterialIcon(material: MaterialSimples): string {
    const extensao = material.nomeArquivo.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return 'fas fa-file-pdf text-red-500';
      case 'pptx': return 'fas fa-file-powerpoint text-orange-500';
      case 'docx': return 'fas fa-file-word text-blue-500';
      default: return 'fas fa-file';
    }
  }
}

