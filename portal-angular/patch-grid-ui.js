const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// 1. Remove the dataSourceEntityId restriction for showing grid columns in Properties
tsContent = tsContent.replace(
    /<div \*ngIf="activeField\.controlType === 'GRID' && activeField\.config\.dataSourceEntityId" class="mt-2">/g,
    '<div *ngIf="activeField.controlType === \'GRID\'" class="mt-2">'
);

// 2. Add the Catálogo selector for each column
const oldColumnControls = `                              <div *ngIf="col.parametricTableId && col.visible" class="d-flex align-items-center gap-2 px-2 pb-2 ps-5">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Campo a mostrar:</label>
                                <select *ngIf="getParametricColumnsForDisplay(col.parametricTableId).length > 0"`;

const newColumnControls = `                              <div *ngIf="col.visible" class="d-flex flex-column gap-1 px-2 pb-2 ps-5">
                                <div class="d-flex align-items-center gap-2">
                                  <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Lista:</label>
                                  <select class="form-select form-select-sm border shadow-none px-1 py-0" 
                                          style="font-size: 0.65rem; height: 22px; flex: 1;" 
                                          [(ngModel)]="col.parametricTableId" 
                                          (ngModelChange)="updateSelectedColumns(activeField)">
                                    <option [ngValue]="undefined">Texto Libre</option>
                                    <option *ngFor="let pt of parametricTables" [ngValue]="pt.id">{{ pt.label || pt.name }}</option>
                                  </select>
                                </div>
                                <div *ngIf="col.parametricTableId" class="d-flex align-items-center gap-2">
                                  <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Mostrar:</label>
                                  <select *ngIf="getParametricColumnsForDisplay(col.parametricTableId).length > 0"`;

tsContent = tsContent.replace(oldColumnControls, newColumnControls);

// 3. Update getAvailableColumnsForField so it returns selectedColumns if entityId is null
const oldGetAvailableCols = `    getAvailableColumnsForField(field: any): {name: string; type: string; label: string; visible: boolean; parametricTableId?: number; displayField?: string}[] {
      if (!field?.config) return [];
      const entityId = field.config.dataSourceEntityId;
      if (!entityId) return [];`;

const newGetAvailableCols = `    getAvailableColumnsForField(field: any): {name: string; type: string; label: string; visible: boolean; parametricTableId?: number; displayField?: string}[] {
      if (!field?.config) return [];
      const entityId = field.config.dataSourceEntityId;
      if (!entityId) return field.config.selectedColumns || [];`;

tsContent = tsContent.replace(oldGetAvailableCols, newGetAvailableCols);

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("Patched component successfully!");
