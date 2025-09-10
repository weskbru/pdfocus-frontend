import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// IMPORTANTE: A CAUSA MAIS PROVÁVEL DO ERRO ESTÁ NESTA LINHA!
// Verifique se este caminho para o seu ficheiro `core/auth.ts` está correto.
import { AuthService, CadastrarUsuarioCommand } from '../../../../core/auth';

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
    // Aqui estamos a pedir o motor de verdade ao Angular
    private authService: AuthService
  ) {
    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validator: this.senhasConferem });
  }

  senhasConferem(group: FormGroup) {
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
    
    const dadosCadastro: CadastrarUsuarioCommand = {
      nome: this.cadastroForm.value.nome,
      email: this.cadastroForm.value.email,
      senha: this.cadastroForm.value.senha
    };

    // Usamos o motor de verdade para chamar a API
    this.authService.register(dadosCadastro).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Conta criada com sucesso! A redirecionar...';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao criar a conta. O e-mail já pode estar em uso.';
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  get nome() { return this.cadastroForm.get('nome'); }
  get email() { return this.cadastroForm.get('email'); }
  get senha() { return this.cadastroForm.get('senha'); }
  get confirmarSenha() { return this.cadastroForm.get('confirmarSenha'); }
}

