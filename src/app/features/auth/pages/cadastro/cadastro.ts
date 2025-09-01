// features/auth/pages/cadastro/cadastro.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
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
    if (this.cadastroForm.valid) {
      this.loading = true;
      console.log('Dados do cadastro:', this.cadastroForm.value);
      
      setTimeout(() => {
        this.loading = false;
        alert('Cadastro realizado com sucesso!');
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  // Método para redirecionar para login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }



  get nome() { return this.cadastroForm.get('nome'); }
  get email() { return this.cadastroForm.get('email'); }
  get senha() { return this.cadastroForm.get('senha'); }
  get confirmarSenha() { return this.cadastroForm.get('confirmarSenha'); }

  // Métodos para cadastro social
  cadastrarComGoogle() {
    console.log('Tentando cadastro com Google...');
    // Aqui você implementaria a integração com Google OAuth
    this.router.navigate(['/dashboard']);
  }

  cadastrarComLinkedIn() {
    console.log('Tentando cadastro com LinkedIn...');
    // Aqui você implementaria a integração com LinkedIn OAuth
    this.router.navigate(['/dashboard']);
  }
}