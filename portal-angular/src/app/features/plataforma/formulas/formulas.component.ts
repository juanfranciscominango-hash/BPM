import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormulaService, FormulaDefinition } from '../../../core/services/formula.service';
import { MetaService, MetaEntity, MetaAttribute } from '../../../core/services/meta.service';
import Swal from 'sweetalert2';

interface FormulaElement {
  id: string;
  type: 'variable' | 'operator' | 'number';
  label: string;
  value: string;
}

@Component({
  selector: 'app-formulas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulas.component.html',
  styleUrls: ['./formulas.component.css']
})
export class FormulasComponent implements OnInit {

  viewMode: 'list' | 'editor' = 'list';
  formulas: FormulaDefinition[] = [];
  
  // Services
  private formulaService = inject(FormulaService);
  private metaService = inject(MetaService);

  // Editor State
  currentFormula: FormulaDefinition = { key: '', name: '', description: '', expression: '', canvasJson: '[]' };
  
  entities: MetaEntity[] = [];
  selectedEntityId: number | null = null;
  
  availableVariables: FormulaElement[] = [];
  availableOperators: FormulaElement[] = [
    { id: 'o1', type: 'operator', label: '+', value: '+' },
    { id: 'o2', type: 'operator', label: '-', value: '-' },
    { id: 'o3', type: 'operator', label: 'x', value: '*' },
    { id: 'o4', type: 'operator', label: '÷', value: '/' },
    { id: 'o5', type: 'operator', label: '(', value: '(' },
    { id: 'o6', type: 'operator', label: ')', value: ')' },
    { id: 'o7', type: 'operator', label: '^', value: '^' },
    { id: 'o8', type: 'operator', label: '>', value: '>' },
    { id: 'o9', type: 'operator', label: '<', value: '<' },
    { id: 'o10', type: 'operator', label: '==', value: '==' },
    { id: 'o11', type: 'operator', label: 'Y (AND)', value: 'and' },
    { id: 'o12', type: 'operator', label: 'O (OR)', value: 'or' },
    { id: 'o13', type: 'operator', label: 'SI ( ? )', value: '?' },
    { id: 'o14', type: 'operator', label: 'SINO ( : )', value: ':' }
  ];

  canvasElements: FormulaElement[] = [];
  isDraggingOver = false;
  customNumber: number | null = null;
  
  // Simulator
  testValues: { [key: string]: number } = {};
  resultValue: any = 0;
  evaluationError: boolean = false;

  ngOnInit() {
    this.loadFormulas();
    this.loadEntities();
  }

  loadFormulas() {
    this.formulaService.getAllFormulas().subscribe(data => {
      this.formulas = data;
    });
  }

  loadEntities() {
    this.metaService.listarEntidades().subscribe(data => {
      this.entities = data;
    });
  }

  onEntityChange() {
    if (this.selectedEntityId) {
      this.metaService.listarAtributos(this.selectedEntityId).subscribe(attrs => {
        this.availableVariables = attrs.map(a => ({
          id: 'v_' + a.id,
          type: 'variable',
          label: a.label,
          value: a.name
        }));
      });
    } else {
      this.availableVariables = [];
    }
  }

  // --- List Actions ---
  
  openEditor(formula?: FormulaDefinition) {
    if (formula) {
      this.currentFormula = { ...formula };
      try {
        this.canvasElements = JSON.parse(this.currentFormula.canvasJson || '[]');
      } catch(e) {
        this.canvasElements = [];
      }
    } else {
      this.currentFormula = { key: '', name: '', description: '', expression: '', canvasJson: '[]' };
      this.canvasElements = [];
    }
    this.testValues = {};
    this.resultValue = 0;
    this.viewMode = 'editor';
    this.evaluateFormula();
  }

  deleteFormula(id: number) {
    Swal.fire({
      title: '¿Eliminar fórmula?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formulaService.deleteFormula(id).subscribe(() => {
          Swal.fire('Eliminada', '', 'success');
          this.loadFormulas();
        });
      }
    });
  }

  saveFormula() {
    if (!this.currentFormula.key || !this.currentFormula.name) {
      Swal.fire('Error', 'Llave y nombre son obligatorios', 'error');
      return;
    }
    this.currentFormula.expression = this.getExpressionString();
    this.currentFormula.canvasJson = JSON.stringify(this.canvasElements);

    const req = this.currentFormula.id 
      ? this.formulaService.updateFormula(this.currentFormula.id, this.currentFormula)
      : this.formulaService.createFormula(this.currentFormula);

    req.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Fórmula guardada correctamente', 'success');
        this.viewMode = 'list';
        this.loadFormulas();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo guardar: ' + err.message, 'error');
      }
    });
  }

  backToList() {
    this.viewMode = 'list';
  }

  // --- Drag & Drop ---

  onDragStart(event: DragEvent, item: FormulaElement) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
    if (event.dataTransfer) {
      const data = event.dataTransfer.getData('application/json');
      if (data) {
        const item: FormulaElement = JSON.parse(data);
        this.canvasElements.push({ ...item, id: item.id + '_' + Date.now() });
        this.evaluateFormula();
      }
    }
  }

  addCustomNumber() {
    if (this.customNumber !== null && this.customNumber !== undefined) {
      this.canvasElements.push({
        id: 'n_' + Date.now(),
        type: 'number',
        label: this.customNumber.toString(),
        value: this.customNumber.toString()
      });
      this.customNumber = null;
      this.evaluateFormula();
    }
  }

  removeElement(index: number) {
    this.canvasElements.splice(index, 1);
    this.evaluateFormula();
  }

  clearCanvas() {
    this.canvasElements = [];
    this.evaluateFormula();
  }

  getExpressionString(): string {
    // SpEL syntax maps: x -> *, ÷ -> /
    return this.canvasElements.map(e => {
      let val = e.value;
      if (e.type === 'variable') {
        return val;
      }
      return val;
    }).join(' ');
  }

  getVariablesInCanvas(): FormulaElement[] {
    const vars = this.canvasElements.filter(e => e.type === 'variable');
    const unique = new Map<string, FormulaElement>();
    for (const v of vars) {
      if (!unique.has(v.value)) {
        unique.set(v.value, v);
      }
    }
    return Array.from(unique.values());
  }

  evaluateFormula() {
    this.evaluationError = false;
    const expression = this.getExpressionString();
    
    if (!expression.trim()) {
      this.resultValue = 0;
      return;
    }

    // Call backend to evaluate formula using SpEL
    this.formulaService.evaluateFormula(expression, this.testValues).subscribe({
      next: (res) => {
        this.resultValue = res.result;
        this.evaluationError = false;
      },
      error: () => {
        this.evaluationError = true;
        this.resultValue = 0;
      }
    });
  }
}
