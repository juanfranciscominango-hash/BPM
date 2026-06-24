import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RuleService, RuleDefinition } from '../../../core/services/rule.service';

@Component({
  selector: 'app-reglas-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-ui-checks me-2"></i>Gestión de Reglas (DMN)</h2>
          <p class="text-muted">Define lógica de decisión reutilizable mediante tablas DMN.</p>
        </div>
        <button class="btn btn-primary shadow-sm" (click)="nuevaRegla()">
          <i class="bi bi-plus-lg me-1"></i>Nueva Regla
        </button>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Nombre de la Regla</th>
                <th>Clave (Key)</th>
                <th>Versión</th>
                <th>Estado</th>
                <th class="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rule of rules">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ rule.name }}</div>
                  <small class="text-muted" *ngIf="rule.lastUpdated">Última actualización: {{ rule.lastUpdated | date:'short' }}</small>
                </td>
                <td><code class="text-primary">{{ rule.key }}</code></td>
                <td><span class="badge bg-light text-dark border">v{{ rule.version || 1 }}</span></td>
                <td>
                  <span class="badge" [ngClass]="rule.status === 'DEPLOYED' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'">
                    {{ rule.status }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-2" (click)="editarRegla(rule.id!)">
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                  <button class="btn btn-sm btn-outline-success" (click)="probarRegla(rule.key)" *ngIf="rule.status === 'DEPLOYED'">
                    <i class="bi bi-play-fill me-1"></i>Probar
                  </button>
                </td>
              </tr>
              <tr *ngIf="rules.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-info-circle fs-2 d-block mb-2"></i>
                  No hay reglas definidas todavía.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReglasListComponent implements OnInit {
  private ruleService = inject(RuleService);
  private router = inject(Router);
  rules: RuleDefinition[] = [];

  ngOnInit() {
    this.cargarReglas();
  }

  cargarReglas() {
    this.ruleService.getRules().subscribe(data => this.rules = data);
  }

  nuevaRegla() {
    this.router.navigate(['/plataforma/disenador-reglas', 'nuevo']);
  }

  editarRegla(id: number) {
    this.router.navigate(['/plataforma/disenador-reglas', id]);
  }

  probarRegla(key: string) {
    const variables = prompt('Ingresa las variables de prueba en JSON:', '{"monto": 5000, "score": 750}');
    if (variables) {
      try {
        const json = JSON.parse(variables);
        this.ruleService.executeRule(key, json).subscribe({
          next: (res) => alert('Resultado de la Regla: ' + JSON.stringify(res, null, 2)),
          error: (err) => alert('Error al ejecutar regla: ' + (err.error?.message || 'Error'))
        });
      } catch (e) {
        alert('JSON inválido');
      }
    }
  }
}
