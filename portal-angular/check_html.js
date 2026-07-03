const fs = require('fs');
const html = fs.readFileSync('c:/ProyectosJava/BMP/portal-angular/src/app/features/portal-usuario/wizard-flujo/wizard-flujo.component.html', 'utf8');
const start = html.indexOf('<ng-container *ngFor="let tab of layout.tabs;');
const end = html.indexOf('<!-- SIN DISEÑO -->');
console.log(html.substring(start, end));
