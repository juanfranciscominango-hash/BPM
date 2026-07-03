const fs = require('fs');
const content = fs.readFileSync('portal-angular/src/app/features/portal-usuario/wizard-flujo/wizard-flujo.component.ts', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('getGridColumns') && lines[i-1] && lines[i-1].includes('GRID')) {
    console.log(lines.slice(i - 2, i + 8).join('\n'));
    break;
  }
}
