// features/auth/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Métodos para login social
  loginWithGoogle() {
    console.log('Tentando login com Google...');
    // Aqui você implementaria a integração com Google OAuth
    this.router.navigate(['/dashboard']);
  }

  loginWithLinkedIn() {
    console.log('Tentando login com LinkedIn...');
    // Aqui você implementaria a integração com LinkedIn OAuth
    this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      console.log('Login realizado:', this.loginForm.value);
      
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }, 2000);
    }
  }

  // Método para redirecionar para cadastro
  redirectToCadastro() {
    this.router.navigate(['/cadastro']);
  }

  get email() { return this.loginForm.get('email'); }
  get senha() { return this.loginForm.get('senha'); }
}