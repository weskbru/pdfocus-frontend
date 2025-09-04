import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// 1. Importamos as ferramentas do nosso core
import { AuthService, AutenticarUsuarioCommand } from '../../../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  // 2. Criamos uma propriedade para exibir mensagens de erro
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // 3. Injetamos o nosso AuthService para ter acesso aos seus métodos
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]] // A validação de minlength não é tão crucial no login
    });
  }

  // 4. Esta é a nova lógica de login que se conecta ao back-end
  onSubmit() {
    this.errorMessage = null; // Limpa erros antigos

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const credenciais: AutenticarUsuarioCommand = this.loginForm.value;

    this.authService.login(credenciais).subscribe({
      // O que fazer em caso de SUCESSO
      next: (response) => {
        // SUCESSO! Guardamos o token que o back-end nos enviou
        this.authService.guardarToken(response.token);
        
        this.loading = false;
        
        // E redirecionamos o usuário para a página principal da aplicação
        this.router.navigate(['/dashboard']);
      },
      // O que fazer em caso de ERRO
      error: (err) => {
        this.loading = false;
        // O back-end geralmente retorna um erro 403 (Forbidden) para credenciais inválidas
        this.errorMessage = 'E-mail ou senha inválidos. Por favor, tente novamente.';
        console.error('Erro no login:', err);
      }
    });
  }

  // Método para redirecionar para cadastro
  redirectToCadastro() {
    this.router.navigate(['/cadastro']);
  }

  get email() { return this.loginForm.get('email'); }
  get senha() { return this.loginForm.get('senha'); }
}
