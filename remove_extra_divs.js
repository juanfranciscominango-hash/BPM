const fs = require('fs');

const logPath = 'C:/Users/jf_mi/.gemini/antigravity/brain/37301d63-994d-4955-9dd8-820b3a98f48f/.system_generated/tasks/task-372.log';
const componentPath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

let log = fs.readFileSync(logPath, 'utf8');
let lines = fs.readFileSync(componentPath, 'utf8').split('\n');

const regex = /Unexpected closing tag "div"[\s\S]*?disenador-pantallas\.component\.ts:(\d+):/g;
let match;
let removedCount = 0;
let linesToRemove = [];

while ((match = regex.exec(log)) !== null) {
    let lineNum = parseInt(match[1], 10) - 1; // 0-indexed
    linesToRemove.push(lineNum);
}

const ngContainerRegex = /Unexpected closing tag "ng-container"[\s\S]*?disenador-pantallas\.component\.ts:(\d+):/g;
while ((match = ngContainerRegex.exec(log)) !== null) {
    let lineNum = parseInt(match[1], 10) - 1;
    // Look backwards up to 3 lines for a </div>
    for(let i=1; i<=3; i++) {
        if (lines[lineNum - i] && lines[lineNum - i].includes('</div>')) {
            linesToRemove.push(lineNum - i);
            break; // only remove one per ng-container error
        }
    }
}

linesToRemove = [...new Set(linesToRemove)]; // unique

for (let lineNum of linesToRemove) {
    if (lines[lineNum].includes('</div>')) {
        lines[lineNum] = lines[lineNum].replace(/<\/div>/g, '');
        removedCount++;
        console.log('Removed extra </div> at line', lineNum + 1);
    } else {
        console.log('Line', lineNum + 1, 'does not contain </div>!');
    }
}

fs.writeFileSync(componentPath, lines.join('\n'));
console.log('Total removed:', removedCount);
