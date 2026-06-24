const fs = require('fs');

const filePath = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

// First, undo the replace_empty.js modifications
let lines = content.split('\n');
for(let i=31; i<3300; i++) {
  if (lines[i] && /^ +<\/div>\r?$/.test(lines[i])) {
    lines[i] = lines[i].replace(/<\/div>/, '');
  }
}
content = lines.join('\n');

// Find the template string
const templateRegex = /template:\s*`([\s\S]*?)`(?=\s*,?\s*\r?\n\s*\})/;
const match = content.match(templateRegex);

if (!match) {
    console.error("Could not find template string");
    process.exit(1);
}

let template = match[1];

// HTML parsing and auto-closing tags
// We will tokenize the HTML into tags and text.
const tokens = [];
let currentIndex = 0;

// regex to match tags. Group 1: isClosing, Group 2: tagName, Group 3: attributes
const tagRegex = /<\s*(\/)?\s*([a-zA-Z0-9\-]+)([^>]*?)>/g;

let lastIndex = 0;
let parsed = "";
let stack = [];

// Tags that don't need closing
const voidElements = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

let resultTemplate = "";

let execResult;
while ((execResult = tagRegex.exec(template)) !== null) {
    const isClosing = !!execResult[1];
    const tagName = execResult[2].toLowerCase();
    const isSelfClosing = execResult[3].trim().endsWith('/') || voidElements.has(tagName);
    const fullTag = execResult[0];
    const matchStart = execResult.index;
    
    // Add text before tag
    resultTemplate += template.substring(lastIndex, matchStart);
    
    if (isClosing) {
        // If it's a closing tag, check stack
        // Find matching tag in stack
        let stackIndex = -1;
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i] === tagName) {
                stackIndex = i;
                break;
            }
        }
        
        if (stackIndex !== -1) {
            // Auto-close any tags above the matched one
            for (let i = stack.length - 1; i > stackIndex; i--) {
                resultTemplate += `</${stack[i]}>\n`;
            }
            stack.length = stackIndex; // Pop the matched tag and everything above
            resultTemplate += fullTag;
        } else {
            // Unexpected closing tag, ignore it! (This fixes extra tags)
            // Or maybe append it if we want to be safe? No, ignoring it fixes extra </div>
            // Actually, let's log it.
            console.log("Ignoring unexpected closing tag:", fullTag);
        }
    } else {
        // Opening tag
        resultTemplate += fullTag;
        if (!isSelfClosing) {
            stack.push(tagName);
        }
    }
    
    lastIndex = tagRegex.lastIndex;
}

// Add remaining text
resultTemplate += template.substring(lastIndex);

// Close any remaining open tags
while (stack.length > 0) {
    resultTemplate += `\n</${stack.pop()}>`;
}

// Replace in content
const newContent = content.substring(0, match.index) + 
                   content.substring(match.index, match.index + match[0].indexOf('`') + 1) + 
                   resultTemplate + 
                   '`';

fs.writeFileSync(filePath, newContent);
console.log("Template parsed and auto-closed.");
