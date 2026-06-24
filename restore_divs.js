const fs = require('fs');

const filePath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

let removedZeroIndent = 0;
let replacedEmpty = 0;

for (let i = 31; i < 3200; i++) {
    // 1. Remove zero-indent </div>
    if (lines[i] === '</div>' || lines[i] === '</div>\r') {
        lines[i] = lines[i].endsWith('\r') ? '\r' : '';
        removedZeroIndent++;
    }
    
    // 2. Replace empty lines with spaces to </div>
    if (/^ +\r?$/.test(lines[i])) {
        lines[i] = lines[i].replace(/\r?$/, '</div>\r');
        replacedEmpty++;
    }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log(`Removed ${removedZeroIndent} zero-indent </div> tags.`);
console.log(`Replaced ${replacedEmpty} empty-space lines with </div>.`);
