const fs = require('fs');
const path = require('path');

const file1 = path.join('portal-angular', 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.ts');
let content1 = fs.readFileSync(file1, 'utf8');

content1 = content1.replace(/#4f46e5/g, '#e30613');
content1 = content1.replace(/#7c3aed/g, '#b30000');
content1 = content1.replace(/#1e1b4b/g, '#800000');
content1 = content1.replace(/#4338ca/g, '#e30613');
content1 = content1.replace(/#312e81/g, '#800000');
content1 = content1.replace(/text-purple/g, 'text-danger');
content1 = content1.replace(/--indigo-gradient/g, '--chibuleo-gradient');

fs.writeFileSync(file1, content1, 'utf8');
console.log('Replaced purple with red in component TS/HTML.');

const file2 = path.join('portal-angular', 'src', 'app', 'features', 'plataforma', 'disenador-pantallas', 'disenador-pantallas.component.css');
if (fs.existsSync(file2)) {
    let content2 = fs.readFileSync(file2, 'utf8');
    content2 = content2.replace(/#4f46e5/g, '#e30613');
    content2 = content2.replace(/#7c3aed/g, '#b30000');
    content2 = content2.replace(/#1e1b4b/g, '#800000'); 
    content2 = content2.replace(/#4338ca/g, '#e30613'); 
    content2 = content2.replace(/#312e81/g, '#800000');
    content2 = content2.replace(/text-purple/g, 'text-danger');
    content2 = content2.replace(/--indigo-gradient/g, '--chibuleo-gradient');
    fs.writeFileSync(file2, content2, 'utf8');
    console.log('Replaced purple with red in CSS.');
}
