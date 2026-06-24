import re
with open('src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<!-- OVERLAY SIMULACION -->(.*)<!-- FIN OVERLAY SIMULACION -->', content, re.DOTALL)
if m:
    html = m.group(1).strip()
    html = html.replace('<div *ngIf="mostrarPreview" class="sim-overlay"', '<div class="sim-container"')
    html = html.replace('mostrarPreview = false', 'volver()')
    
    # Add the header and layout
    header = '''
<div class="container-fluid py-4" style="max-width: 1200px;">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="h3 fw-bold text-dark mb-0"><i class="bi bi-play-circle text-primary me-2"></i>Ejecutor de Pantallas</h2>
  </div>
  
  <div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-body p-4 bg-light rounded-4">
      <div class="row align-items-end">
        <div class="col-md-8">
          <label class="form-label fw-bold text-muted small">Selecciona un Proceso para Simular</label>
          <select class="form-select form-select-lg border-0 shadow-sm" [(ngModel)]="selectedProcessKey" (change)="onProcessChange()">
            <option value="">-- Elija un Proceso --</option>
            <option *ngFor="let p of procesos" [value]="p.key">{{ p.name }}</option>
          </select>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary-premium shadow-sm py-2 px-4 fw-bold" [disabled]="!selectedProcessKey" (click)="onProcessChange()">
            <i class="bi bi-arrow-clockwise me-1"></i>Recargar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="layout" class="mt-4">
'''
    footer = '''
  </div>
  
  <div *ngIf="!layout && selectedProcessKey" class="text-center py-5 text-muted">
    <i class="bi bi-display text-muted fs-1 mb-3 d-block opacity-50"></i>
    <h5>Cargando diseño...</h5>
  </div>
  <div *ngIf="!selectedProcessKey" class="text-center py-5 text-muted">
    <i class="bi bi-arrow-up-circle text-primary fs-1 mb-3 d-block opacity-50"></i>
    <h5>Selecciona un proceso arriba para comenzar la simulación.</h5>
  </div>
</div>
'''
    
    with open('src/app/features/plataforma/ejecutor-pantallas/ejecutor-pantallas.component.html', 'w', encoding='utf-8') as out:
        out.write(header + html + footer)
    print("HTML extracted and saved.")
else:
    print("Could not find block.")
