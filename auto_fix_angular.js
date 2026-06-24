const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const componentPath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

function runBuild() {
    return new Promise((resolve) => {
        exec('npm run build', { cwd: 'portal-angular' }, (error, stdout, stderr) => {
            resolve(stdout + '\n' + stderr);
        });
    });
}

async function main() {
    let iteration = 0;
    while (iteration < 20) {
        iteration++;
        console.log(`\n--- Iteration ${iteration} ---`);
        console.log('Running ng build...');
        
        const output = await runBuild();
        
        let lines = fs.readFileSync(componentPath, 'utf8').split('\n');
        
        const regex = /Unexpected closing tag "[^"]+"[\s\S]*?disenador-pantallas\.component\.ts:(\d+):/g;
        let match;
        let linesToRemove = [];
        
        while ((match = regex.exec(output)) !== null) {
            let lineNum = parseInt(match[1], 10) - 1;
            linesToRemove.push(lineNum);
        }
        
        linesToRemove = [...new Set(linesToRemove)];
        
        if (linesToRemove.length === 0) {
            console.log('No unexpected closing tags found! Build must be successful or has different errors.');
            console.log(output.substring(Math.max(0, output.length - 1000))); // print last 1000 chars
            break;
        }
        
        let removedCount = 0;
        for (let lineNum of linesToRemove) {
            // Check the exact line and up to 3 lines above it for a </div> to remove
            let removed = false;
            for (let offset = 0; offset <= 3; offset++) {
                let targetIdx = lineNum - offset;
                if (targetIdx >= 0 && lines[targetIdx] && lines[targetIdx].includes('</div>')) {
                    lines[targetIdx] = lines[targetIdx].replace(/<\/div>/g, '');
                    removed = true;
                    removedCount++;
                    console.log(`Removed </div> at line ${targetIdx + 1} (reported around ${lineNum + 1})`);
                    break;
                }
            }
            if (!removed) {
                console.log(`Could not find </div> around line ${lineNum + 1}`);
            }
        }
        
        fs.writeFileSync(componentPath, lines.join('\n'));
        console.log(`Removed ${removedCount} tags in iteration ${iteration}.`);
        
        if (removedCount === 0) {
            console.log('Could not remove any tags, breaking loop to avoid infinite loop.');
            break;
        }
    }
}

main();
