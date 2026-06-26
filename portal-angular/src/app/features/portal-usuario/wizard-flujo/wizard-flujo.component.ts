import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiManagerService } from '../../../core/services/api-manager.service';
import { ParametricService } from '../../../core/services/parametric.service';
import { MetaService } from '../../../core/services/meta.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService, UserTask } from '../../../core/services/task.service';
import { ProcessService } from '../../../core/services/process.service';
import { ScreenService } from '../../../core/services/screen.service';
import { SimulacionComponent } from '../../simulacion/simulacion.component';
import { AnalisisCreditoComponent } from '../../analisis-credito/analisis-credito.component';
import { FormulasUtil } from '../../../core/utils/formulas.util';

@Component({
  selector: 'app-wizard-flujo',
  standalone: true,
  imports: [CommonModule, FormsModule, SimulacionComponent, AnalisisCreditoComponent],
  templateUrl: './wizard-flujo.component.html'
})
export class WizardFlujoComponent implements OnInit {
  private readonly _emptyArray: any[] = [];
  private http = inject(HttpClient);
  private apiManagerService = inject(ApiManagerService);
  private parametricService = inject(ParametricService);
  private metaService = inject(MetaService);
  private processService = inject(ProcessService);
  private screenService = inject(ScreenService);
  private cdr = inject(ChangeDetectorRef);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentTask: UserTask | null = null;
  taskId: string | null = null;
  isSubmitting = false;

  procesos: any[] = [];
  selectedProcessKey: string = '';
  taskVariables: any = {};
  
  layout: any = null;
  
  previewModel: any = {};
  previewTabIdx: number = 0;
  
  // Sim properties
  simOptions: { [fieldName: string]: any[] } = {};
  simLoadingData = false;
  uploadedMockFiles: { [key: string]: string } = {};
  mockGridData: { [key: string]: any[] } = {};
  
  gridRowsMap: { [key: string]: any[] } = {};
  gridCurrentPageMap: { [key: string]: number } = {};
  gridModalField: any = null;
  gridNewRow: any = {};
  gridEditIndex: number = -1;
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

