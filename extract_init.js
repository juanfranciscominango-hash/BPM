const fs = require('fs');
const content = fs.readFileSync('portal-angular/src/app/features/portal-usuario/wizard-flujo/wizard-flujo.component.ts', 'utf8');
const lines = content.split('\n');
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ngOnInit(): void {') || lines[i].includes('ngOnInit() {')) start = i;
  if (lines[i].includes('// Load real parametric data for COMBO fields')) end = i + 20;
}
if (start !== -1 && end !== -1) {
  console.log(lines.slice(start, end).join('\n'));
} else {
  console.log('Not found', start, end);
}
