import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faFilePdf, faCheck, faFileWord, faFilePowerpoint, faFile } from '@fortawesome/free-solid-svg-icons';

// Import correto - ajuste o caminho conforme sua estrutura
import { MaterialSimples } from '../../../disciplinas/disciplina.service';

@Component({
  selector: 'app-selecionar-material-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './selecionar-material-modal.html',
  styleUrl: './selecionar-material-modal.css'
})
export class SelecionarMaterialModal { 

  // ✅ Ícones necessários
  faTimes = faTimes;
  faCheck = faCheck;
  faFilePdf = faFilePdf;
  faFileWord = faFileWord;
  faFilePowerpoint = faFilePowerpoint;
  faFile = faFile;

  // ✅ Inputs
  @Input() materiais: MaterialSimples[] = [];
  @Input() isOpen = false;

  // ✅ Outputs
  @Output() materialSelecionado = new EventEmitter<MaterialSimples>();
  @Output() fecharModal = new EventEmitter<void>();

  // ✅ Propriedade interna
  materialSelecionadoInterno: MaterialSimples | null = null;

  // ✅ Método para selecionar material
  selecionarMaterial(material: MaterialSimples): void {
    this.materialSelecionadoInterno = material;
  }

  // ✅ Método para confirmar seleção
  confirmarSelecao(): void {
    if (this.materialSelecionadoInterno) {
      this.materialSelecionado.emit(this.materialSelecionadoInterno);
    }
  }

  // ✅ Método para fechar modal
  onFecharModal(): void {
    this.materialSelecionadoInterno = null;
    this.fecharModal.emit();
  }

  // ✅ Método para obter ícone do material
  getMaterialIcon(material: MaterialSimples) {
    const extensao = material.nomeArquivo.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return faFilePdf;
      case 'docx': case 'doc': return faFileWord;
      case 'pptx': case 'ppt': return faFilePowerpoint;
      default: return faFile;
    }
  }

  // ✅ Método para obter classe CSS do ícone
  getMaterialIconClass(material: MaterialSimples): string {
    const extensao = material.nomeArquivo.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return 'text-red-500';
      case 'docx': case 'doc': return 'text-blue-500';
      case 'pptx': case 'ppt': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  }
}