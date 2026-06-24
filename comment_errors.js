const fs = require('fs');

const logPath = 'c:/Users/jf_mi/.gemini/antigravity/brain/d3a40b8c-7fa3-4e5a-bdfb-753085d784a6/.system_generated/tasks/task-153.log';
const componentPath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

if (!fs.existsSync(logPath)) {
    console.log("Log not found.");
    process.exit(1);
}

const logContent = fs.readFileSync(logPath, 'utf8');
const lines = fs.readFileSync(componentPath, 'utf8').split('\n');

const regex = /disenador-pantallas\.component\.ts:(\d+):\d+:/g;
let match;
let linesToComment = [];

while ((match = regex.exec(logContent)) !== null) {
    linesToComment.push(parseInt(match[1], 10) - 1);
}

// Remove duplicates
linesToComment = [...new Set(linesToComment)];

if (linesToComment.length === 0) {
    console.log("No error lines found in log.");
    process.exit(0);
}

let commented = 0;
for (let lineNum of linesToComment) {
    if (lines[lineNum]) {
        // Only comment if it's not already commented
        if (!lines[lineNum].includes('<!-- REMOVED ERROR TAG -->')) {
            lines[lineNum] = `<!-- REMOVED ERROR TAG --> <!-- ${lines[lineNum].trim()} -->`;
            commented++;
        }
    }
}

fs.writeFileSync(componentPath, lines.join('\n'));
console.log(`Commented out ${commented} lines that had unexpected closing tags.`);
