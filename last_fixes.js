const fs = require('fs');

const filePath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Fix line 725 (index 724)
if (lines[724].includes('</ng-container>')) {
    lines[724] = '</div>\n' + lines[724];
} else {
    console.log('Line 725 does not contain </ng-container>');
}

// 2. Fix line 1362 (index 1361)
if (lines[1361].includes('</ng-container>')) {
    lines[1361] = '</div>\n' + lines[1361];
} else {
    // maybe 1364? Let's check 1360-1365
    let fixed = false;
    for(let i=1360; i<=1365; i++) {
        if(lines[i].includes('</ng-container>')) {
            lines[i] = '</div>\n' + lines[i];
            fixed = true;
            break;
        }
    }
    if(!fixed) console.log('Could not find </ng-container> around 1362');
}

// 3. Add getSimOptions
let simOptionsIndex = -1;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('simOptions: { [fieldName: string]: any[] } = {};')) {
        simOptionsIndex = i;
        break;
    }
}

if (simOptionsIndex !== -1) {
    lines.splice(simOptionsIndex + 1, 0, '  getSimOptions(fieldName: string): any[] { return this.simOptions[fieldName] || []; }');
} else {
    console.log('Could not find simOptions definition');
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Applied final 3 fixes!');
