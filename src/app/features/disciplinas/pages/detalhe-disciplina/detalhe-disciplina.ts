import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Interfaces para tipificar os nossos dados de exemplo
interface Resumo {
  id: string;
  titulo: string;
  dataAtualizacao: string;
}

interface Material {
  id: string;
  nome: string;
  tipo: 'PDF' | 'PPTX' | 'DOCX';
  tamanho: string;
}

/**
 * Componente responsável por exibir os detalhes de uma única disciplina,
 * incluindo os seus resumos e materiais associados.
 */
@Component({
  selector: 'app-detalhe-disciplina',
  standalone: true,
  imports: [CommonModule, RouterModule], // Adicionamos RouterModule para o routerLink funcionar
  templateUrl: './detalhe-disciplina.html',
  styleUrls: ['./detalhe-disciplina.css']
})
export class DetalheDisciplina implements OnInit {

  // Propriedades para guardar os dados da disciplina (preenchidas com dados de exemplo)
  disciplina = {
    nome: 'Carregando...',
    descricao: 'A carregar descrição...',
    totalResumos: 0,
    totalMateriais: 0
  };

  resumos: Resumo[] = [];
  materiais: Material[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  
  private disciplinaId: string | null = null;

  constructor(
    private route: ActivatedRoute, // Para ler o ID da disciplina da URL
    private router: Router
  ) { }

  ngOnInit(): void {
    // Lemos o ID da disciplina a partir da URL.
    this.disciplinaId = this.route.snapshot.paramMap.get('id');
    
    // No futuro, usaremos este ID para buscar os dados reais da API.
    // Por agora, chamamos a função que carrega os nossos dados de exemplo.
    this.carregarDadosDeExemplo();
  }

  /**
   * Simula o carregamento de dados da API, preenchendo as nossas propriedades
   * com dados de exemplo para podermos visualizar o layout.
   */
  carregarDadosDeExemplo(): void {
    this.isLoading = true;
    
    // Simula um atraso de rede
    setTimeout(() => {
      this.disciplina = {
        nome: 'Cálculo I',
        descricao: 'Esta é a descrição completa da disciplina de Cálculo I, abrangendo todos os tópicos de limites, derivadas e suas aplicações em problemas do mundo real.',
        totalResumos: 2,
        totalMateriais: 1
      };

      this.resumos = [
        { id: 'res1', titulo: 'Resumo sobre Limites', dataAtualizacao: 'há 1 dia' },
        { id: 'res2', titulo: 'Conceitos de Derivadas', dataAtualizacao: 'há 3 dias' }
      ];

      this.materiais = [
        { id: 'mat1', nome: 'Lista de Exercícios 1.pdf', tipo: 'PDF', tamanho: '2.5 MB' }
      ];
      
      this.isLoading = false;
    }, 1000); // 1 segundo de atraso
  }

  // Funções de ajuda para os ícones (como no dashboard)
  getMaterialIcon(tipo: string): string {
    switch (tipo) {
      case 'PDF': return 'fas fa-file-pdf text-red-500';
      case 'PPTX': return 'fas fa-file-powerpoint text-orange-500';
      case 'DOCX': return 'fas fa-file-word text-blue-500';
      default: return 'fas fa-file';
    }
  }
}
