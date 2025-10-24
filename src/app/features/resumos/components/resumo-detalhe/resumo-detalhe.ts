import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DisciplinaService, ResumoResponse } from '../../../disciplinas/disciplina.service';

@Component({
  selector: 'app-resumo-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resumo-detalhe.html',
  styleUrl: './resumo-detalhe.css'
})
export class ResumoDetalhe implements OnInit {
  resumo: ResumoResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private disciplinaService: DisciplinaService
  ) {}

  ngOnInit(): void {
    const resumoId = this.route.snapshot.paramMap.get('id');
    if (resumoId) {
      this.carregarResumo(resumoId);
    } else {
      this.errorMessage = 'ID do resumo não fornecido.';
      this.isLoading = false;
    }
  }

  private carregarResumo(id: string): void {
    this.isLoading = true;
    this.disciplinaService.buscarResumoPorId(id).subscribe({
      next: (resumo) => {
        this.resumo = resumo;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar o resumo.';
        this.isLoading = false;
        console.error('Erro:', err);
      }
    });
  }
}