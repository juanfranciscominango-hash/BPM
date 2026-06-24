const { execSync } = require('child_process');
const fs = require('fs');
const path = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

for(let iter=0; iter<50; iter++) {
    console.log(`Iteration ${iter+1}...`);
    try {
        execSync('npm run build', { cwd: 'portal-angular', stdio: 'pipe' });
        console.log('Build successful!');
        break;
    } catch (error) {
        const output = error.stdout.toString() + error.stderr.toString();
        const matches = [...output.matchAll(/Unexpected closing tag "(.*?)".*?:(\d+):\d+:/gs)];
        
        if (matches.length > 0) {
            let lines = fs.readFileSync(path, 'utf8').split('\n');
            let added = 0;
            
            // Iterate in reverse to avoid shifting lines
            // Actually, we replace in place with `</div>\n</tagName>`, so it shifts subsequent lines by 1.
            // If we process matches from bottom to top, the line numbers above won't shift.
            matches.sort((a, b) => parseInt(b[2]) - parseInt(a[2]));
            
            for(let m of matches) {
                const tagName = m[1];
                const lineNum = parseInt(m[2], 10);
                
                let targetIdx = lineNum - 1;
                let found = false;
                for(let i=targetIdx - 5; i<=targetIdx + 5; i++) {
                    if (lines[i] && lines[i].includes(`</${tagName}>`)) {
                        lines[i] = lines[i].replace(`</${tagName}>`, `</div>\n</${tagName}>`);
                        found = true;
                        added++;
                        break;
                    }
                }
            }
            
            if (added === 0) {
                console.log('Could not find any tags around the reported lines.');
                break;
            }
            
            fs.writeFileSync(path, lines.join('\n'));
            console.log(`Inserted ${added} </div> tags.`);
        } else {
            console.log('No unexpected closing tag found. Other error?');
            console.log(output.substring(output.length - 1000));
            break;
        }
    }
}
