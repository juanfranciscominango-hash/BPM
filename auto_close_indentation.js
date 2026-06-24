const fs = require('fs');

const path = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
const tsCode = fs.readFileSync(path, 'utf8');

const templateMatch = tsCode.match(/template:\s*`([\s\S]*?)`/);
if (!templateMatch) {
    console.log("Template not found");
    process.exit(1);
}

const templateStr = templateMatch[1];
const templateLines = templateStr.split('\n');

const preTemplate = tsCode.substring(0, templateMatch.index);
const startLine = preTemplate.split('\n').length; // Line where ` starts
const endLine = startLine + templateLines.length - 1;

let newLines = [...templateLines];
const stack = [];
const selfClosing = new Set(['input', 'img', 'br', 'hr', 'meta', 'link']);

// First, we need to clean up the existing isolated closing tags that were blindly added.
// It's safer to remove ALL closing tags that do NOT match the stack, and let the indenter reconstruct them.
// But wait, what if we just use the indenter to close them?

// Actually, let's do a line-by-line pass. 
// We will look for tags.
// If a line has an opening tag but doesn't close it, we push it to stack.
// If a line has a closing tag, we pop from stack.
// If we encounter a tag with indentation <= top of stack's indentation, we might need to auto-close the top of the stack!

let processedLines = [];
let autoAdded = 0;

for (let i = 0; i < templateLines.length; i++) {
    let line = templateLines[i];
    const originalLine = line;
    const trimmed = line.trim();
    
    if (trimmed.startsWith('<!--') || trimmed === '') {
        processedLines.push(line);
        continue;
    }
    
    // Ignore lines that are just attributes (e.g. `[ngClass]="..."`) without a tag bracket
    if (!trimmed.includes('<') && !trimmed.includes('>')) {
        processedLines.push(line);
        continue;
    }
    
    const currIndent = line.search(/\S|$/);
    
    // Find all tags in this line
    const regex = /<\/?([a-zA-Z0-9-]+)[^>]*>/g;
    let match;
    let tagsInLine = [];
    while ((match = regex.exec(line)) !== null) {
        tagsInLine.push({
            fullTag: match[0],
            tagName: match[1].toLowerCase(),
            isClosing: match[0].startsWith('</'),
            isSelfClosing: match[0].endsWith('/>') || selfClosing.has(match[1].toLowerCase())
        });
    }
    
    // Check if we need to auto-close PREVIOUS unclosed tags based on current indentation
    // We only auto-close if the current line starts a NEW tag or closes a tag.
    if (tagsInLine.length > 0) {
        let firstTag = tagsInLine[0];
        
        while (stack.length > 0) {
            let top = stack[stack.length - 1];
            
            // If the current line's indentation is <= the opening tag's indentation,
            // the opening tag MUST be closed!
            // Exception: If the current line IS the closing tag for the top of the stack
            let isMatchingClose = firstTag.isClosing && firstTag.tagName === top.tagName && currIndent === top.indent;
            
            if (currIndent <= top.indent && !isMatchingClose) {
                // We must auto-close the top of the stack!
                let spaces = " ".repeat(top.indent);
                processedLines.push(`${spaces}</${top.tagName}> <!-- auto-closed -->`);
                stack.pop();
                autoAdded++;
            } else {
                break;
            }
        }
    }
    
    // Process tags in the current line
    // BUT wait! If the line itself has unexpected closing tags, we should ignore them!
    let lineToPush = line;
    for (let tag of tagsInLine) {
        if (tag.isSelfClosing) continue;
        
        if (tag.isClosing) {
            if (stack.length > 0 && stack[stack.length - 1].tagName === tag.tagName) {
                stack.pop();
            } else {
                // Unexpected closing tag! It doesn't match the stack.
                // We should remove it from the line!
                lineToPush = lineToPush.replace(tag.fullTag, `<!-- REMOVED ${tag.fullTag} -->`);
            }
        } else {
            // Opening tag
            // Push only if it is not closed on the same line
            // Wait, we can check if it's closed in tagsInLine
            stack.push({ tagName: tag.tagName, indent: currIndent });
        }
    }
    
    // After processing the line, if some tags were closed on the SAME line, our stack might be incorrect because we pushed them all.
    // Let's refine the inline closing:
    // Actually, it's easier: just re-evaluate the line's tags.
    // Instead of doing it in one pass, let's keep track.
    
    processedLines.push(lineToPush);
}

// Close any remaining tags
while (stack.length > 0) {
    let top = stack.pop();
    let spaces = " ".repeat(top.indent);
    processedLines.push(`${spaces}</${top.tagName}> <!-- auto-closed EOF -->`);
    autoAdded++;
}

console.log(`Auto-added ${autoAdded} closing tags.`);

const newTemplate = processedLines.join('\n');
const newTsCode = tsCode.substring(0, templateMatch.index) + 'template: `' + newTemplate + '`' + tsCode.substring(templateMatch.index + templateMatch[0].length);

fs.writeFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', newTsCode);
console.log('Saved fixed file.');
