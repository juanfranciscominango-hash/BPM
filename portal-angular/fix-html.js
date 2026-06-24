const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// The layout currently uses col-md-3 for left panel and col-md-9 for center panel.
// We want to change it to:
// col-xxl-2 col-xl-3 (Left)
// col-xxl-7 col-xl-6 (Center)
// col-xxl-3 col-xl-3 (Right)

// 1. Change left panel
tsContent = tsContent.replace(/<div class="col-md-3">/g, '<div class="col-xxl-2 col-xl-3">');

// 2. Change center panel
tsContent = tsContent.replace(/<div class="col-md-9">/g, '<div class="col-xxl-7 col-xl-6">');

// 3. Remove offcanvas classes from right panel and convert to a normal column
// The right panel starts with:
// <!-- PANEL DERECHO: PROPIEDADES DEL CONTROL SELECCIONADO (OFFCANVAS) -->
// <div class="offcanvas offcanvas-end shadow-lg" tabindex="-1" id="offcanvasProperties" ... >

let rightPanelRegex = /<div class="offcanvas offcanvas-end shadow-lg" tabindex="-1" id="offcanvasProperties" \[class\.show\]="activeField" \[style\.visibility\]="activeField \? 'visible' : 'hidden'" style="width: 400px; z-index: 1045; border-left: none;">/g;
tsContent = tsContent.replace(rightPanelRegex, '<div class="col-xxl-3 col-xl-3" *ngIf="activeField && draftField"><div class="card border-0 shadow-sm card-premium h-100">');

// The header of the offcanvas:
let rightPanelHeaderRegex = /<div class="offcanvas-header bg-indigo text-white shadow-sm py-3">/g;
tsContent = tsContent.replace(rightPanelHeaderRegex, '<div class="card-header bg-white text-dark shadow-xs py-3 border-0">');

// The close button of the offcanvas
let closeBtnRegex = /<button type="button" class="btn-close btn-close-white" \(click\)="activeField = null" aria-label="Close"><\/button>/g;
tsContent = tsContent.replace(closeBtnRegex, '<button type="button" class="btn-close" (click)="activeField = null" aria-label="Close"></button>');

// The body of the offcanvas
let offcanvasBodyRegex = /<div class="offcanvas-body p-0 d-flex flex-column" style="background-color: #f8fafc;" \*ngIf="activeField && draftField">/g;
tsContent = tsContent.replace(offcanvasBodyRegex, '<div class="card-body p-0 d-flex flex-column" style="background-color: #f8fafc;">');

// Add an empty state for the right panel when NO field is selected
// We will append it right after the closing </div> of the right panel column.
// Since it's hard to find the closing div with Regex, we can just insert the empty state before the closing row div. Wait, it's easier to just let the column be empty or *ngIf out the whole column.
// Actually, if we use *ngIf="activeField" on the column, it will disappear. So the center panel should expand? 
// Angular doesn't dynamically change col-xxl-7 to col-xxl-10 automatically unless we use flex-grow.
// Let's replace the center panel classes with dynamic ones:
tsContent = tsContent.replace(/<div class="col-xxl-7 col-xl-6">/, '<div [ngClass]="activeField ? \'col-xxl-7 col-xl-6\' : \'col-xxl-10 col-xl-9\'">');

// Remove the inline styling from the simulation modal to make it look cleaner
let simModalRegex = /<div class="modal-content border-0 shadow-lg" style="min-height: 800px; background-color: #f4f6f9;">/g;
tsContent = tsContent.replace(simModalRegex, '<div class="modal-content border-0 shadow-premium" style="background-color: #f8fafc;">');

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("HTML structure updated for inline right panel!");
