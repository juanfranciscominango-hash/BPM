const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(file, 'utf8');

function injectAfter(searchStr, insertStr) {
  const idx = content.indexOf(searchStr);
  if (idx !== -1) {
    content = content.substring(0, idx + searchStr.length) + insertStr + content.substring(idx + searchStr.length);
  } else {
    console.log("NOT FOUND: " + searchStr.substring(0, 50));
  }
}

function injectBefore(searchStr, insertStr) {
  const idx = content.indexOf(searchStr);
  if (idx !== -1) {
    content = content.substring(0, idx) + insertStr + content.substring(idx);
  } else {
    console.log("NOT FOUND: " + searchStr.substring(0, 50));
  }
}

// 1. Sidebar (Search for exact string)
const search1 = `addGenericControl('SIMULADOR')">
                      <i class="bi bi-calculator-fill fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Simulador</span>
                    </button>
                  </div>`;
const insert1 = `
                  <div class="col-6 mt-2">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('RESUMEN_CASO')">
                      <i class="bi bi-file-earmark-person fs-5 mb-1 text-secondary"></i>
                      <span class="lbl-ctrl">Info General</span>
                    </button>
                  </div>`;
injectAfter(search1, insert1);

// 2. Canvas
const search2 = `field.controlType === 'SIMULADOR'`;
const search2b = `</div>`;
const idx2 = content.indexOf(search2);
if (idx2 !== -1) {
    const endDivIdx = content.indexOf(search2b, idx2 + search2.length);
    if (endDivIdx !== -1) {
        const insert2 = `

                                <!-- RESUMEN_CASO -->
                                <div *ngIf="field.controlType === 'RESUMEN_CASO'" class="border bg-white rounded-3 shadow-sm mt-2 mb-2">
                                  <div class="p-2 border-bottom fw-bold text-muted bg-light" style="font-size: 0.85rem;">
                                    <i class="bi bi-chevron-up me-1"></i> Información General
                                  </div>
                                  <div class="p-3">
                                    <div class="row" style="font-size: 0.75rem;">
                                      <div class="col-3 text-muted mb-2">FECHA CASO:<br><strong class="text-dark">2026-06-22</strong></div>
                                      <div class="col-3 text-muted mb-2">NÚMERO CASO:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">CIUDAD:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">AGENCIA:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">ASESOR:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">FECHA SOLICITUD:<br><strong class="text-dark">22/6/2026, 11:32:53 a.m.</strong></div>
                                      <div class="col-3 text-muted mb-2">SUBSEGMENTO:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">PRODUCTO:<br><strong class="text-dark">VIP</strong></div>
                                      <div class="col-3 text-muted mb-2">DESTINO COMERCIAL:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted mb-2">IDENTIFICACIÓN:<br><strong class="text-dark">1700000014</strong></div>
                                      <div class="col-3 text-muted mb-2">MONTO SOLICITADO:<br><strong class="text-dark">$28,000.00</strong></div>
                                      <div class="col-3 text-muted mb-2">PLAZO SOLICITADO:<br><strong class="text-dark">200</strong></div>
                                      <div class="col-3 text-muted">SOLICITANTE:<br><strong class="text-dark">CARLOS ALBERTO PEREZ ORTIZ</strong></div>
                                      <div class="col-3 text-muted">MONTO APROBADO:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted">PLAZO APROBADO:<br><strong class="text-dark">-</strong></div>
                                      <div class="col-3 text-muted">CUOTA DE ENTRADA:<br><strong class="text-dark">-</strong></div>
                                    </div>
                                  </div>
                                </div>`;
        content = content.substring(0, endDivIdx + 6) + insert2 + content.substring(endDivIdx + 6);
    }
}

// 3. Preview
const search3 = `<!-- OTROS CONTROLES -->`;
const search3b = `field.controlType !== 'LABEL' && field.controlType !== 'BUTTON'`;
const idx3 = content.lastIndexOf(search3); // The one in preview is later in the file
if (idx3 !== -1) {
    const insert3 = `<!-- RESUMEN_CASO PREVIEW -->
                          <div *ngIf="field.controlType === 'RESUMEN_CASO'" class="border bg-white rounded-3 shadow-sm mt-2 mb-3">
                            <div class="p-2 border-bottom fw-bold text-muted bg-light" style="font-size: 0.85rem;">
                              <i class="bi bi-chevron-up me-1"></i> Información General
                            </div>
                            <div class="p-3">
                              <div class="row" style="font-size: 0.75rem;">
                                <div class="col-3 text-muted mb-2">FECHA CASO:<br><strong class="text-dark">2026-06-22</strong></div>
                                <div class="col-3 text-muted mb-2">NÚMERO CASO:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">CIUDAD:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">AGENCIA:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">ASESOR:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">FECHA SOLICITUD:<br><strong class="text-dark">22/6/2026, 11:32:53 a.m.</strong></div>
                                <div class="col-3 text-muted mb-2">SUBSEGMENTO:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">PRODUCTO:<br><strong class="text-dark">VIP</strong></div>
                                <div class="col-3 text-muted mb-2">DESTINO COMERCIAL:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted mb-2">IDENTIFICACIÓN:<br><strong class="text-dark">1700000014</strong></div>
                                <div class="col-3 text-muted mb-2">MONTO SOLICITADO:<br><strong class="text-dark">$28,000.00</strong></div>
                                <div class="col-3 text-muted mb-2">PLAZO SOLICITADO:<br><strong class="text-dark">200</strong></div>
                                <div class="col-3 text-muted">SOLICITANTE:<br><strong class="text-dark">CARLOS ALBERTO PEREZ ORTIZ</strong></div>
                                <div class="col-3 text-muted">MONTO APROBADO:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted">PLAZO APROBADO:<br><strong class="text-dark">-</strong></div>
                                <div class="col-3 text-muted">CUOTA DE ENTRADA:<br><strong class="text-dark">-</strong></div>
                              </div>
                            </div>
                          </div>

                          `;
    content = content.substring(0, idx3) + insert3 + content.substring(idx3);
    
    // Now modify the field.controlType condition for OTROS CONTROLES
    const conditionIdx = content.indexOf(search3b, idx3 + insert3.length);
    if (conditionIdx !== -1) {
        content = content.substring(0, conditionIdx + search3b.length) + ` && field.controlType !== 'RESUMEN_CASO'` + content.substring(conditionIdx + search3b.length);
    }
}

// 4. Switch case
const search4 = `type = 'LINK';
        break;`;
const insert4 = `
      case 'RESUMEN_CASO':
        label = 'Info General';
        type = 'RESUMEN_CASO';
        break;`;
injectAfter(search4, insert4);

fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
