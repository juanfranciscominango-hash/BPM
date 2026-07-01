import { Component, OnInit, inject, ChangeDetectorRef, DoCheck, KeyValueDiffers } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiManagerService } from '../../../core/services/api-manager.service';
import { ParametricService } from '../../../core/services/parametric.service';
import { MetaService } from '../../../core/services/meta.service';
import { ProcessService } from '../../../core/services/process.service';
import { ScreenService } from '../../../core/services/screen.service';

@Component({
  selector: 'innova-ejecutor-pantallas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejecutor-pantallas.component.html'
})
export class EjecutorPantallasComponent implements OnInit, DoCheck {
  private http = inject(HttpClient);
  private apiManagerService = inject(ApiManagerService);
  private parametricService = inject(ParametricService);
  private metaService = inject(MetaService);
  private processService = inject(ProcessService);
  private screenService = inject(ScreenService);
  private cdr = inject(ChangeDetectorRef);

  
  private differs = inject(KeyValueDiffers);
  private modelDiffer: any;
  dynamicFieldStates: { [key: string]: any } = {};

  ngDoCheck() {
    if (!this.modelDiffer) {
      this.modelDiffer = this.differs.find(this.previewModel).create();
    }
    const changes = this.modelDiffer.diff(this.previewModel);
    if (changes) {
      this.evaluateActions();
    }
  }

  evaluateActions() {
    if (!this.layout || !this.layout.actions || this.layout.actions.length === 0) return;
    
    // Reset states
    this.dynamicFieldStates = {};

    this.layout.actions.forEach((act: any) => {
      if (!act.condition) return;
      let isTrue = false;
      try {
        const check = new Function('data', 'with(data) { return ' + act.condition + '; }');
        isTrue = !!check(this.previewModel);
      } catch (e) {
        isTrue = false;
      }

      const effects = isTrue ? act.thenEffects : act.elseEffects;
      if (effects && Array.isArray(effects)) {
        effects.forEach((eff: any) => {
          if (!eff.target) return;
          if (!this.dynamicFieldStates[eff.target]) {
            this.dynamicFieldStates[eff.target] = {};
          }
          
          if (eff.type === 'visibility') {
            this.dynamicFieldStates[eff.target].visibility = eff.value;
          } else if (eff.type === 'requirement') {
            this.dynamicFieldStates[eff.target].requirement = eff.value;
          } else if (eff.type === 'editability') {
            this.dynamicFieldStates[eff.target].editability = eff.value;
          } else if (eff.type === 'setValue') {
            // Only set if different to avoid loop
            if (this.previewModel[eff.target] != eff.value) {
              this.previewModel[eff.target] = eff.value;
            }
          }
        });
      }
    });
  }

  procesos: any[] = [];
  selectedProcessKey: string = '';
  
  layout: any = null;
  
  previewModel: any = {};
  previewTabIdx: number = 0;
  
  // Sim properties
  simOptions: { [fieldName: string]: any[] } = {};
  simLoadingData = false;
  uploadedMockFiles: { [key: string]: string } = {};
  mockGridData: { [key: string]: any[] } = {};
  
  gridRowsMap: { [key: string]: any[] } = {};
  gridModalField: any = null;
  gridNewRow: any = {};
  gridColumnsLoading = false;

  physicalColumnsMap: { [entityId: number]: any[] } = {};

  simSubmitted = false;
  simNotification = '';
  simNotificationType: 'success'|'warning'|'error' = 'success';
  simSubmitNotification: {type: 'success'|'error', msg: string} | null = null;
  currentScreenName: string = '';

  getPreviewModelJson(): string {
    return JSON.stringify(this.previewModel, null, 2);
  }

