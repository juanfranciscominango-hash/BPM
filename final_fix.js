const fs = require('fs');

const filePath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

let lines = content.split('\n');

// Find where the typescript code was cut off.
// In the current file, at line 4815, we have col3: `Fila ${idx} - Campo C
// followed by `</targetidx>`
let cutOffIndex = -1;
for(let i=4800; i<lines.length; i++) {
    if (lines[i].includes('</targetidx>')) {
        cutOffIndex = i;
        break;
    }
}

if (cutOffIndex !== -1) {
    // Truncate the lines
    lines = lines.slice(0, cutOffIndex);
    
    // The previous line was `col3: \`Fila ${idx} - Campo C`
    // We need to close the string, the object, the push(), the function, and the class!
    lines[lines.length - 1] = lines[lines.length - 1] + '`'; // close string
    lines.push('    });'); // close push
    lines.push('  }'); // close addMockGridRow function
    lines.push('}'); // close class
}

// Fix missing > for the div
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('(drop)="onFieldDrop($event, sIdx, fIdx)"')) {
        // If the line ends with the quote, append a >
        if (lines[i].trim().endsWith('"')) {
            lines[i] = lines[i] + '>';
        }
    }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed final TS errors and missing closing angle brackets.');
