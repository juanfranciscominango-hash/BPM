const fs = require('fs');
const content = fs.readFileSync('portal-angular/src/app/features/portal-usuario/wizard-flujo/wizard-flujo.component.ts', 'utf8');
const lines = content.split('\n');
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Load real parametric data for COMBO fields')) {
    // Find the enclosing method
    for (let j = i; j >= 0; j--) {
      if (lines[j].includes('(') && lines[j].includes('{') && !lines[j].includes('if') && !lines[j].includes('for')) {
        console.log('Enclosing context near line', j, ':', lines[j].trim());
      }
    }
    break;
  }
}
