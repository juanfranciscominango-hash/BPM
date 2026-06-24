const fs = require('fs');
let content = fs.readFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', 'utf8');
let lines = content.split('\n');

for(let i=31; i<3180; i++) {
  if (/^ +\r?$/.test(lines[i])) {
    lines[i] = lines[i].replace(/\r?$/, '</div>\r');
  }
}

fs.writeFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', lines.join('\n'));
console.log('Replaced all empty space lines with </div>');
