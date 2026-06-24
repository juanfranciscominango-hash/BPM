const fs = require('fs');

const tsCode = fs.readFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', 'utf8');
const templateMatch = tsCode.match(/template:\s*`([\s\S]*?)`/);
if (!templateMatch) {
    console.log("Template not found");
    process.exit(1);
}

const template = templateMatch[1];
const lines = template.split('\n');

// We need to count the lines before the template to give accurate line numbers.
const preTemplate = tsCode.substring(0, templateMatch.index);
const startLine = preTemplate.split('\n').length;

const stack = [];
const selfClosing = new Set(['input', 'img', 'br', 'hr', 'meta', 'link']);
const ignoreTokens = new Set(['!--']);

const regex = /<\/?([a-zA-Z0-9-]+)[^>]*>/g;
let match;

while ((match = regex.exec(template)) !== null) {
    const fullTag = match[0];
    let tagName = match[1].toLowerCase();
    
    if (fullTag.startsWith('<!--')) continue;
    
    // Find the line number of this tag
    const prefix = template.substring(0, match.index);
    const lineNum = startLine + prefix.split('\n').length - 1;
    
    if (fullTag.startsWith('</')) {
        // Closing tag
        if (stack.length === 0) {
            console.log(`Line ${lineNum}: Unexpected closing tag </${tagName}> (Stack empty)`);
            continue;
        }
        
        const last = stack[stack.length - 1];
        if (last.tagName !== tagName) {
            console.log(`Line ${lineNum}: Unexpected closing tag </${tagName}>. Expected </${last.tagName}> from line ${last.line}`);
        } else {
            stack.pop();
        }
    } else {
        // Opening tag
        if (!fullTag.endsWith('/>') && !selfClosing.has(tagName)) {
            stack.push({ tagName, line: lineNum, fullTag });
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags remaining:");
    for (const item of stack) {
        console.log(`Line ${item.line}: <${item.tagName}>`);
    }
} else {
    console.log("All tags matched successfully!");
}
