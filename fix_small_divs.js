const fs = require('fs');
const filePath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

let count = 0;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('<div class="small text-muted">') && !lines[i].includes('</div>')) {
        lines[i] = lines[i].replace(/\r?$/, '</div>\r');
        console.log('Fixed line ' + (i+1) + ': ' + lines[i]);
        count++;
    }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed ' + count + ' unclosed text-muted divs.');
