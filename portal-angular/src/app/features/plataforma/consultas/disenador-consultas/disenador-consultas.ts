import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicQueryService, QueryFormField } from '../../../../core/services/dynamic-query';

@Component({
  selector: 'app-disenador-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disenador-consultas.html',
  styleUrls: ['./disenador-consultas.scss']
})
export class DisenadorConsultasComponent implements OnInit {
  
  private queryService = inject(DynamicQueryService);

  availableFields: QueryFormField[] = [];

  // Campos para agregar nuevo field
  newFieldId: string = '';
  newFieldLabel: string = '';
  newFieldType: string = 'TEXT';

  loading = false;
  message = '';

  ngOnInit(): void {
    this.cargarDiseno();
  }

  cargarDiseno() {
    this.queryService.getDefaultForm().subscribe({
      next: (res) => {
        if (res && res.schemaJson) {
          this.availableFields = JSON.parse(res.schemaJson);
        } else {
          this.setCamposPorDefecto();
        }
      },
      error: () => {
        // Si no existe, usamos los de por defecto
        this.setCamposPorDefecto();
      }
    });
  }

  setCamposPorDefecto() {
    this.availableFields = [
      { id: 'processDefinitionKey', label: 'Proceso (Key)', type: 'TEXT', default: true },
      { id: 'status', label: 'Estado (OPEN/CLOSED)', type: 'SELECT', default: true },
      { id: 'startedBy', label: 'Creador (User ID)', type: 'TEXT', default: true },
      { id: 'currentAssignee', label: 'Usuario Asignado', type: 'TEXT', default: true },
      { id: 'variables', label: 'Variables de Negocio dinámicas', type: 'DYNAMIC_MAP', default: true }
    ];
  }

  agregarCampo() {
    if (this.newFieldId && this.newFieldLabel) {
      this.availableFields.push({
        id: this.newFieldId,
        label: this.newFieldLabel,
        type: this.newFieldType,
        default: true
      });
      this.newFieldId = '';
      this.newFieldLabel = '';
    }
  }

  eliminarCampo(index: number) {
    this.availableFields.splice(index, 1);
  }

  guardarDiseno() {
    this.loading = true;
    this.message = '';
    this.queryService.saveForm(this.availableFields).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Diseño guardado exitosamente en la base de datos.';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.message = 'Error al guardar el diseño.';
        console.error(err);
      }
    });
  }
}
