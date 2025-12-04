import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// ✅ CORREÇÃO FINAL: Importando do seu arquivo 'app/core/auth.ts'
// (Subimos 4 níveis: pages -> auth -> features -> app -> core)
import { AuthService, AuthenticationResponse } from '../../../../core/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html', 
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  
  loginForm: FormGroup;
  loading = false;
  infoMessage = '';
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.infoMessage = 'Cadastro realizado! ✉️ Enviamos um link de confirmação para o seu e-mail.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.infoMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Se o seu AuthService espera um objeto específico ou 'any', o .value resolve
    const credenciais = this.loginForm.value;

    this.authService.login(credenciais).subscribe({
      next: (response) => {
        // Se você já tem um método guardarToken no seu auth.ts, use ele
        // Caso contrário, fazemos manual aqui:
        if (response.token) {
            // Verifica se o seu auth.ts tem o método 'guardarToken'
            // Se não tiver, use: localStorage.setItem('auth_token', response.token);
            if (typeof this.authService.guardarToken === 'function') {
                this.authService.guardarToken(response.token);
            } else {
                localStorage.setItem('auth_token', response.token);
            }
            
            // Salva usuário (opcional para UX)
            if (response.nome) {
                localStorage.setItem('user', JSON.stringify({ nome: response.nome, email: response.email }));
            }
        }
        
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro no login:', err);

        if (err.status === 401 || err.status === 403) {
            if (err.error && typeof err.error === 'string' && err.error.includes('confirm')) {
                 this.errorMessage = 'E-mail não verificado. Por favor, confirme sua conta.';
            } else {
                 this.errorMessage = 'E-mail ou senha incorretos.';
            }
        } else {
            this.errorMessage = 'Erro ao conectar ao servidor.';
        }
      }
    });
  }

  redirectToCadastro() {
    this.router.navigate(['/cadastro']);
  }

  get email() { return this.loginForm.get('email'); }
  get senha() { return this.loginForm.get('senha'); }
}