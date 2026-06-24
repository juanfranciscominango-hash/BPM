const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// 1. Change grid modal body to use bootstrap row/col so it doesn't wrap awkwardly
const oldModalBody = `<div class="modal-body p-4 bg-white">
                <div class="d-flex flex-wrap align-items-center gap-4">
                  <div class="d-flex align-items-center gap-2 flex-grow-1" *ngFor="let col of getGridColumns(gridModalField)">
                    <label class="form-label small fw-bold text-muted mb-0 text-nowrap" style="font-size: 0.75rem;">
                      <span class="text-danger me-1">*</span>{{ col.label || col.name }}
                    </label>
                    <div class="flex-grow-1" style="min-width: 140px;">`;

const newModalBody = `<div class="modal-body p-4 bg-white">
                <div class="row g-3 align-items-center">
                  <div class="col d-flex align-items-center gap-2" *ngFor="let col of getGridColumns(gridModalField)">
                    <label class="form-label small fw-bold text-muted mb-0 text-nowrap" style="font-size: 0.75rem;">
                      <span class="text-danger me-1">*</span>{{ col.label || col.name }}
                    </label>
                    <div class="flex-grow-1">`;

tsContent = tsContent.replace(oldModalBody, newModalBody);

// Close tags for the modal body
tsContent = tsContent.replace(
    /<\/select>\n                    <\/div>\n                  <\/div>\n                <\/div>\n                <div \*ngIf="getGridColumns\(gridModalField\)\.length === 0"/,
    '</select>\n                    </div>\n                  </div>\n                </div>\n                <div *ngIf="getGridColumns(gridModalField).length === 0"'
);

// 2. Add an "Add Column" button to the properties panel
const addColButtonHtml = `                          <div *ngIf="getAvailableColumnsForField(activeField).length > 0"
                               class="border rounded overflow-hidden" style="max-height:220px;overflow-y:auto;">`;

const newAddColButtonHtml = `                          <div *ngIf="!activeField.config.dataSourceEntityId" class="mb-2">
                            <button class="btn btn-sm btn-outline-indigo w-100 py-1" style="font-size:0.75rem;" (click)="addVirtualColumn(activeField)">
                              <i class="bi bi-plus-lg me-1"></i>Añadir Columna Personalizada
                            </button>
                          </div>
                          <div *ngIf="getAvailableColumnsForField(activeField).length > 0"
                               class="border rounded overflow-hidden" style="max-height:220px;overflow-y:auto;">`;

tsContent = tsContent.replace(addColButtonHtml, newAddColButtonHtml);

// Add the addVirtualColumn function
const funcToAdd = `  addVirtualColumn(field: any) {
    if (!field.config.selectedColumns) {
      field.config.selectedColumns = [];
    }
    const idx = field.config.selectedColumns.length + 1;
    field.config.selectedColumns.push({
      name: 'columna_' + idx,
      label: 'Columna ' + idx,
      type: 'TEXT',
      visible: true
    });
    this.updateSelectedColumns(field);
  }

  // Returns the full list of available columns for the field (for the inspector panel)`;

tsContent = tsContent.replace('  // Returns the full list of available columns for the field (for the inspector panel)', funcToAdd);

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("HTML and Class patched successfully for add column.");
