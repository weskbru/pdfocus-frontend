import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// CORREÇÃO 1: O caminho correto para o AuthService
// Estamos em: features/auth/pages/cadastro/
// O serviço está em: features/auth/services/
import { AuthService } from '../../../../core/auth';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.senhasConferem }); // CORREÇÃO 2: A propriedade correta é 'validators' (plural)
  }

  // Validador de senhas ajustado para tipagem correta
  senhasConferem(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasNaoConferem: true };
  }

  onSubmit() {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Prepara o objeto para enviar ao Backend
    const dadosCadastro = {
      nome: this.cadastroForm.get('nome')?.value,
      email: this.cadastroForm.get('email')?.value,
      senha: this.cadastroForm.get('senha')?.value
    };

    this.authService.register(dadosCadastro).subscribe({
      next: (response) => {
        this.loading = false;
      
        // Enviamos um parâmetro na URL avisando que ele acabou de se registrar
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro no cadastro:', err);

        // Tratamento de erros comuns
        if (err.status === 409) {
          this.errorMessage = 'Este e-mail já está cadastrado.';
        } else {
          this.errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
        }
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  // Getters para facilitar o acesso no HTML
  get nome() { return this.cadastroForm.get('nome'); }
  get email() { return this.cadastroForm.get('email'); }
  get senha() { return this.cadastroForm.get('senha'); }
  get confirmarSenha() { return this.cadastroForm.get('confirmarSenha'); }
}