import re

with open('portal-angular/src/app/features/simulacion/simulacion.html', 'r', encoding='utf-8') as f:
    html = f.read()

tabs_insert = '''
                        <li class="nav-item flex-fill text-center">
                            <a class="nav-link p-2" [class.active]="activeTab === 'financiera'" (click)="activeTab = 'financiera'" style="cursor: pointer; font-size: 0.85rem;">
                                <i class="bi bi-wallet2 text-primary"></i> Situación Financiera 
                            </a>
                        </li>
                        <li class="nav-item flex-fill text-center">
                            <a class="nav-link p-2" [class.active]="activeTab === 'patrimonial'" (click)="activeTab = 'patrimonial'" style="cursor: pointer; font-size: 0.85rem;">
                                <i class="bi bi-building text-primary"></i> Situación Patrimonial
                            </a>
                        </li>
                    </ul>'''

html = html.replace('</ul>', tabs_insert, 1)

content_insert = '''
                        <!-- TAB: SITUACION FINANCIERA -->
                        <div class="tab-pane fade" [class.show]="activeTab === 'financiera'" [class.active]="activeTab === 'financiera'">
                            <div class="p-3">
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <h6 class="text-uppercase text-muted small fw-bold mb-3">Ingresos Mensuales</h6>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Sueldo líquido deudor</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="sueldoLiquidoDeudor" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Sueldo líquido cónyuge</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="sueldoLiquidoConyuge" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Comisiones</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="comisiones" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Ingreso del Negocio</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="ingresoNegocio" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Otros Ingresos</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="otrosIngresos" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <label class="mb-0 text-muted small">Especifique cuales</label>
                                            <input type="text" class="form-control form-control-sm" formControlName="especifiqueIngresos" style="width: 120px;">
                                        </div>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2 mt-3 pt-2 border-top">
                                            <label class="mb-0 fw-bold small">Total ingresos</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" [value]="(simulacionForm.get('sueldoLiquidoDeudor')?.value||0) + (simulacionForm.get('sueldoLiquidoConyuge')?.value||0) + (simulacionForm.get('comisiones')?.value||0) + (simulacionForm.get('ingresoNegocio')?.value||0) + (simulacionForm.get('otrosIngresos')?.value||0)" readonly style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 fw-bold small">Ahorro neto</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" formControlName="ahorroNeto" readonly style="width: 120px;">
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <h6 class="text-uppercase text-muted small fw-bold mb-3">Gastos Mensuales</h6>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Alquiler domicilio</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="alquilerDomicilio" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Alquiler local</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="alquilerLocal" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Alimentación</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="alimentacion" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Educación</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="educacion" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Servicios básicos</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="serviciosBasicos" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Cuota préstamos</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="cuotaMensualPrestamos" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <label class="mb-0 text-muted small">Cuota tarjeta</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="cuotaMensualTarjeta" style="width: 120px;">
                                        </div>

                                        <div class="d-flex justify-content-between align-items-center mb-2 mt-4 pt-2 border-top">
                                            <label class="mb-0 fw-bold small">Total gastos</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" [value]="(simulacionForm.get('alquilerDomicilio')?.value||0) + (simulacionForm.get('alquilerLocal')?.value||0) + (simulacionForm.get('alimentacion')?.value||0) + (simulacionForm.get('educacion')?.value||0) + (simulacionForm.get('serviciosBasicos')?.value||0) + (simulacionForm.get('cuotaMensualPrestamos')?.value||0) + (simulacionForm.get('cuotaMensualTarjeta')?.value||0)" readonly style="width: 120px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: SITUACION PATRIMONIAL -->
                        <div class="tab-pane fade" [class.show]="activeTab === 'patrimonial'" [class.active]="activeTab === 'patrimonial'">
                            <div class="p-3">
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <h6 class="text-uppercase text-muted small fw-bold mb-3">Activos</h6>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Inmuebles</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="inmuebles" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Vehículos</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="vehiculos" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <label class="mb-0 text-muted small">Inversiones</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="inversiones" style="width: 120px;">
                                        </div>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2 mt-4 pt-2 border-top">
                                            <label class="mb-0 fw-bold small">Total activos</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" [value]="(simulacionForm.get('inmuebles')?.value||0) + (simulacionForm.get('vehiculos')?.value||0) + (simulacionForm.get('inversiones')?.value||0)" readonly style="width: 120px;">
                                        </div>

                                        <h6 class="text-uppercase text-primary small fw-bold mb-3 mt-4">Patrimonio</h6>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 fw-bold small">Total Activos - Total Pasivos</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" [value]="((simulacionForm.get('inmuebles')?.value||0) + (simulacionForm.get('vehiculos')?.value||0) + (simulacionForm.get('inversiones')?.value||0)) - ((simulacionForm.get('saldoOtrosCreditos')?.value||0) + (simulacionForm.get('saldoTarjetaCredito')?.value||0) + (simulacionForm.get('otrasDeudas')?.value||0))" readonly style="width: 120px;">
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <h6 class="text-uppercase text-muted small fw-bold mb-3">Pasivos</h6>
                                        
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Otros créditos vigentes</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="saldoOtrosCreditos" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="mb-0 text-muted small">Saldo tarjeta de crédito</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="saldoTarjetaCredito" style="width: 120px;">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <label class="mb-0 text-muted small">Otras deudas</label>
                                            <input type="number" class="form-control form-control-sm text-end" formControlName="otrasDeudas" style="width: 120px;">
                                        </div>

                                        <div class="d-flex justify-content-between align-items-center mb-2 mt-4 pt-2 border-top">
                                            <label class="mb-0 fw-bold small">Total pasivos</label>
                                            <input type="number" class="form-control form-control-sm text-end fw-bold bg-light" [value]="(simulacionForm.get('saldoOtrosCreditos')?.value||0) + (simulacionForm.get('saldoTarjetaCredito')?.value||0) + (simulacionForm.get('otrasDeudas')?.value||0)" readonly style="width: 120px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <button class="btn btn-primary w-100 mt-2 fw-bold py-1 shadow-sm d-flex justify-content-center align-items-center gap-2" (click)="ejecutarAnalisis()">'''

html = html.replace('''                    </div>
                    
                    <button class="btn btn-primary w-100 mt-2 fw-bold py-1 shadow-sm d-flex justify-content-center align-items-center gap-2" (click)="ejecutarAnalisis()">''', content_insert)

with open('portal-angular/src/app/features/simulacion/simulacion.html', 'w', encoding='utf-8') as f:
    f.write(html)
