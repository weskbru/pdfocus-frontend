import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DisciplinaService, DetalheDisciplinaResponse, ResumoSimples, MaterialSimples, MaterialResponse } from '../../disciplina.service';

/**
 * Componente responsável por exibir os detalhes de uma única disciplina.
 */
@Component({
  selector: 'app-detalhe-disciplina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalhe-disciplina.html',
  styleUrls: ['./detalhe-disciplina.css']
})
export class DetalheDisciplina implements OnInit {

  disciplina: DetalheDisciplinaResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  
  // Propriedades para o modal de upload (simplificadas)
  modalUploadAberto = false;
  isUploading = false;
  arquivoSelecionado: File | null = null;
  uploadErrorMessage: string | null = null;
  
  private disciplinaId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disciplinaService: DisciplinaService
  ) { }

  ngOnInit(): void {
    this.disciplinaId = this.route.snapshot.paramMap.get('id');
    if (this.disciplinaId) {
      this.carregarDetalhesDaDisciplina(this.disciplinaId);
    } else {
      this.isLoading = false;
      this.errorMessage = "ID da disciplina não fornecido na URL.";
    }
  }

  carregarDetalhesDaDisciplina(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.disciplinaService.buscarDetalhesDisciplina(id).subscribe({
      next: (dados) => {
        this.disciplina = dados;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Não foi possível carregar os detalhes da disciplina.";
        console.error('Erro ao buscar detalhes da disciplina:', err);
      }
    });
  }

  // --- LÓGICA DO MODAL DE UPLOAD (SIMPLIFICADA) ---

  abrirModalUpload(): void {
    this.modalUploadAberto = true;
  }

  fecharModalUpload(): void {
    this.modalUploadAberto = false;
    this.arquivoSelecionado = null;
    this.isUploading = false;
    this.uploadErrorMessage = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validação simples de tamanho (ex: 100MB)
      if (file.size > 100 * 1024 * 1024) {
        this.uploadErrorMessage = 'Arquivo muito grande. O máximo é 100MB.';
        return;
      }
      this.arquivoSelecionado = file;
      this.uploadErrorMessage = null;
    }
  }

  removerArquivoSelecionado(): void {
    this.arquivoSelecionado = null;
  }
  
  fazerUploadMaterial(): void {
    if (!this.disciplinaId || !this.arquivoSelecionado) return;

    this.isUploading = true;
    this.uploadErrorMessage = null;

    this.disciplinaService.adicionarMaterial(this.disciplinaId, this.arquivoSelecionado).subscribe({
      // A subscrição agora é simples: só nos importamos com o sucesso ou o erro.
      next: (materialCriado) => {
        this.isUploading = false;
        this.fecharModalUpload();
        this.carregarDetalhesDaDisciplina(this.disciplinaId!); // Recarrega os dados
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadErrorMessage = 'Ocorreu um erro ao enviar o material. Tente novamente.';
        console.error('Erro ao adicionar material:', err);
      }
    });
  }

  // --- FUNÇÕES DE AJUDA ---
  formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getMaterialIcon(file: File | MaterialSimples): string {
    const name = 'name' in file ? file.name : file.nomeArquivo;
    const extensao = name.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return 'fas fa-file-pdf text-red-500';
      case 'pptx': case 'ppt': return 'fas fa-file-powerpoint text-orange-500';
      case 'docx': case 'doc': return 'fas fa-file-word text-blue-500';
      default: return 'fas fa-file';
    }
  }
}

