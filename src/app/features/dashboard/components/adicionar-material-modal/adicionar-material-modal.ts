import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // Para [(ngModel)] do dropdown
import { HttpEvent, HttpEventType } from '@angular/common/http';

// Imports de Ícones
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faCheck, faCloudUploadAlt, faFilePdf, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Imports do Serviço
import { DisciplinaService, DisciplinaResponse } from '../../../disciplinas/disciplina.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-adicionar-material-modal', // Seletor padrão do CLI
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './adicionar-material-modal.html',
  styleUrls: ['./adicionar-material-modal.css']
})
export class AdicionarMaterialModalComponent implements OnChanges {

  // --- Ícones para o Template ---
  faTimes = faTimes;
  faCheck = faCheck;
  faCloudUploadAlt = faCloudUploadAlt;
  faFilePdf = faFilePdf;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  // --- Inputs & Outputs ---
  @Input() isOpen = false;
  @Output() fecharModal = new EventEmitter<void>();

  // --- Estado (Passo 1: Disciplinas) ---
  disciplinas: DisciplinaResponse[] = [];
  selectedDisciplinaId: string | null = null;
  isLoadingDisciplinas = false;

  // --- Estado (Passo 2: Upload) ---
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  uploadError: string | null = null;
  uploadSuccess = false;

  constructor(
    private disciplinaService: DisciplinaService,
    private library: FaIconLibrary
  ) {
    // Registra os ícones necessários para este componente
    this.library.addIcons(faTimes, faCheck, faCloudUploadAlt, faFilePdf, faSpinner, faExclamationTriangle);
  }

  // --- Ciclo de Vida ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (changes['isOpen'].currentValue === true) {
        // Modal abriu
        this.carregarDisciplinas();
      } else {
        // Modal fechou
        this.resetarEstado();
      }
    }
  }

  // --- Métodos de Busca de Dados ---
  
  /**
   * Busca a lista de disciplinas para popular o dropdown.
   * (Reaproveitado do outro modal)
   */
  private carregarDisciplinas(): void {
    this.isLoadingDisciplinas = true;
    this.disciplinaService.buscarDisciplinas().subscribe({
      next: (data) => {
        this.disciplinas = data;
        this.isLoadingDisciplinas = false;
      },
      error: (err) => {
        console.error("Erro ao buscar disciplinas", err);
        this.isLoadingDisciplinas = false;
        this.uploadError = "Não foi possível carregar as disciplinas. Tente novamente.";
      }
    });
  }

  // --- Métodos de Ação (Template) ---

  /**
   * Chamado quando o usuário seleciona um arquivo no input <file>.
   * @param event O evento do input de arquivo.
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadError = null; // Limpa erros antigos
      this.uploadSuccess = false;
    }
  }

  /**
   * Remove o arquivo selecionado (clicando no 'X' do preview).
   */
  removerArquivoSelecionado(): void {
    this.selectedFile = null;
    this.uploadSuccess = false;
  }

  /**
   * Disparado pelo botão "Fazer Upload".
   * Chama o serviço para enviar o arquivo.
   */
  fazerUpload(): void {
    if (!this.selectedDisciplinaId || !this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess = false;

    // Usa o método do serviço que já retorna um Observable de HttpEvent
    this.disciplinaService.adicionarMaterial(this.selectedDisciplinaId, this.selectedFile)
      .pipe(
        // 'finalize' garante que 'isUploading' vire 'false' no final,
        // seja com sucesso ou com erro.
        finalize(() => {
          this.isUploading = false;
        })
      )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Atualiza a barra de progresso
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          } else if (event.type === HttpEventType.Response) {
            // Sucesso!
            this.uploadSuccess = true;
            this.selectedFile = null; // Limpa o arquivo
            
            // Fecha o modal automaticamente após 2 segundos
            setTimeout(() => {
              this.onFecharModal();
            }, 2000);
          }
        },
        error: (err) => {
          console.error("Erro no upload:", err);
          this.uploadError = err.message || "Ocorreu um erro ao enviar o arquivo.";
          this.uploadProgress = 0;
        }
      });
  }

  /**
   * Emite o evento para fechar o modal (clique no 'X' ou 'Cancelar').
   */
  onFecharModal(): void {
    // Só permite fechar se não estiver no meio de um upload
    if (!this.isUploading) {
      this.fecharModal.emit();
    }
  }

  /**
   * Limpa todo o estado do modal para a próxima vez que for aberto.
   */
  private resetarEstado(): void {
    this.disciplinas = [];
    this.selectedDisciplinaId = null;
    this.isLoadingDisciplinas = false;
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess = false;
  }

  // --- Métodos de Ajuda (Helpers) ---

  /**
   * Formata o tamanho do arquivo (em bytes) para KB, MB, etc.
   * @param bytes O tamanho do arquivo em bytes.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}