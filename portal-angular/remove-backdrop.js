const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const backdropRegex = /<!-- BACKDROP OFFCANVAS -->\s*<div \*ngIf="activeField" class="offcanvas-backdrop fade show" \(click\)="activeField = null; draftField = null" style="z-index: 1040;"><\/div>/g;
tsContent = tsContent.replace(backdropRegex, '');

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("Backdrop removed successfully!");
