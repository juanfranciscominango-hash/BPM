import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicQueryService, CaseQueryRequest, CaseQueryResult, QueryFormField } from '../../../../core/services/dynamic-query';

@Component({
  selector: 'app-visor-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visor-consultas.html',
  styleUrls: ['./visor-consultas.scss']
})
export class VisorConsultasComponent implements OnInit {
  private queryService = inject(DynamicQueryService);

  request: CaseQueryRequest = {
    variables: {}
  };
  
  formSchema: QueryFormField[] = [];

  results: CaseQueryResult[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.cargarEsquema();
  }

  cargarEsquema() {
    this.queryService.getDefaultForm().subscribe({
      next: (res) => {
        if (res && res.schemaJson) {
          this.formSchema = JSON.parse(res.schemaJson).filter((f: any) => f.default);
        }
      },
      error: () => {
        this.error = 'No se encontró un esquema de formulario publicado. Use el Diseñador para crearlo.';
      }
    });
  }

  getVariableKeys(): string[] {
    if (!this.request.variables) return [];
    // Filtrar solo aquellas variables que tienen un valor asignado (para no mostrar vacíos en tabla)
    return Object.keys(this.request.variables).filter(k => this.request.variables![k]);
  }

  buscar() {
    this.loading = true;
    this.error = '';
    
    // Limpiar variables vacías antes de buscar
    if (this.request.variables) {
      Object.keys(this.request.variables).forEach(k => {
        if (this.request.variables![k] === '' || this.request.variables![k] == null) {
          delete this.request.variables![k];
        }
      });
    }

    this.queryService.executeCaseQuery(this.request).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al ejecutar la consulta';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
