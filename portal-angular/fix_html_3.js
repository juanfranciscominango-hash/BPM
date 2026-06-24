const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let code = fs.readFileSync(file, 'utf8');

// I will just replace the whole section from <!-- TAB 1: DATOS to <!-- TAB 3: VALIDACIONES with the correct code.
// I can fetch the correct code from the git repository if there is one, but there isn't.
// Wait, I can extract the correct TAB 1 and TAB 2 from a previous backup or reconstruct it.
// Let's just restore from `screens_backup.json` or see if we have `extracted_code.txt`. No, we don't.
// BUT I can just use regex to fix the syntax error!
// The syntax error was ` Unexpected closing tag "li".` at line 257.
// Line 256 is `<i class="bi bi-plus-circle-fill" style="font-size: 0.95rem;"></i>`
// It should be followed by:
/*
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- TAB 2: CONTROLES (Caja de Herramientas Robustas al estilo Bizagi) -->
          <div *ngIf="activeSidebarTab === 'controls' && selectedProcessKey" class="fade-in">
...
*/
// And then the TAB 2 content which I know from my previous view.

const correctTab2 = `                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- TAB 2: CONTROLES (Caja de Herramientas Robustas al estilo Bizagi) -->
          <div *ngIf="activeSidebarTab === 'controls' && selectedProcessKey" class="fade-in">
            <!-- Ingreso de Datos -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-input-cursor-text text-indigo"></i>Ingreso de Datos
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('TEXTBOX')">
                      <i class="bi bi-text-left fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Caja Texto</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('NUMBER')">
                      <i class="bi bi-hash fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Número</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('MONEY')">
                      <i class="bi bi-currency-dollar fs-5 mb-1 text-success"></i>
                      <span class="lbl-ctrl">Moneda</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('DATE')">
                      <i class="bi bi-calendar-event fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Fecha</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('YESNO')">
                      <i class="bi bi-toggle-on fs-5 mb-1 text-warning"></i>
                      <span class="lbl-ctrl">Sí / No</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('FILEUPLOAD')">
                      <i class="bi bi-cloud-arrow-up fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Subir Archivo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Listas & Vistas -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-collection text-emerald"></i>Listas & Vistas
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('COMBO')">
                      <i class="bi bi-menu-button-wide fs-5 mb-1 text-indigo"></i>
                      <span class="lbl-ctrl">Selector</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('GRID')">
                      <i class="bi bi-grid-3x3 fs-5 mb-1 text-emerald"></i>
                      <span class="lbl-ctrl">Tabla / Grilla</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('IMAGE')">
                      <i class="bi bi-image fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Imagen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Otros -->
            <div class="card border-0 shadow-xs card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-activity text-rose"></i>Otros
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('BUTTON')">
                      <i class="bi bi-hand-index-thumb fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Botón Acción</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('LINK')">
                      <i class="bi bi-link-45deg fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Enlace</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('LABEL')">
                      <i class="bi bi-card-text fs-5 mb-1 text-warning"></i>
                      <span class="lbl-ctrl">Separador</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('SIMULADOR')">
                      <i class="bi bi-calculator-fill fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Simulador</span>
                    </button>
                  </div>
                  <div class="col-6 mt-2">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('RESUMEN_CASO')">
                      <i class="bi bi-file-earmark-person fs-5 mb-1 text-secondary"></i>
                      <span class="lbl-ctrl">Info General</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="activeSidebarTab === 'controls' && !selectedProcessKey" class="text-center py-5 text-muted card-premium border p-4">
            <i class="bi bi-exclamation-triangle fs-2 d-block mb-2 text-warning animate-bounce"></i>
            <span class="small fw-semibold">Selecciona un proceso primero para ver y arrastrar los controles al lienzo.</span>
          </div>`;

// First, I'll find where the corruption starts:
// At line 256: `<i class="bi bi-plus-circle-fill" style="font-size: 0.95rem;"></i>`
// and find where the next valid section starts.
// The next valid section is `<!-- TAB 3: VALIDACIONES -->`
// The `replace_file_content` pasted the `nav-pills` code, then `<!-- TAB 1: DATOS`, etc. It practically pasted the whole sidebar!
// Let's find `<!-- TAB 3: VALIDACIONES -->`
const startIndex = code.indexOf('<i class="bi bi-plus-circle-fill" style="font-size: 0.95rem;"></i>') + '<i class="bi bi-plus-circle-fill" style="font-size: 0.95rem;"></i>'.length;
const endIndex = code.indexOf('<!-- TAB 3: VALIDACIONES -->', startIndex);

if (startIndex > -1 && endIndex > -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    
    // Check if the original code had `</div>` before `<!-- TAB 3: VALIDACIONES -->`
    // Actually, `correctTab2` ends right where `<!-- TAB 3: VALIDACIONES -->` should begin, but wait!
    // At the end of TAB 2, there is `</div>` to close the `col-xxl-2 col-xl-3`? No, that is closed at the very end of all tabs.
    // Wait, the sidebar navigation tabs are inside `<div class="col-xxl-2 col-xl-3">` which closes at the end of TAB 4.
    // So the structure should be correct.
    const newCode = before + '\n' + correctTab2 + '\n\n          ' + after;
    fs.writeFileSync(file, newCode, 'utf8');
    console.log("File fixed successfully!");
} else {
    console.log("Could not find start or end index.");
}
