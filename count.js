const fs = require('fs');
let content = fs.readFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', 'utf8');
let template = content.substring(content.indexOf('template: `'), content.indexOf('`\n  })'));
let openDivs = (template.match(/<div(\s|>)/g) || []).length;
let closeDivs = (template.match(/<\/div>/g) || []).length;
console.log('Open div:', openDivs);
console.log('Close div:', closeDivs);
console.log('Difference:', openDivs - closeDivs);
