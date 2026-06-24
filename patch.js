const fs = require('fs');
const path = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

let content = fs.readFileSync(path, 'utf8');

const targetPalette = `<span class="lbl-ctrl">Simulador</span>
                  </button>
                </div>`;

const replacementPalette = `<span class="lbl-ctrl">Simulador</span>
                  </button>
                </div>
                <div class="col-6 mt-2">
                  <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('ANALISIS_CREDITO')">
                    <i class="bi bi-card-checklist fs-5 mb-1 text-primary"></i>
                    <span class="lbl-ctrl" style="font-size:0.7rem;">Análisis Crédito</span>
                  </button>
                </div>`;

// Only replace if it doesn't already have it
if (!content.includes('addGenericControl(\'ANALISIS_CREDITO\')')) {
    content = content.replace(targetPalette, replacementPalette);
}

const targetCanvas = `<small class="text-muted">Se renderizar el mdulo completo de simulacin en este espacio.</small>
                </div>`;
const targetCanvasFallback = `<small class="text-muted">Se renderizará el módulo completo de simulación en este espacio.</small>
                </div>`;

const replacementCanvas = `<small class="text-muted">Se renderizará el módulo completo de simulación en este espacio.</small>
                </div>
                <!-- ANALISIS CREDITO -->
                <div *ngIf="field.controlType === 'ANALISIS_CREDITO'" class="border p-4 bg-info bg-opacity-10 text-center rounded-3 shadow-sm border-info mt-2">
                  <i class="bi bi-card-checklist fs-2 text-info mb-2"></i>
                  <h6 class="text-info fw-bold mb-0">Componente: Análisis de Crédito</h6>
                  <small class="text-muted">Se renderizará la sección de información general.</small>
                </div>`;

if (!content.includes(`field.controlType === 'ANALISIS_CREDITO'`)) {
    if (content.includes(targetCanvas)) {
        content = content.replace(targetCanvas, replacementCanvas);
    } else if (content.includes(targetCanvasFallback)) {
        content = content.replace(targetCanvasFallback, replacementCanvas);
    } else {
        // Fallback robusto usando regex
        content = content.replace(/<!-- SIMULADOR -->[\s\S]*?<\/div>/, match => {
            return match + `
                <!-- ANALISIS CREDITO -->
                <div *ngIf="field.controlType === 'ANALISIS_CREDITO'" class="border p-4 bg-info bg-opacity-10 text-center rounded-3 shadow-sm border-info mt-2">
                  <i class="bi bi-card-checklist fs-2 text-info mb-2"></i>
                  <h6 class="text-info fw-bold mb-0">Componente: Análisis de Crédito</h6>
                  <small class="text-muted">Se renderizará la sección de información general.</small>
                </div>`;
        });
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully!");
