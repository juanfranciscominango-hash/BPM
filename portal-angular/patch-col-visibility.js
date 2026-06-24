const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// 1. Add the UI for Visibility Rule in the Properties Panel
const oldColParams = `                              <div *ngIf="col.parametricTableId" class="d-flex align-items-center gap-2">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Mostrar:</label>`;

const newColParams = `                              <div class="d-flex align-items-center gap-2 mt-1">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Visibilidad:</label>
                                <input type="text" class="form-control form-control-sm border shadow-none px-1 py-0 bg-light" 
                                       style="font-size: 0.65rem; height: 22px; flex: 1;" 
                                       [(ngModel)]="col.visibilityRule" 
                                       (ngModelChange)="updateSelectedColumns(activeField)"
                                       placeholder="ej: estadoCivil === 'Soltero'">
                              </div>
                              <div *ngIf="col.parametricTableId" class="d-flex align-items-center gap-2 mt-1">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Mostrar:</label>`;

tsContent = tsContent.replace(oldColParams, newColParams);

// 2. Update getGridColumns to filter by visibilityRule in preview mode
const oldGetGridCols = `        // FIX INFINITE LOOP: Cache the array reference to avoid endless ngFor re-renders
        const currentSelectedStr = JSON.stringify(selected) + "_" + physicalState;
        if (field._cachedSelectedStr !== currentSelectedStr) {
          field._cachedSelectedStr = currentSelectedStr;
          field._cachedColumns = selected.filter((c: any) => c.visible !== false)
                                         .map((c: any) => {
                                            const pcol = physicalCols.find((pc: any) => pc.name === c.name);
                                            return pcol ? { ...c, parametricTableId: c.parametricTableId || pcol.parametricTableId } : c;
                                         });
        }
        return field._cachedColumns || [];`;

const newGetGridCols = `        // FIX INFINITE LOOP: Cache the array reference to avoid endless ngFor re-renders
        const currentSelectedStr = JSON.stringify(selected) + "_" + physicalState;
        if (field._cachedSelectedStr !== currentSelectedStr) {
          field._cachedSelectedStr = currentSelectedStr;
          field._cachedColumns = selected.filter((c: any) => c.visible !== false)
                                         .map((c: any) => {
                                            const pcol = physicalCols.find((pc: any) => pc.name === c.name);
                                            return pcol ? { ...c, parametricTableId: c.parametricTableId || pcol.parametricTableId } : c;
                                         });
        }
        
        const allColumns = field._cachedColumns || [];
        if (this.mostrarPreview) {
          // Cache the visible array based on evaluation to avoid infinite redraw loops
          const visibilityHash = allColumns.map((c: any) => c.visibilityRule ? (this.evaluateVisibilityRule(c.visibilityRule) ? '1' : '0') : '1').join('-');
          if (field._cachedVisibilityHash !== visibilityHash) {
            field._cachedVisibilityHash = visibilityHash;
            field._cachedVisibleColumns = allColumns.filter((c: any) => !c.visibilityRule || this.evaluateVisibilityRule(c.visibilityRule));
          }
          return field._cachedVisibleColumns || [];
        }
        
        return allColumns;`;

tsContent = tsContent.replace(oldGetGridCols, newGetGridCols);

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("HTML and Class patched successfully for column visibility rules.");