  onSimulacionDataChange(data: any) {
    if (data) {
      // Guardar los datos en el previewModel para que sean enviados en simSubmit()
      this.previewModel = { ...this.previewModel, ...data };
    }
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


  availableProcesses: any[] = [];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.taskId = params.get('id');
      if (this.taskId) {
        this.cargarTarea(this.taskId);
      } else {
        // Load available processes to start
        this.processService.getProcesses().subscribe((procs: any[]) => {
          this.availableProcesses = procs.filter(p => p.status === 'DEPLOYED' || p.deploymentId);
          // If no status is checked, maybe just show all for now
          if(this.availableProcesses.length === 0) this.availableProcesses = procs;
        });
      }
    });
  }

  startProcess(processKey: string) {
    this.processService.startInstance(processKey, {}).subscribe({
      next: () => {
        alert('Proceso iniciado correctamente.');
        this.router.navigate(['/portal/bandeja']);
      },
      error: (err) => {
        console.error('Error al iniciar proceso:', err);
        alert('No se pudo iniciar el proceso.');
      }
    });
  }

  cargarTarea(id: string) {
    this.taskService.getTasks().subscribe((tasks: UserTask[]) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        this.currentTask = task;
        
        this.taskService.getTaskVariables(task.id).subscribe({
          next: (vars: any) => {
            this.taskVariables = vars || {};
            (this as any).debugVarsLoaded = 'Yes';
            
            this.processService.getProcesses().subscribe({
              next: (procs: any[]) => {
              (this as any).debugProcsLength = procs ? procs.length : 0;
              (this as any).debugProcsKeys = procs ? procs.map((p:any) => p.key).join(', ') : 'none';
              
              const taskKeyBase = task.processDefinitionId ? task.processDefinitionId.split(':')[0].trim().toLowerCase() : '';
              const procDef = procs.find(p => 
                  String(p.id) === String(task.processDefinitionId) || 
                  (p.key && p.key.trim().toLowerCase() === taskKeyBase) ||
                  (p.procDefId && p.procDefId === task.processDefinitionId)
              );
              
              if(procDef) {
                  this.selectedProcessKey = procDef.key;
                  this.screenService.getScreensByProcess(procDef.key).subscribe((screens: any[]) => {
                      if (screens && screens.length > 0) {
                          let screen = screens.find((s:any) => s.taskKey === task.taskDefinitionKey);
                          if (!screen) {
                              screen = screens.find((s:any) => s.taskKey === task.name);
                          }
                          if (screen && screen.layoutJson) {
                              this.currentScreenName = screen.name;
                              this.layout = typeof screen.layoutJson === 'string' ? JSON.parse(screen.layoutJson) : screen.layoutJson;
                              this.activarPreview();
                          } else {
                              this.currentScreenName = task.name;
                              this.layout = { tabs: [] }; // Vacío para que muestre "No hay controles diseñados"
                              this.activarPreview();
                          }
                      } else {
                          this.currentScreenName = task.name;
                          this.layout = { tabs: [] };
                          this.activarPreview();
                      }
                  });
              } else {
                  (this as any).debugError = 'procDef no encontrado';
              }
            },
            error: (err) => {
              (this as any).debugError = 'Error cargando procesos: ' + err.message;
            }
          });
        },
        error: (err) => {
          (this as any).debugError = 'Error cargando variables: ' + err.message;
        }
      });
    }
  });
}

  // --- PREVIEW METHODS ---
  activarPreview() {
    this.previewTabIdx = 0;
    // Precargar con las variables que vinieron del proceso
    this.previewModel = { ...this.taskVariables };
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

    if (this.taskId) {
      this.taskService.getTaskVariables(this.taskId).subscribe({
        next: (vars) => {
          if (vars) {
            // Flowable devuelve un mapa con las variables, se mezclan con previewModel
            // si la variable no es nula.
              for (const key in vars) {
                if (vars[key] !== null && vars[key] !== undefined) {
                  this.previewModel[key] = vars[key];
                  if (Array.isArray(vars[key])) {
                    this.gridRowsMap[key] = [...vars[key]];
                  } else if (typeof vars[key] === 'string' && (vars[key].startsWith('[') || vars[key].startsWith('{'))) {
                    try {
                      const parsed = JSON.parse(vars[key]);
                      if (Array.isArray(parsed)) {
                        this.gridRowsMap[key] = parsed;
                        this.previewModel[key] = parsed;
                        // Map arrays to their base names in case grids are named 'ingresos' or 'deudas'
                        if (key === 'ingresos_array') this.gridRowsMap['ingresos'] = parsed;
                        if (key === 'deudas_array') this.gridRowsMap['deudas'] = parsed;
                      }
                    } catch(e) {}
                  }
                }
              }

            // Auto-populate _analisis variables with original values if they don't exist yet or are empty
            for (const key in vars) {
              if (vars[key] !== null && vars[key] !== undefined && !key.endsWith('_analisis')) {
                const analisisKey = key + '_analisis';
                const currentVal = this.previewModel[analisisKey];
                
                const isEmpty = currentVal === undefined || 
                                currentVal === null || 
                                currentVal === '' || 
                                currentVal === '[]' || 
                                (Array.isArray(currentVal) && currentVal.length === 0);

                if (isEmpty) {
                  this.previewModel[analisisKey] = vars[key];
                  if (Array.isArray(vars[key])) {
                    this.gridRowsMap[analisisKey] = [...vars[key]];
                  } else if (typeof vars[key] === 'string' && (vars[key].startsWith('[') || vars[key].startsWith('{'))) {
                    try {
                      const parsed = JSON.parse(vars[key]);
                        if (Array.isArray(parsed)) {
                          this.gridRowsMap[analisisKey] = parsed;
                          this.previewModel[analisisKey] = parsed; // optional, but keeps consistency
                          
                          if (analisisKey === 'ingresos_array_analisis') this.gridRowsMap['ingresos_analisis'] = parsed;
                          if (analisisKey === 'deudas_array_analisis') this.gridRowsMap['deudas_analisis'] = parsed;
                        }
                    } catch(e) {}
                  }
                }
              }
            }
            
            // Lógica para Requisitos Parametrizados
            if (this.currentTask && (this.currentTask.taskDefinitionKey === 'Task_2' || this.currentTask.name.includes('Validar Requisitos'))) {
              if (!this.gridRowsMap['requisitos_array'] || this.gridRowsMap['requisitos_array'].length === 0) {
                this.parametricService.getTables().subscribe(tables => {
                  const reqTable = tables.find(t => t.name === 'requisitos');
                  if (reqTable && reqTable.id) {
                    this.parametricService.getTableData(reqTable.id).subscribe(data => {
                        const tipoId = this.taskVariables['tipo_credito_id'];
                        const prod = String(this.taskVariables['producto_credito'] || this.taskVariables['producto'] || '').trim();
                        
                        const applyFilter = (tId: string) => {
                           let filtered = data;
                           if (tId && tId !== 'undefined') {
                              filtered = data.filter((d:any) => {
                                 if (!d.tipo_credito) return false;
                                 const tipos = String(d.tipo_credito).split(',').map(s => s.trim());
                                 return tipos.includes(tId);
                              });
                           }
                           if (filtered.length === 0) filtered = data; // Fallback
                           this.gridRowsMap['requisitos_array'] = filtered.map(d => ({ ...d, revisado: false }));
                           this.cdr.detectChanges();
                        };

                        if (tipoId) {
                           applyFilter(String(tipoId).trim());
                        } else if (prod && prod !== 'undefined') {
                           // Fallback para casos antiguos que no tienen tipo_credito_id
                           this.parametricService.getTableData(16).subscribe((productos: any) => {
                               const productosArr = Array.isArray(productos) ? productos : (productos.value || []);
                               const prodSeleccionado = productosArr.find((p:any) => String(p.id) === prod || String(p.codigo) === prod);
                               if (prodSeleccionado && prodSeleccionado.pro_cre_tipo_credito) {
                                   applyFilter(String(prodSeleccionado.pro_cre_tipo_credito).trim());
                               } else {
                                   applyFilter('');
                               }
                           });
                        } else {
                           applyFilter('');
                        }
                    });
                  }
                });
              }
            }
            
            this.cdr.detectChanges();
          }
        }
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
                this.autoMapComboValue(f.name, f.config.options);
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
            next: (data: any) => {
              if (Array.isArray(data)) {
                this.simOptions[info.name] = data;
              } else if (data && data.data && Array.isArray(data.data)) {
                this.simOptions[info.name] = data.data;
              } else if (data && data.value && Array.isArray(data.value)) {
                this.simOptions[info.name] = data.value;
              } else {
                this.simOptions[info.name] = [];
              }
              
              // NEW: Auto map by description if code doesn't match
              const currentVal = this.previewModel[info.name];
              if (currentVal && this.simOptions[info.name].length > 0) {
                 const opts = this.simOptions[info.name];
                 const exactMatch = opts.find((opt:any) => String(opt.codigo) === String(currentVal) || String(opt.id) === String(currentVal) || String(opt.code) === String(currentVal));
                 if (!exactMatch) {
                    const matchByDesc = opts.find((opt:any) => opt.descripcion === currentVal || opt.nombre === currentVal || opt.label === currentVal || opt.name === currentVal);
                    if (matchByDesc) {
                       this.previewModel[info.name] = matchByDesc.codigo || matchByDesc.id || matchByDesc.code;
                    }
                 }
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

  
  evaluateVisibilityRule(rule: string): boolean {
    if (!rule || !rule.trim()) return true;
    try {
      const evalModel = { ...this.previewModel };
      
      // Convert combo IDs back to labels for rule evaluation
      for (let key in evalModel) {
         if (this.simOptions[key] && this.simOptions[key].length > 0) {
            const opt = this.simOptions[key].find((o: any) => String(o.codigo || o.id || o.code) === String(evalModel[key]));
            if (opt) {
               evalModel[key] = String(opt.descripcion || opt.nombre || opt.label || opt.valor || evalModel[key]);
            }
         }
      }

      const keysToEnsure = ['estado_civil', 'separacion_bienes', 'requiere_codeudor', 'tiene_conyuge'];
      for (const k of keysToEnsure) {
         if (!(k in evalModel)) evalModel[k] = '';
      }

      const keys = Object.keys(evalModel);
      const values = Object.values(evalModel);
      const fn = new Function(...keys, `return ${rule};`);
      return !!fn(...values);
    } catch (e) {
      return true;
    }
  }

  // Same logic as in designer
    getGridColumns(field: any): any[] {
    if (!field) return this._emptyArray;
    try {
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
        let visibilityHash = '';
        try {
          visibilityHash = selected.map((c: any) => c.visibilityRule ? (this.evaluateVisibilityRule(c.visibilityRule) ? '1' : '0') : '1').join('-') + "_" + physicalState;
        } catch (e) {
          visibilityHash = 'error';
        }
        
        if (field._cachedVisibilityHash !== visibilityHash) {
          field._cachedVisibilityHash = visibilityHash;
          field._cachedVisibleColumns = selected.filter((c: any) => !c.visibilityRule || this.evaluateVisibilityRule(c.visibilityRule))
            .map((c: any) => {
              const pcol = physicalCols.find((pc: any) => pc.name === c.name);
              let paramId = pcol && pcol.parametricTableId ? pcol.parametricTableId : c.parametricTableId;
              if (!paramId) {
                if (c.name === 'producto_credito') paramId = 16;
                else if (c.name === 'tipo_credito') paramId = 9;
              }
              return {
                name: c.name,
                type: pcol && pcol.type ? pcol.type : c.type,
                label: c.label || c.name,
                parametricTableId: paramId,
                displayField: c.displayField,
                visibilityRule: c.visibilityRule,
                options: c.options
              };
            });
        }
        return field._cachedVisibleColumns || this._emptyArray;
      }

      // If no selected columns but we have physical cols, cache them to avoid returning new array
      if (physicalCols && physicalCols.length > 0) {
        if (field._cachedPhysicalCols !== physicalCols) {
          field._cachedPhysicalCols = physicalCols;
        }
        return field._cachedPhysicalCols;
      }
      return this._emptyArray;
    } catch (e) {
      console.error("Error in getGridColumns:", e, field);
      return this._emptyArray;
    }
  }

  getColInputType(col: {name: string; type: string; parametricTableId?: number}): string {
    if (col.type === 'date') return 'date';
    if (col.type === 'boolean' || col.type === 'BOOLEAN') return 'boolean';
    if (col.type === 'combo' || col.parametricTableId) return 'combo';
    if (col.name === 'producto_credito' || col.name === 'tipo_credito') return 'combo';
    const t = (col.type || '').toLowerCase();
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

  private _cachedPaginatedRows: { [fieldName: string]: { hash: string; rows: any[] } } = {};

  getPaginatedGridRows(fieldName: string): any[] {
    const rows = this.getGridRows(fieldName);
    const page = this.gridCurrentPageMap[fieldName] || 1;
    const pageSize = 7;
    const start = (page - 1) * pageSize;
    
    // Hash relies on array reference and length + page
    const currentHash = page + "_" + rows.length;
    if (!this._cachedPaginatedRows[fieldName] || this._cachedPaginatedRows[fieldName].hash !== currentHash) {
      this._cachedPaginatedRows[fieldName] = {
        hash: currentHash,
        rows: rows.slice(start, start + pageSize)
      };
    }
    return this._cachedPaginatedRows[fieldName].rows;
  }

  getGridTotalPages(fieldName: string): number {
    const rows = this.getGridRows(fieldName);
    return Math.ceil(rows.length / 7);
  }

  changeGridPage(fieldName: string, page: number) {
    const total = this.getGridTotalPages(fieldName);
    if (page >= 1 && page <= total) {
      this.gridCurrentPageMap[fieldName] = page;
    }
  }

  addGridRow(fieldName: string, row: any) {
    if (!this.gridRowsMap[fieldName]) this.gridRowsMap[fieldName] = [];
    this.gridRowsMap[fieldName].push({ ...row });
  }

  removeGridRow(fieldName: string, index: number) {
    if (this.gridRowsMap[fieldName]) {
      // Ajustar el índice a eliminar considerando la página actual
      const page = this.gridCurrentPageMap[fieldName] || 1;
      const pageSize = 7;
      const realIndex = (page - 1) * pageSize + index;
      this.gridRowsMap[fieldName].splice(realIndex, 1);
      
      // Si la página se quedó vacía y no es la primera, volver atrás
      if (this.getPaginatedGridRows(fieldName).length === 0 && page > 1) {
        this.gridCurrentPageMap[fieldName] = page - 1;
      }
    }
  }

  formatGridValue(col: any, value: any): string {
    try {
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
    } catch (e) {
      console.error("Error formatting grid value:", e);
      return 'Error';
    }
  }

  openGridModal(field: any) {
    this.gridModalField = field;
    this.gridNewRow = {};
    this.gridEditIndex = -1;
    this.getGridColumns(field).forEach(col => {
      if (col.type === 'BOOLEAN' || col.type === 'boolean') {
        this.gridNewRow[col.name] = false;
      }
    });
  }

  editGridRow(field: any, index: number) {
    this.gridModalField = field;
    const page = this.gridCurrentPageMap[field.name] || 1;
    const pageSize = 7;
    const realIndex = (page - 1) * pageSize + index;
    this.gridEditIndex = realIndex;
    // Deep copy to avoid binding before saving
    this.gridNewRow = JSON.parse(JSON.stringify(this.gridRowsMap[field.name][realIndex]));
  }

  closeGridModal() {
    this.gridModalField = null;
    this.gridNewRow = {};
    this.gridEditIndex = -1;
  }

  saveGridRow() {
    if (!this.gridModalField) return;
    if (this.gridEditIndex !== -1) {
      // Update existing row
      this.gridRowsMap[this.gridModalField.name][this.gridEditIndex] = { ...this.gridNewRow };
    } else {
      // Add new row
      this.addGridRow(this.gridModalField.name, this.gridNewRow);
    }
    this.closeGridModal();
  }

  previewVisible(item: any): boolean {
    return this.evaluateVisibilityRule(item.visibleIf);
  }

  isSectionExpanded(section: any): boolean {
    if (section._expanded !== undefined) {
      return section._expanded;
    }
    // If not set, check initiallyCollapsed property
    if (section.initiallyCollapsed === true) {
      return false;
    }
    // Default is expanded
    return true;
  }

  toggleSection(section: any) {
    section._expanded = !this.isSectionExpanded(section);
  }

  // Debug vars
  debugProcsLength: number = 0;
  debugProcsKeys: string = '';
  debugError: string = '';
  debugVarsLoaded: string = '';

  uploadMock(fieldName: string) {
    this.uploadedMockFiles[fieldName] = 'archivo_prueba.pdf';
    this.previewModel[fieldName] = 'ID_DOC_MOCK_123';
  }

  simButtonAction(field: any) {
    const action = field.config?.buttonAction;
    if (action === 'SUBMIT') {
      this.simSubmit();
    } else if (action === 'SAVE') {
      this.simSave();
    } else if (action === 'RESET') {
      this.simReset();
    } else if (action === 'CUSTOM') {
      const apiToExecute = field.config?.apiToExecute;
      
      if (apiToExecute && apiToExecute.includes('CALCULAR')) {
         const dataToSearch = { ...this.taskVariables, ...this.previewModel };
         console.log("Detectado API de Cálculo. apiToExecute:", apiToExecute);
         
         const parseNumber = (val: any): number => {
             if (!val) return 0;
             if (typeof val === 'number') return val;
             let str = String(val).replace(/,/g, '');
             return Number(str) || 0;
         };

         // Extraer sufijo
         const suffix = apiToExecute.includes('_') ? apiToExecute.split('_').pop()?.toLowerCase() : '';

         // Extraer nombres de campos de la pantalla actual
         const currentScreenFields = new Set<string>();
         if (this.layout && this.layout.tabs) {
             this.layout.tabs.forEach((tab: any) => {
                 tab.sections?.forEach((sec: any) => {
                     sec.fields?.forEach((f: any) => {
                         if (f.name) currentScreenFields.add(f.name.toLowerCase());
                     });
                 });
             });
         }

         // Helper para buscar un valor en el modelo
         const findValue = (keywords: string[], secondaryKeywords: string[] = []): number => {
            // Pasada 1: campos de pantalla actual que además tengan el sufijo
            if (suffix) {
                for (const key of Object.keys(dataToSearch)) {
                    const k = key.toLowerCase();
                    if (currentScreenFields.has(k) && k.includes(suffix!)) {
                        if (keywords.some(kw => k.includes(kw))) {
                            if (secondaryKeywords.length === 0 || secondaryKeywords.some(sk => k.includes(sk))) {
                                const val = parseNumber(dataToSearch[key]);
                                if (val > 0) return val;
                            }
                        }
                    }
                }
            }
            // Pasada 2: campos de pantalla actual (sin importar sufijo)
            for (const key of Object.keys(dataToSearch)) {
                const k = key.toLowerCase();
                if (currentScreenFields.has(k)) {
                    if (keywords.some(kw => k.includes(kw))) {
                        if (secondaryKeywords.length === 0 || secondaryKeywords.some(sk => k.includes(sk))) {
                            const val = parseNumber(dataToSearch[key]);
                            if (val > 0) return val;
                        }
                    }
                }
            }
            // Pasada 3: cualquier campo histórico
            for (const key of Object.keys(dataToSearch)) {
                const k = key.toLowerCase();
                if (keywords.some(kw => k.includes(kw))) {
                    if (secondaryKeywords.length === 0 || secondaryKeywords.some(sk => k.includes(sk))) {
                        const val = parseNumber(dataToSearch[key]);
                        if (val > 0) return val;
                    }
                }
            }
            return 0;
         };

         // Priorizar monto aprobado, si no, monto solicitado
         let monto = findValue(['monto'], ['aprobado']);
         if (!monto) monto = findValue(['monto'], ['solicitado']);
         if (!monto) monto = findValue(['monto']);
         
         // Buscar tasa
         let tasa = findValue(['tasa', 'interes']);
         
         // Priorizar plazo aprobado, luego solicitado, luego meses
         let plazo = findValue(['plazo'], ['aprobado']);
         if (!plazo) plazo = findValue(['plazo'], ['solicitado']);
         if (!plazo) plazo = findValue(['plazo'], ['meses']);
         if (!plazo) plazo = findValue(['plazo']);
         
         console.log(`Variables extraídas para cálculo: Monto=${monto}, Tasa=${tasa}, Plazo=${plazo}`);
         
         const cuota = FormulasUtil.calcularCuotaMensual(monto, tasa, plazo);
         const cuotaStr = cuota.toFixed(2);
         
         // Actualizar los campos de cuota estimada
         let updated = false;
         
         // Pasada 1: Priorizar campo de la pantalla actual que tenga el sufijo
         if (suffix) {
             for (const key of Object.keys(dataToSearch)) {
                 const k = key.toLowerCase();
                 if (currentScreenFields.has(k) && k.includes(suffix!) && k.includes('cuota') && (k.includes('estimada') || k.includes('mensual') || k.includes('calculada'))) {
                     this.previewModel[key] = cuotaStr;
                     updated = true;
                 }
             }
         }
         
         // Pasada 2: Campos de pantalla actual sin sufijo
         if (!updated) {
             for (const key of Object.keys(dataToSearch)) {
                 const k = key.toLowerCase();
                 if (currentScreenFields.has(k) && k.includes('cuota') && (k.includes('estimada') || k.includes('mensual') || k.includes('calculada'))) {
                     this.previewModel[key] = cuotaStr;
                     updated = true;
                 }
             }
         }
         
         // Pasada 3: Histórico si aún no se ha actualizado nada
         if (!updated) {
             for (const key of Object.keys(dataToSearch)) {
                 const k = key.toLowerCase();
                 if (k.includes('cuota') && (k.includes('estimada') || k.includes('mensual') || k.includes('calculada'))) {
                     this.previewModel[key] = cuotaStr;
                     updated = true;
                 }
             }
         }
         
         if (!updated) {
             const defaultKey = suffix ? `cuota_estimada_${suffix}` : 'cuota_estimada';
             this.previewModel[defaultKey] = cuotaStr;
         }
         
         this.previewModel = { ...this.previewModel }; // trigger change detection
         
         this.simNotification = `Calculado: Monto=${monto}, Plazo=${plazo}, Tasa=${tasa}% -> Cuota=${cuotaStr}`;
         setTimeout(() => this.simNotification = '', 8000);
         return;
      }

      if (!apiToExecute) {
        this.simNotification = 'Botón CUSTOM clicado (Sin API configurada)';
        setTimeout(() => this.simNotification = '', 3000);
        return;
      }

      this.simNotification = `Ejecutando API: ${apiToExecute}...`;

      if (apiToExecute === 'APICLI') {
         const prefix = field.name.startsWith('codeudor_') ? 'codeudor_' : '';
         this.previewModel['interviniente_int_identificacion'] = this.previewModel[prefix + 'identificacion'];
         this.previewModel['DocumentNumber'] = this.previewModel[prefix + 'identificacion'];
      }

      this.apiManagerService.testApi(apiToExecute, this.previewModel).subscribe({
        next: (res) => {
          this.simNotification = `Éxito API: ${JSON.stringify(res).substring(0, 50)}...`;
          if (res && typeof res === 'object') {
            const prefix = field.name.startsWith('codeudor_') ? 'codeudor_' : '';
            const prefixedRes: any = {};
            for (let key in res) {
               let val = res[key];
               if (val !== null && val !== undefined && typeof val !== 'object' && typeof val !== 'boolean') {
                 val = String(val);
               }
               prefixedRes[prefix + key] = val;
            }
            
            // CUSTOM MAPPING FOR APICLI
            if (apiToExecute === 'APICLI') {
               if (res.interviniente_int_nombres_completos) {
                 const parts = res.interviniente_int_nombres_completos.split(' ');
                 if (parts.length >= 4) {
                   prefixedRes[prefix + 'primer_nombre'] = parts[0];
                   prefixedRes[prefix + 'segundo_nombre'] = parts[1];
                   prefixedRes[prefix + 'primer_apellido'] = parts[2];
                   prefixedRes[prefix + 'segundo_apellido'] = parts.slice(3).join(' ');
                 } else if (parts.length === 3) {
                   prefixedRes[prefix + 'primer_nombre'] = parts[0];
                   prefixedRes[prefix + 'primer_apellido'] = parts[1];
                   prefixedRes[prefix + 'segundo_apellido'] = parts[2];
                 } else if (parts.length === 2) {
                   prefixedRes[prefix + 'primer_nombre'] = parts[0];
                   prefixedRes[prefix + 'primer_apellido'] = parts[1];
                 }
               }
               if (res.interviniente_int_estado_civil || res.estado_civil_solicitante) {
                 prefixedRes[prefix + 'estado_civil'] = res.interviniente_int_estado_civil || res.estado_civil_solicitante;
               }
               if (res.tiene_conyuge_solicitante !== undefined) {
                 prefixedRes[prefix + 'tiene_conyuge'] = res.tiene_conyuge_solicitante;
               }
               
               // Reemplazar comas por puntos en números (ej. "59,6" -> "59.6") para inputs type="number"
               for (let k in res) {
                 if (typeof res[k] === 'string' && res[k].match(/^[0-9]+,[0-9]+$/)) {
                   prefixedRes[prefix + k] = res[k].replace(',', '.');
                 }
               }
               // Try to parse "15 DE ENERO DE 1967"
               if (res.fecha_nacimiento && String(res.fecha_nacimiento).includes(' DE ')) {
                  const fStr = String(res.fecha_nacimiento).toUpperCase();
                  const mMap: any = {'ENERO':'01','FEBRERO':'02','MARZO':'03','ABRIL':'04','MAYO':'05','JUNIO':'06','JULIO':'07','AGOSTO':'08','SEPTIEMBRE':'09','OCTUBRE':'10','NOVIEMBRE':'11','DICIEMBRE':'12'};
                  for (let m in mMap) {
                     if (fStr.includes(' DE ' + m + ' DE ')) {
                        const parts = fStr.split(' DE ');
                        if (parts.length === 3) {
                           const dd = parts[0].padStart(2, '0');
                           const yyyy = parts[2];
                           prefixedRes[prefix + 'fecha_nacimiento'] = `${yyyy}-${mMap[m]}-${dd}`;
                        }
                        break;
                     }
                  }
               }
            }

            // SMART LOOKUP FOR COMBOS
            for (let key in prefixedRes) {
               const options = this.simOptions[key];
               if (options && options.length > 0) {
                 const strVal = String(prefixedRes[key]).trim().toUpperCase();
                 const opt = options.find((o: any) => 
                     String(o.codigo || o.id || o.code).trim().toUpperCase() === strVal ||
                     String(o.descripcion || o.nombre || o.label || o.valor || '').trim().toUpperCase() === strVal
                 );
                 if (opt) {
                   prefixedRes[key] = String(opt.codigo || opt.id || opt.code);
                 }
               }
            }

            Object.assign(this.previewModel, prefixedRes);

            // LOGICA PARA HABILITAR SECCION SI NO HAY DATOS
            if (field.config?.enableSectionOnApiFail && res.mensaje && res.mensaje.includes('no encontrado')) {
              if (this.layout && this.layout.tabs) {
                for (const tab of this.layout.tabs) {
                  for (const section of tab.sections) {
                    if (section.fields.includes(field)) {
                      section.fields.forEach((f: any) => f.readOnly = false);
                      this.simNotification = `API no encontró datos. Se habilitó la edición de los campos.`;
                    }
                  }
                }
              }
            }
          }
          setTimeout(() => this.simNotification = '', 4000);
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
    if (this.simGetValidationErrors().length > 0) {
      this.simNotificationType = 'warning';
      this.simNotification = 'Hay errores de validación. Revisa el formulario.';
      setTimeout(() => this.simNotification = '', 3000);
      return;
    }
    
    if (this.taskId) {
      // Merge taskVariables with previewModel (which contains the form data)
      const finalVars = { ...this.taskVariables, ...this.previewModel };
      Object.keys(this.gridRowsMap).forEach(key => {
         if (this.gridRowsMap[key] && this.gridRowsMap[key].length > 0) {
            finalVars[key] = JSON.stringify(this.gridRowsMap[key]);
         } else {
            finalVars[key] = "[]";
         }
      });
      this.taskService.completeTask(this.taskId, finalVars).subscribe({
        next: () => {
          this.simSubmitted = true;
          this.simNotificationType = 'success';
          this.simNotification = 'Tarea completada exitosamente.';
          setTimeout(() => {
            this.router.navigate(['/portal/bandeja']);
          }, 2000);
        },
        error: (err) => {
          this.simNotificationType = 'error';
          this.simNotification = 'Error al completar tarea: ' + err.message;
          setTimeout(() => this.simNotification = '', 4000);
        }
      });
    } else {
      this.simNotificationType = 'warning';
      this.simNotification = 'No hay una tarea activa para completar.';
      setTimeout(() => this.simNotification = '', 3000);
    }
  }

  simSave() {
    if (this.taskId) {
      const finalVars = { ...this.taskVariables, ...this.previewModel };
      Object.keys(this.gridRowsMap).forEach(key => {
         if (this.gridRowsMap[key] && this.gridRowsMap[key].length > 0) {
            finalVars[key] = JSON.stringify(this.gridRowsMap[key]);
         } else {
            finalVars[key] = "[]";
         }
      });
      this.taskService.saveTaskVariables(this.taskId, finalVars).subscribe({
        next: () => {
          this.simNotificationType = 'success';
          this.simNotification = 'Datos guardados';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.simNotification = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.simNotificationType = 'error';
          this.simNotification = 'Error al guardar avance: ' + err.message;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.simNotification = '';
            this.cdr.detectChanges();
          }, 4000);
        }
      });
    } else {
      this.simNotificationType = 'warning';
      this.simNotification = 'No hay una tarea activa para guardar.';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.simNotification = '';
        this.cdr.detectChanges();
      }, 3000);
    }
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
            if (f.required) {
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
            const dataObj = { ...this.previewModel, ...this.gridRowsMap };
            const check = new Function('data', 'with(data) { return ' + val.condition + '; }');
            const isInvalid = check(dataObj);
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

  private autoMapComboValue(fieldName: string, options: any[]) {
    if (!options || !Array.isArray(options) || options.length === 0) return;
    const currentVal = this.previewModel[fieldName];
    if (currentVal) {
      const exactMatch = options.find((opt:any) => 
        String(opt.codigo) === String(currentVal) || 
        String(opt.id) === String(currentVal) || 
        String(opt.code) === String(currentVal)
      );
      if (!exactMatch) {
        const matchByDesc = options.find((opt:any) => 
          opt.descripcion === currentVal || 
          opt.nombre === currentVal || 
          opt.label === currentVal || 
          opt.name === currentVal
        );
        if (matchByDesc) {
          this.previewModel[fieldName] = matchByDesc.codigo || matchByDesc.id || matchByDesc.code;
        }
      }
    }
  }

  private _cachedPropietarioOpts: any[] = [];
  private _lastPropietarioHash: string = '';
  private _cachedPeriodoOpts: any[] = [
    { id: 'Enero', label: 'Enero' }, { id: 'Febrero', label: 'Febrero' },
    { id: 'Marzo', label: 'Marzo' }, { id: 'Abril', label: 'Abril' },
    { id: 'Mayo', label: 'Mayo' }, { id: 'Junio', label: 'Junio' },
    { id: 'Julio', label: 'Julio' }, { id: 'Agosto', label: 'Agosto' },
    { id: 'Septiembre', label: 'Septiembre' }, { id: 'Octubre', label: 'Octubre' },
    { id: 'Noviembre', label: 'Noviembre' }, { id: 'Diciembre', label: 'Diciembre' }
  ];
  private _cachedTipoDeudaOpts: any[] = [
    { id: 'Préstamo de Consumo', label: 'Préstamo de Consumo' },
    { id: 'Préstamo Hipotecario', label: 'Préstamo Hipotecario' },
    { id: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
    { id: 'Préstamo Vehicular', label: 'Préstamo Vehicular' },
    { id: 'Préstamo Educativo', label: 'Préstamo Educativo' },
    { id: 'Otros', label: 'Otros' }
  ];

  getSimOptions(fieldName: string): any[] {
    if (fieldName === 'propietario') {
      const estadoCivil = String(this.previewModel['estado_civil'] || '').toUpperCase();
      const requiereCodeudor = this.previewModel['requiere_codeudor'];
      const currentHash = estadoCivil + "_" + requiereCodeudor;
      
      if (this._lastPropietarioHash !== currentHash) {
        this._lastPropietarioHash = currentHash;
        const opciones = [{ id: 'Deudor', label: 'Deudor' }];
        if (estadoCivil === 'CASADO' || estadoCivil === 'UNION LIBRE' || estadoCivil === 'CASADO/A' || estadoCivil === 'UNIÓN DE HECHO') {
          opciones.push({ id: 'Cónyuge', label: 'Cónyuge' });
        }
        if (requiereCodeudor === true || requiereCodeudor === 'true' || requiereCodeudor === 'SI' || requiereCodeudor === 'S') {
          opciones.push({ id: 'Codeudor', label: 'Codeudor' });
        }
        this._cachedPropietarioOpts = opciones;
      }
      return this._cachedPropietarioOpts;
    }
    if (fieldName === 'periodo') {
      return this._cachedPeriodoOpts;
    }
    if (fieldName === 'tipoDeuda') {
       return this._cachedTipoDeudaOpts;
    }
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
