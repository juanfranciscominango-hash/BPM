const fs = require('fs');
const path = require('path');
const http = require('http');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function postJson(url, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function patchGrid() {
    // 1. Update DB layout
    console.log("Fetching screens...");
    const screens = await fetchJson('http://localhost:9090/api/v1/screens');
    const screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');
    
    if (screen) {
        let layout = JSON.parse(screen.layoutJson);
        for (let tab of layout.tabs) {
            for (let section of tab.sections) {
                for (let field of section.fields) {
                    if (field.name === 'gridIngresos') {
                        const newCols = [
                            { name: 'mes', label: 'Mes', type: 'TEXT', parametricTableId: 22, visible: true },
                            { name: 'ingresosDeudor', label: 'Ingresos deudor', type: 'NUMBER', visible: true },
                            { name: 'ingresosConyuge', label: 'Ingresos cónyuge', type: 'NUMBER', visible: true },
                            { name: 'ingresosCodeudor', label: 'Ingresos codeudor/cónyuge codeudor', type: 'NUMBER', visible: true }
                        ];
                        field.config.selectedColumns = newCols;
                        field._cachedColumns = newCols;
                        console.log("Updated gridIngresos columns");
                    }
                }
            }
        }
        screen.layoutJson = JSON.stringify(layout);
        await postJson('http://localhost:9090/api/v1/screens', screen);
        console.log("DB layout updated.");
    }

    // 2. Update HTML
    const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
    let tsContent = fs.readFileSync(tsPath, 'utf8');

    // Make modal larger
    tsContent = tsContent.replace(
        /<div class="modal-dialog modal-dialog-centered" \(click\)="\$event.stopPropagation\(\)">/,
        '<div class="modal-dialog modal-dialog-centered modal-xl" (click)="$event.stopPropagation()">'
    );

    // Change modal background and title to match the screenshot (gray header)
    tsContent = tsContent.replace(
        /<div class="modal-header py-3" style="background:linear-gradient\(135deg,#4f46e5,#7c3aed\);">/,
        '<div class="modal-header py-3 bg-light border-bottom">'
    );
    tsContent = tsContent.replace(
        /<h6 class="modal-title text-white fw-bold"><i class="bi bi-plus-circle me-2"><\/i>Agregar fila - \{\{ gridModalField.label \}\}<\/h6>/,
        '<h6 class="modal-title text-muted fw-bold">Agregar registro</h6>'
    );
    tsContent = tsContent.replace(
        /<button class="btn-close btn-close-white" \(click\)="closeGridModal\(\)"><\/button>/,
        '<button class="btn-close" (click)="closeGridModal()"></button>'
    );

    // Change modal body to be horizontal
    const oldModalBody = /<div class="modal-body p-4">\s*<div class="mb-3" \*ngFor="let col of getGridColumns\(gridModalField\)">\s*<label class="form-label small fw-semibold">\{\{ col\.label \|\| col\.name \}\}<\/label>/;
    
    const newModalBody = `<div class="modal-body p-4 bg-white">
                <div class="d-flex flex-wrap align-items-center gap-4">
                  <div class="d-flex align-items-center gap-2 flex-grow-1" *ngFor="let col of getGridColumns(gridModalField)">
                    <label class="form-label small fw-bold text-muted mb-0 text-nowrap" style="font-size: 0.75rem;">
                      <span class="text-danger me-1">*</span>{{ col.label || col.name }}
                    </label>
                    <div class="flex-grow-1" style="min-width: 140px;">`;
    
    tsContent = tsContent.replace(oldModalBody, newModalBody);

    // Close the new flex wrappers properly. The original had:
    // </select>
    // </div>
    // <div *ngIf="getGridColumns(gridModalField).length === 0" ...
    
    // We need to replace the closing div of the ngFor.
    tsContent = tsContent.replace(
        /<\/select>\s*<\/div>\s*<div \*ngIf="getGridColumns\(gridModalField\)\.length === 0"/,
        '</select>\n                    </div>\n                  </div>\n                </div>\n                <div *ngIf="getGridColumns(gridModalField).length === 0"'
    );

    // Change modal footer buttons to match screenshot
    tsContent = tsContent.replace(
        /<button class="btn btn-primary rounded-pill px-4 fw-semibold" \(click\)="confirmGridRow\(gridModalField\)" \[disabled\]="getGridColumns\(gridModalField\)\.length === 0">\s*<i class="bi bi-check-lg me-1"><\/i>Agregar Fila\s*<\/button>/,
        '<button class="btn px-4 fw-semibold text-white" style="background-color: #0f172a; border-radius: 4px;" (click)="confirmGridRow(gridModalField)" [disabled]="getGridColumns(gridModalField).length === 0">Aceptar</button>'
    );
    tsContent = tsContent.replace(
        /<button class="btn btn-outline-secondary rounded-pill px-4" \(click\)="closeGridModal\(\)">Cancelar<\/button>/,
        '<button class="btn btn-outline-secondary px-4 fw-semibold me-2" style="border-radius: 4px;" (click)="closeGridModal()">Cancelar</button>'
    );

    // Make simulation inputs a bit flatter to match the screenshot
    // The screenshot has gray backgrounds for inputs. Let's add bg-light to inputs inside the modal.
    tsContent = tsContent.replace(
        /class="form-control"/g,
        'class="form-control bg-light"'
    );
    tsContent = tsContent.replace(
        /class="form-select"/g,
        'class="form-select bg-light"'
    );

    fs.writeFileSync(tsPath, tsContent, 'utf8');
    console.log("HTML patched successfully.");
}

patchGrid();
