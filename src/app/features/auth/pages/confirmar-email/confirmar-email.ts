import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth';

@Component({
  selector: 'app-confirmar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmar-email.html'
})
export class ConfirmarEmailComponent implements OnInit {
  
  status: 'loading' | 'success' | 'error' = 'loading';
  mensagem = 'Validando seu acesso...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.mensagem = 'Link inválido. Verifique seu e-mail novamente.';
      return;
    }

    this.authService.confirmarEmail(token).subscribe({
      next: (response) => {
        console.log('✅ Resposta do Backend:', response); // <--- Adicione este log
        
        this.status = 'success';
        this.mensagem = 'E-mail verificado! Entrando no sistema...';

        // Auto-Login
        if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            if (response.nome) {
                localStorage.setItem('user', JSON.stringify({ nome: response.nome, email: response.email }));
            }
        }

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erro completo:', err); // <--- Veja este erro no console do navegador

        // Dica: Se o erro for "Unexpected token ... in JSON", o backend mandou Texto e o Angular esperava JSON.
        // Se o status for 200 mas caiu no error, é erro de parse.
        
        // Se o erro for 200 OK mas deu erro de parse, vamos considerar SUCESSO (Gambiarra temporária para validar)
        if (err.status === 200) {
             this.status = 'success';
             this.mensagem = 'Confirmado! (Ajuste de parse necessário)';
             setTimeout(() => this.router.navigate(['/login']), 2000);
             return;
        }

        this.status = 'error';
        this.mensagem = 'Este link expirou ou já foi utilizado.';
      }
    });
  }
}