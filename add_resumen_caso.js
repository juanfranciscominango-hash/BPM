const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add to sidebar
const sidebarTarget = `                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('SIMULADOR')">
                      <i class="bi bi-calculator-fill fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Simulador</span>
                    </button>
                  </div>`;
const sidebarReplacement = sidebarTarget + `
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('RESUMEN_CASO')">
                      <i class="bi bi-file-earmark-person fs-5 mb-1 text-secondary"></i>
                      <span class="lbl-ctrl">Info General</span>
                    </button>
                  </div>`;
content = content.replace(sidebarTarget, sidebarReplacement);

// 2. Add to Canvas Editor
const canvasTarget = `               <!-- SIMULADOR -->
               <div *ngIf="field.controlType === 'SIMULADOR'" class="border p-4 bg-primary bg-opacity-10 text-center rounded-3 shadow-sm border-primary">
                 <i class="bi bi-calculator-fill fs-2 text-primary mb-2"></i>
                 <h6 class="text-primary fw-bold mb-0">Componente Interactivo: Simulador de Crédito</h6>
                 <small class="text-muted">Se renderizará el módulo completo de simulación en este espacio.</small>
               </div>`;
const canvasReplacement = canvasTarget + `

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
content = content.replace(canvasTarget, canvasReplacement);

// 3. Add to preview mode
const previewTarget = `                          <!-- OTROS CONTROLES -->
                          <div *ngIf="field.controlType !== 'LABEL' && field.controlType !== 'BUTTON'">`;
const previewReplacement = `                          <!-- RESUMEN_CASO PREVIEW -->
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

                          <!-- OTROS CONTROLES -->
                          <div *ngIf="field.controlType !== 'LABEL' && field.controlType !== 'BUTTON' && field.controlType !== 'RESUMEN_CASO'">`;
content = content.replace(previewTarget, previewReplacement);

// 4. Add to addGenericControl switch case
const switchTarget = `      case 'LINK':
        label = \`Enlace \${count}\`;
        type = 'LINK';
        break;`;
const switchReplacement = switchTarget + `
      case 'RESUMEN_CASO':
        label = \`Información General\`;
        type = 'RESUMEN_CASO';
        break;`;
content = content.replace(switchTarget, switchReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