  simTotalFields(): number {
    let count = 0;
    if (!this.layout || !this.layout.tabs) return 0;
    this.layout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        if (sec.fields) count += sec.fields.length;
      });
    });
    return count;
  }

  getSimGridDisplayValue(col: any, value: any): string {
    return this.formatGridValue(col, value);
  }

  confirmGridRow(field: any) {
    this.saveGridRow();
  }

  ngOnInit() {
    this.processService.getProcesses().subscribe(data => {
      this.procesos = data || [];
    });
  }

  onProcessChange() {
    this.layout = null;
    if (!this.selectedProcessKey) return;
    
    this.screenService.getScreensByProcess(this.selectedProcessKey).subscribe(screens => {
      if (screens && screens.length > 0) {
        const data = screens[0];
        if (data && data.layoutJson) {
          this.currentScreenName = data.name;
          this.layout = typeof data.layoutJson === 'string' ? JSON.parse(data.layoutJson) : data.layoutJson;
          this.activarPreview();
        } else {
          alert('Este proceso no tiene un diseño de pantalla guardado.');
        }
      } else {
        alert('Este proceso no tiene un diseño de pantalla guardado.');
      }
    });
  }

  // --- PREVIEW METHODS ---
  activarPreview() {
    this.previewTabIdx = 0;
    this.previewModel = {};
    this.uploadedMockFiles = {};
    this.mockGridData = {};
    this.gridRowsMap = {};
    this.gridModalField = null;
    this.gridNewRow = {};
    this.simSubmitted = false;
    this.simNotification = '';
    this.simOptions = {};

    // Fill defaults
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.name && f.defaultValue) {
              const defVal = String(f.defaultValue).trim().toUpperCase();
              if (defVal === 'HOY' || defVal === '{HOY}' || defVal === 'TODAY' || defVal === '{TODAY}') {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                this.previewModel[f.name] = `${yyyy}-${mm}-${dd}`;
              } else if (defVal === '{SEQ}' || defVal === '{SECUENCIAL}') {
                let prefix = 'SEQ';
                if (this.selectedProcessKey) {
                  prefix = this.selectedProcessKey.split(/[-_]/).map(w => w.charAt(0).toUpperCase()).join('').substring(0, 3);
                }
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yy = String(today.getFullYear());
                const h = String(today.getHours()).padStart(2, '0');
                const m = String(today.getMinutes()).padStart(2, '0');
                const s = String(today.getSeconds()).padStart(2, '0');
                this.previewModel[f.name] = `${prefix}${dd}${mm}${yy}${h}${m}${s}`;
              } else {
                this.previewModel[f.name] = f.defaultValue;
              }
            }
          });
        });
      });
    }

    // Load real parametric data for COMBO fields
    this.simLoadingData = true;
    const comboFields: {name: string, entityId?: any, apiToExecute?: string}[] = [];
    
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.controlType === 'COMBO') {
              if (f.config?.options) {
                this.simOptions[f.name] = f.config.options;
              } else if (f.config?.apiToExecute) {
                comboFields.push({ name: f.name, apiToExecute: f.config.apiToExecute });
              } else if (f.config?.dataSourceEntityId) {
                comboFields.push({ name: f.name, entityId: f.config.dataSourceEntityId });
              }
            } else if (f.controlType === 'GRID') {
              const cols = this.getGridColumns(f);
              cols.forEach((col: any) => {
                if (this.getColInputType(col) === 'combo' && col.parametricTableId) {
                  comboFields.push({ name: col.name, entityId: col.parametricTableId });
                }
              });
            }
          });
        });
      });
    }

    let pending = comboFields.length;
    if (pending === 0) {
      this.simLoadingData = false;
    } else {
      comboFields.forEach(info => {
        if (info.entityId) {
          this.parametricService.getTableData(Number(info.entityId)).subscribe({
            next: (data) => {
              this.simOptions[info.name] = data;
              pending--;
              if (pending <= 0) this.simLoadingData = false;
              this.cdr.detectChanges();
            },
            error: () => {
              pending--;
              if (pending <= 0) this.simLoadingData = false;
            }
          });
        } else if (info.apiToExecute) {
          // If apiToExecute is a URL, use HTTP GET directly
          if (info.apiToExecute.startsWith('/') || info.apiToExecute.startsWith('http')) {
            this.http.get(info.apiToExecute).subscribe({
              next: (data: any) => {
                if (Array.isArray(data)) {
                  this.simOptions[info.name] = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                  this.simOptions[info.name] = data.data;
                } else if (data && data.value && Array.isArray(data.value)) {
                  this.simOptions[info.name] = data.value;
                }
                pending--;
                if (pending <= 0) this.simLoadingData = false;
                this.cdr.detectChanges();
              },
              error: () => {
                pending--;
                if (pending <= 0) this.simLoadingData = false;
              }
            });
          } else {
            this.apiManagerService.testApi(info.apiToExecute, {}).subscribe({
              next: (data: any) => {
                if (Array.isArray(data)) {
                  this.simOptions[info.name] = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                  this.simOptions[info.name] = data.data;
                } else if (data && data.value && Array.isArray(data.value)) {
                  this.simOptions[info.name] = data.value;
                }
                pending--;
                if (pending <= 0) this.simLoadingData = false;
                this.cdr.detectChanges();
              },
              error: () => {
                pending--;
                if (pending <= 0) this.simLoadingData = false;
              }
            });
          }
        } else {
          pending--;
          if (pending <= 0) this.simLoadingData = false;
        }
      });
    }
  }

  
  
  isFieldDisabled(field: any): boolean {
    if (this.dynamicFieldStates && this.dynamicFieldStates[field.name]) {
      if (this.dynamicFieldStates[field.name].editability !== undefined) {
        return !this.dynamicFieldStates[field.name].editability; // if editable is true, disabled is false
      }
    }
    if (field.config?.editableIf) {
      return !this.evaluateVisibilityRule(field.config.editableIf);
    }
    return !!field.readOnly;
  }


  evaluateVisibilityRule(rule: string): boolean {
    if (!rule || !rule.trim()) return true;
    try {
      const keys = Object.keys(this.previewModel);
      const values = Object.values(this.previewModel);
      const fn = new Function(...keys, `return ${rule};`);
      return !!fn(...values);
    } catch (e) {
      return true;
    }
  }

  // Same logic as in designer
    getGridColumns(field: any): any[] {
    const selected: any[] = field?.config?.selectedColumns;
    const id = Number(field?.config?.dataSourceEntityId);

    let physicalCols: any[] = [];
    if (!isNaN(id) && id > 0) {
      if (this.physicalColumnsMap[id] === undefined || this.physicalColumnsMap[id] === null) {
        this.physicalColumnsMap[id] = [];
        this.metaService.listarAtributos(id).subscribe(data => {
          const mapped = data.map((a: any) => ({
            name: a.name, type: a.type, label: a.label || a.name, parametricTableId: a.parametricTableId
          }));
          this.physicalColumnsMap[id] = mapped;
          this.cdr.detectChanges();
        });
      }
      physicalCols = this.physicalColumnsMap[id] || [];
    }

    if (selected && selected.length > 0) {
      const physicalState = physicalCols ? physicalCols.length : 0;
      const visibilityHash = selected.map((c: any) => c.visibilityRule ? (this.evaluateVisibilityRule(c.visibilityRule) ? '1' : '0') : '1').join('-') + "_" + physicalState;
      
      if (field._cachedVisibilityHash !== visibilityHash) {
        field._cachedVisibilityHash = visibilityHash;
        field._cachedVisibleColumns = selected.filter((c: any) => !c.visibilityRule || this.evaluateVisibilityRule(c.visibilityRule))
          .map((c: any) => {
            const pcol = physicalCols.find((pc: any) => pc.name === c.name);
            return {
              name: c.name,
              type: pcol ? pcol.type : c.type,
              label: c.label || c.name,
              parametricTableId: pcol ? pcol.parametricTableId : c.parametricTableId,
              displayField: c.displayField,
              visibilityRule: c.visibilityRule,
              options: c.options
            };
          });
      }
      return field._cachedVisibleColumns || [];
    }

    return physicalCols;
  }

  getColInputType(col: {name: string; type: string; parametricTableId?: number}): string {
    const t = (col.type || '').toLowerCase();
    if (t.includes('parametrica') || col.parametricTableId) return 'combo';
    if (t.includes('int') || t.includes('numeric') || t.includes('float')) return 'number';
    if (t.includes('date') || t.includes('timestamp')) return 'date';
    if (t.includes('bool')) return 'boolean';
    return 'text';
  }

  getGridRows(fieldName: string): any[] {
    if (!this.gridRowsMap[fieldName]) {
      this.gridRowsMap[fieldName] = [];
    }
    return this.gridRowsMap[fieldName];
  }

  addGridRow(fieldName: string, row: any) {
    if (!this.gridRowsMap[fieldName]) this.gridRowsMap[fieldName] = [];
    this.gridRowsMap[fieldName].push({ ...row });
  }

  removeGridRow(fieldName: string, index: number) {
    if (this.gridRowsMap[fieldName]) {
      this.gridRowsMap[fieldName].splice(index, 1);
    }
  }

  formatGridValue(col: any, value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (this.getColInputType(col) === 'combo') {
      const options = this.getSimOptions(col.name);
      if (options && options.length > 0) {
        const opt = options.find((o: any) => String(o.codigo || o.id || o.code) === String(value));
        if (opt) {
          if (col.displayField && opt[col.displayField] !== undefined) {
            return opt[col.displayField];
          }
          return opt.descripcion || opt.nombre || opt.label || value;
        }
      }
    }
    if (this.getColInputType(col) === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return value;
  }

  openGridModal(field: any) {
    this.gridModalField = field;
    this.gridNewRow = {};
    this.getGridColumns(field).forEach(col => {
      if (col.type === 'BOOLEAN' || col.type === 'boolean') {
        this.gridNewRow[col.name] = false;
      }
    });
  }

  closeGridModal() {
    this.gridModalField = null;
    this.gridNewRow = {};
  }

  saveGridRow() {
    if (!this.gridModalField) return;
    this.addGridRow(this.gridModalField.name, this.gridNewRow);
    this.closeGridModal();
  }

  
  previewVisible(field: any): boolean {
    if (this.dynamicFieldStates && this.dynamicFieldStates[field.name]) {
      if (this.dynamicFieldStates[field.name].visibility !== undefined) {
        return this.dynamicFieldStates[field.name].visibility;
      }
    }
    if (!field.visibleIf) return true;
    try {
      const check = new Function('data', 'with(data) { return ' + field.visibleIf + ' }');
      return check(this.previewModel);
    } catch (e) {
      return true; 
    }
  }


  uploadMock(fieldName: string) {
    this.uploadedMockFiles[fieldName] = 'archivo_prueba.pdf';
    this.previewModel[fieldName] = 'ID_DOC_MOCK_123';
  }

  simButtonAction(field: any) {
    const action = field.config?.buttonAction;
    if (action === 'SUBMIT') {
      this.simSubmit();
    } else if (action === 'SAVE') {
      this.simNotificationType = 'success';
      this.simNotification = 'Datos guardados';
      setTimeout(() => this.simNotification = '', 3000);
    } else if (action === 'RESET') {
      this.simReset();
    } else if (action === 'CUSTOM') {
      const apiToExecute = field.config?.apiToExecute;
      if (!apiToExecute) {
        this.simNotification = 'Botón CUSTOM clicado (Sin API configurada)';
        setTimeout(() => this.simNotification = '', 3000);
        return;
      }

      this.simNotification = `Ejecutando API: ${apiToExecute}...`;

      if (apiToExecute === 'APICLI') {
         let prefix = '';
         if (field.name.startsWith('codeudor_')) prefix = 'codeudor_';
         else if (field.name.startsWith('conyuge_')) prefix = 'conyuge_';
         else if (field.name.startsWith('apoderado_')) prefix = 'apoderado_';

         this.previewModel['interviniente_int_identificacion'] = this.previewModel[prefix + 'identificacion'];
      }

      this.apiManagerService.testApi(apiToExecute, this.previewModel).subscribe({
        next: (res) => {
          this.simNotification = `Éxito API: ${JSON.stringify(res).substring(0, 50)}...`;
          if (res && typeof res === 'object') {
            let prefix = '';
            if (field.name.startsWith('codeudor_')) prefix = 'codeudor_';
            else if (field.name.startsWith('conyuge_')) prefix = 'conyuge_';
            else if (field.name.startsWith('apoderado_')) prefix = 'apoderado_';

            const prefixedRes: any = {};
            for (let key in res) {
               let val = res[key];
               if (val === 'true') val = true;
               if (val === 'false') val = false;
               prefixedRes[prefix + key] = val;
            }
            
            const preserveTipoId = this.previewModel[prefix + 'tipo_identificacion'];
            const preserveId = this.previewModel[prefix + 'identificacion'];
            
            Object.assign(this.previewModel, prefixedRes);

            // Map arrays to gridRowsMap for GRID mapping
            for (const key in prefixedRes) {
                if (Array.isArray(prefixedRes[key])) {
                    this.gridRowsMap[key] = [...prefixedRes[key]];
                }
            }
            
            if (preserveTipoId) {
                this.previewModel[prefix + 'tipo_identificacion'] = preserveTipoId;
            } else {
                let rawTipoId = this.previewModel[prefix + 'tipo_identificacion'];
                if (rawTipoId === 'C' || rawTipoId === 'CEDULA') this.previewModel[prefix + 'tipo_identificacion'] = 'CEDULA';
                else if (rawTipoId === 'R' || rawTipoId === 'RUC') this.previewModel[prefix + 'tipo_identificacion'] = 'RUC';
                else if (rawTipoId === 'P' || rawTipoId === 'PASAPORTE') this.previewModel[prefix + 'tipo_identificacion'] = 'PASAPORTE';
            }
            if (preserveId) {
                this.previewModel[prefix + 'identificacion'] = preserveId;
            }
            
            // Regla de Negocio: Si el estado civil es CASADO o UNIÓN LIBRE, tiene_conyuge = true
            const estadoCivilKey = prefix === '' ? 'estado_civil_solicitante' : prefix + 'estado_civil';
            const tieneConyugeKey = prefix === '' ? 'tiene_conyuge' : prefix + 'tiene_conyuge';
            
            // A veces la API devuelve estado_civil_solicitante o interviniente_int_estado_civil
            let estadoCivilVal = this.previewModel[estadoCivilKey] || this.previewModel[prefix + 'interviniente_int_estado_civil'] || this.previewModel['estado_civil_solicitante'];
            
            console.log('--- DEBUG APICLI ---');
            console.log('estadoCivilKey:', estadoCivilKey);
            console.log('tieneConyugeKey:', tieneConyugeKey);
            console.log('estadoCivilVal:', estadoCivilVal);
            console.log('prefixedRes:', prefixedRes);
            console.log('previewModel.tipo_identificacion:', this.previewModel['tipo_identificacion']);
            
            if (estadoCivilVal) {
                const upper = String(estadoCivilVal).toUpperCase();
                console.log('estadoCivilVal upper:', upper);
                this.previewModel[prefix + 'estado_civil'] = upper; // Map directly to field
                if (upper === 'CASADO' || upper === 'UNIÓN LIBRE' || upper === 'UNION LIBRE') {
                    console.log('Forcing tiene_conyuge = true');
                    this.previewModel[tieneConyugeKey] = true;
                }
            }

            // LOGICA PARA HABILITAR / DESHABILITAR SECCION SEGUN LA DATA
            const apiFailed = res.mensaje && res.mensaje.includes('no encontrado');
            if (this.layout && this.layout.tabs) {
              for (const tab of this.layout.tabs) {
                for (const section of tab.sections) {
                  if (section.fields.includes(field)) {
                    section.fields.forEach((f: any) => {
                       // Do not disable the consult button or the ID inputs
                       if (f !== field && f.name !== (prefix + 'tipo_identificacion') && f.name !== (prefix + 'identificacion')) {
                          f.readOnly = !apiFailed;
                       }
                    });
                    this.simNotification = apiFailed 
                      ? 'API no encontró datos. Se habilitó la edición de los campos.'
                      : 'Datos cargados. Campos bloqueados para edición.';
                  }
                }
              }
            }
            
            // Forzar actualización de la vista para asegurar que se muestre el estado civil
            this.cdr.detectChanges();
          }
          setTimeout(() => {
             this.simNotification = '';
             this.cdr.detectChanges();
          }, 4000);
        },
        error: (err) => {
          this.simNotification = `Error API: ${err.message}`;
          setTimeout(() => this.simNotification = '', 3000);
        }
      });
    } else {
      this.simNotification = `Acción desconocida: ${action}`;
      setTimeout(() => this.simNotification = '', 3000);
    }
  }

  simSubmit() {
    const valErrors = this.simGetValidationErrors();
    if (valErrors.length > 0) {
      this.simNotificationType = 'warning';
      this.simNotification = 'Errores: ' + valErrors.join(', ');
      setTimeout(() => this.simNotification = '', 8000);
      return;
    }
    this.simSubmitted = true;
    this.simNotification = 'Formulario enviado con éxito (Simulación).';
    setTimeout(() => {
      this.simSubmitted = false;
      this.simNotification = '';
    }, 4000);
  }

  simReset() {
    this.previewModel = {};
    this.gridRowsMap = {};
    this.uploadedMockFiles = {};
    this.simNotification = 'Formulario reiniciado.';
    setTimeout(() => this.simNotification = '', 3000);
  }

  simGetValidationErrors(): string[] {
    const errors: string[] = [];
    if (!this.layout || !this.layout.tabs) return errors;
    this.layout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        sec.fields.forEach((f: any) => {
          if (this.previewVisible(f)) {
            let isReq = f.required;
            if (this.dynamicFieldStates && this.dynamicFieldStates[f.name] && this.dynamicFieldStates[f.name].requirement !== undefined) {
              isReq = this.dynamicFieldStates[f.name].requirement;
            }
            if (isReq) {
              const val = this.previewModel[f.name];
              if (val === null || val === undefined || val === '') {
                errors.push(`El campo "${f.label || f.name}" es requerido.`);
              }
            }
          }
        });
      });
    });
    
    // Validaciones personalizadas estilo Bizagi
    if (this.layout.validations && Array.isArray(this.layout.validations)) {
      this.layout.validations.forEach((val: any) => {
        if (val.condition && val.condition.trim() !== '') {
          try {
            const check = new Function('data', 'with(data) { return ' + val.condition + '; }');
            const isInvalid = check(this.previewModel);
            if (isInvalid) {
              errors.push(val.message || 'Error en validación: ' + val.name);
            }
          } catch (e) {
            console.error('Error evaluando validación:', val.name, e);
          }
        }
      });
    }

    return errors;
  }

  getSimOptions(fieldName: string): any[] {
    if (!this.simOptions[fieldName]) {
      this.simOptions[fieldName] = [];
    }
    return this.simOptions[fieldName];
  }

  onSimComboChange(field: any) {
    if (!field.config || !field.config.cascadeRules) return;
    const rules = field.config.cascadeRules;
    const val = this.previewModel[field.name];
    if (val) {
      const options = this.getSimOptions(field.name);
      if (options && options.length > 0) {
        const valField = field.config?.valueField;
        const selectedRecord = options.find((o: any) => {
          const optVal = valField ? o[valField] : (o.codigo || o.id || o.code);
          return String(optVal) === String(val);
        });
        
        if (!selectedRecord) return;

        let modelChanged = false;
        rules.forEach((rule: any) => {
          if (rule.sourceColumn && rule.targetField) {
            const sourceVal = selectedRecord[rule.sourceColumn];
            if (sourceVal !== undefined) {
              this.previewModel[rule.targetField] = String(sourceVal);
              modelChanged = true;
            }
          }
        });

        if (modelChanged) {
          this.previewModel = { ...this.previewModel };
        }
      }
    }
  }
}
