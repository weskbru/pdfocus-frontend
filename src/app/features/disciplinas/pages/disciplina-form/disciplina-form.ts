import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DisciplinaService, CriarDisciplinaCommand, AtualizarDisciplinaCommand, DisciplinaResponse } from '../../disciplina.service';

/**
 * Componente responsável pelo formulário de criação e edição de Disciplinas.
 */
@Component({
  selector: 'app-disciplina-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './disciplina-form.html',
  styleUrls: ['./disciplina-form.css']
})
export class DisciplinaForm implements OnInit {

  disciplinaForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  
  isEditMode = false;
  private disciplinaId: string | null = null;
  isGeneratingDescription = false; // Controlo de estado para a funcionalidade de IA

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private disciplinaService: DisciplinaService
  ) {
    this.disciplinaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    this.disciplinaId = this.route.snapshot.paramMap.get('id');

    if (this.disciplinaId) {
      this.isEditMode = true;
      this.carregarDadosDaDisciplina(this.disciplinaId);
    }
  }

  carregarDadosDaDisciplina(id: string): void {
    this.isLoading = true;
    this.disciplinaService.buscarDisciplinaPorId(id).subscribe({
      next: (disciplina) => {
        this.disciplinaForm.patchValue({
          nome: disciplina.nome,
          descricao: disciplina.descricao
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Não foi possível carregar os dados da disciplina.';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.disciplinaForm.invalid) {
      this.disciplinaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    if (this.isEditMode && this.disciplinaId) {
      const command: AtualizarDisciplinaCommand = this.disciplinaForm.value;
      this.disciplinaService.atualizarDisciplina(this.disciplinaId, command).subscribe(this.handleSuccess, this.handleError);
    } else {
      const command: CriarDisciplinaCommand = this.disciplinaForm.value;
      this.disciplinaService.criarDisciplina(command).subscribe(this.handleSuccess, this.handleError);
    }
  }
  
  /**
   * ✨ Funcionalidade com IA: Gera uma descrição para a disciplina usando a API Gemini.
   */
  async gerarDescricaoIA(): Promise<void> {
    const nomeDisciplina = this.disciplinaForm.get('nome')?.value;
    if (!nomeDisciplina || nomeDisciplina.trim().length < 3) {
      this.errorMessage = 'Por favor, insira um nome de disciplina válido primeiro.';
      return;
    }

    this.isGeneratingDescription = true;
    this.errorMessage = null;
    const originalDesc = this.disciplinaForm.get('descricao')?.value;
    this.disciplinaForm.patchValue({ descricao: 'A gerar descrição com a IA...' });

    const systemPrompt = "Aja como um tutor académico experiente.";
    const userQuery = `Escreve uma descrição concisa e informativa, com um parágrafo, para uma disciplina de estudo chamada '${nomeDisciplina}'. A descrição deve resumir os tópicos principais abordados de forma clara e direta.`;

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const generatedText = candidate.content.parts[0].text;
        this.disciplinaForm.patchValue({ descricao: generatedText.trim() });
      } else {
        throw new Error("A resposta da API não contém texto válido.");
      }

    } catch (error) {
      console.error('Erro ao gerar descrição com IA:', error);
      this.errorMessage = 'Não foi possível gerar a descrição. Tente novamente.';
      this.disciplinaForm.patchValue({ descricao: originalDesc }); // Restaura a descrição original em caso de erro
    } finally {
      this.isGeneratingDescription = false;
    }
  }


  private handleSuccess = (response: DisciplinaResponse) => {
    this.isLoading = false;
    this.router.navigate(['/disciplinas']);
  };

  private handleError = (err: any) => {
    this.isLoading = false;
    this.errorMessage = `Ocorreu um erro ao ${this.isEditMode ? 'atualizar' : 'criar'} a disciplina.`;
    console.error(err);
  };

  voltarParaDisciplinas(): void {
    this.router.navigate(['/disciplinas']);
  }

  voltarParaDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  get nome() { return this.disciplinaForm.get('nome'); }
  get descricao() { return this.disciplinaForm.get('descricao'); }
}

