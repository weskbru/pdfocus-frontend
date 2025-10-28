import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faUserEdit, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { AuthService, UsuarioDetalhesResponse, AtualizarPerfilCommand } from '../../../../core/auth';

@Component({
  selector: 'app-editar-perfil-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './editar-perfil-modal.html',
  styleUrls: ['./editar-perfil-modal.css']
})
export class EditarPerfilModalComponent implements OnChanges {

  // --- Ícones Minimalistas ---
  faTimes = faTimes;
  faUserEdit = faUserEdit;
  faSpinner = faSpinner;
  faCheckCircle = faCheckCircle;

  // --- Inputs & Outputs ---
  @Input() isOpen = false;
  @Output() fecharModal = new EventEmitter<void>();
  @Output() perfilAtualizado = new EventEmitter<UsuarioDetalhesResponse>();

  // --- Estado do Formulário ---
  public nome = '';
  public email = '';
  private usuarioOriginal: UsuarioDetalhesResponse | null = null;

  // --- Estado da UI ---
  public isLoading = false;
  public isSubmitting = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private library: FaIconLibrary
  ) {
    this.library.addIcons(faTimes, faUserEdit, faSpinner, faCheckCircle);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetarFormulario();
      this.carregarDadosUsuario();
    }
  }

  private carregarDadosUsuario(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.authService.buscarUsuarioLogado().subscribe({
      next: (usuario) => {
        this.usuarioOriginal = usuario;
        this.nome = usuario.nome;
        this.email = usuario.email;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erro ao carregar dados do usuário:", err);
        this.errorMessage = "Não foi possível carregar seus dados.";
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.limparMensagens();

    if (!this.nome.trim()) {
      this.errorMessage = "O nome é obrigatório.";
      return;
    }

    // Verifica se houve mudança
    if (this.nome.trim() === this.usuarioOriginal?.nome) {
      this.onFecharModal();
      return;
    }

    this.isSubmitting = true;

    const payload: AtualizarPerfilCommand = {
      nome: this.nome.trim(),
    };

    this.authService.atualizarPerfil(payload).subscribe({
      next: (usuarioAtualizado) => {
        this.isSubmitting = false;
        this.successMessage = "Perfil atualizado com sucesso!";
        setTimeout(() => {
          this.perfilAtualizado.emit(usuarioAtualizado);
          this.onFecharModal();
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || "Erro ao atualizar perfil.";
      }
    });
  }

  private limparMensagens(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  onFecharModal(): void {
    if (!this.isLoading && !this.isSubmitting) {
      this.fecharModal.emit();
    }
  }

  private resetarFormulario(): void {
    this.nome = '';
    this.email = '';
    this.usuarioOriginal = null;
    this.isLoading = false;
    this.isSubmitting = false;
    this.limparMensagens();
  }
}