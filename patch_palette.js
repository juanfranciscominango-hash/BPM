const fs = require('fs');
const path = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('addGenericControl(\'ANALISIS_CREDITO\')')) {
    // Busca el div.col-6 que contiene el Simulador
    content = content.replace(
        /(<div class="col-6">\s*<button[^>]*addGenericControl\('SIMULADOR'\)[^>]*>[\s\S]*?<\/button>\s*<\/div>)/,
        (match) => {
            return match + `
                  <div class="col-6 mt-2">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('ANALISIS_CREDITO')">
                      <i class="bi bi-card-checklist fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl" style="font-size:0.75rem;">Análisis Crédito</span>
                    </button>
                  </div>`;
        }
    );
    fs.writeFileSync(path, content, 'utf8');
    console.log("Palette successfully patched with regex!");
} else {
    console.log("Already patched.");
}
