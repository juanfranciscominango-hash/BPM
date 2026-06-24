import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetaEntity, MetaAttribute, MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" *ngIf="form" (ngSubmit)="onSubmit()">
      <div class="row">
        <div class="col-12 mb-3" *ngFor="let attr of attributes">
          <label class="form-label fw-bold small text-uppercase text-muted">{{ attr.label }}</label>
          
          <!-- Renderizar según el tipo -->
          <ng-container [ngSwitch]="attr.type">
            <input *ngSwitchCase="'number'" type="number" class="form-control shadow-sm" [formControlName]="attr.name">
            <input *ngSwitchCase="'date'" type="date" class="form-control shadow-sm" [formControlName]="attr.name">
            <div *ngSwitchCase="'boolean'" class="form-check form-switch mt-1">
              <input class="form-check-input" type="checkbox" [formControlName]="attr.name">
              <label class="form-check-label">{{ attr.label }}</label>
            </div>
            <textarea *ngSwitchCase="'textarea'" class="form-control shadow-sm" [formControlName]="attr.name" rows="3"></textarea>
            <input *ngSwitchDefault type="text" class="form-control shadow-sm" [formControlName]="attr.name">
          </ng-container>
          
          <div *ngIf="form.get(attr.name)?.invalid && form.get(attr.name)?.touched" class="text-danger small mt-1">
            Este campo es requerido.
          </div>
        </div>
      </div>
      <div class="mt-4 d-flex justify-content-end">
        <button type="button" class="btn btn-outline-secondary me-2 px-4" (click)="onCancel.emit()">Cancelar</button>
        <button type="submit" class="btn btn-primary px-4 shadow-sm" [disabled]="form.invalid">
          <i class="bi bi-send-fill me-2"></i>Enviar Datos
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-control { border-radius: 8px; border: 1px solid #e0e0e0; }
    .form-control:focus { border-color: #4e73df; box-shadow: 0 0 0 0.2rem rgba(78,115,223,0.1); }
  `]
})
export class DynamicFormComponent implements OnInit {
  @Input() entityId!: number;
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  private metaService = inject(MetaService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  attributes: MetaAttribute[] = [];

  ngOnInit() {
    this.cargarAtributos();
  }

  cargarAtributos() {
    this.metaService.listarAtributos(this.entityId).subscribe(data => {
      this.attributes = data;
      this.buildForm();
    });
  }

  buildForm() {
    const group: any = {};
    this.attributes.forEach(attr => {
      const validators = attr.required ? [Validators.required] : [];
      group[attr.name] = ['', validators];
    });
    this.form = this.fb.group(group);
  }

  onSubmit() {
    if (this.form.valid) {
      this.onSave.emit(this.form.value);
    }
  }
}
