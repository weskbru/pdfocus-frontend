import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // Verifique se está importado
import { AuthService } from '../../../../core/service/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
    // ... seus imports
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public loginForm: FormGroup;

  // 2. INJETE O SERVIÇO NO CONSTRUTOR
  constructor(private authService: AuthService) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      console.log('Formulário inválido!');
      return;
    }
    
    // 3. CHAME O MÉTODO DE LOGIN DO SERVIÇO
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        // O que fazer quando o login funciona
        console.log('LoginComponent: Sucesso!', response);
        // TODO: Redirecionar para o dashboard
      },
      error: (err) => {
        // O que fazer quando o login falha
        console.error('LoginComponent: Erro!', err.message);
        // TODO: Mostrar o erro na tela para o usuário
      }
    });
  }
}