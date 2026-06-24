const fs = require('fs');
const file = 'portal-angular/src/libs/design-tokens/scss/_tokens.colors.scss';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\$innova-primary:\s*#002147;/, '$innova-primary: #e30613;');
content = content.replace(/\$innova-secondary:\s*#1565C0;/, '$innova-secondary: #b30000;');
content = content.replace(/\$innova-blue-dark:\s*#001229;/, '$innova-blue-dark: #800000;');
content = content.replace(/\$innova-on-surface:\s*#002147;/, '$innova-on-surface: #e30613;');
content = content.replace(/\$innova-on-surface-variant:\s*#1565c0;/, '$innova-on-surface-variant: #b30000;');

// Some UI elements use dark versions, let's also update the dark theme colors if any:
content = content.replace(/\$dark-innova-blue-dark:\s*#3a7a8a;/, '$dark-innova-blue-dark: #800000;');
content = content.replace(/\$dark-innova-blue-light:\s*#6ba3b5;/, '$dark-innova-blue-light: #ff4d4d;');

fs.writeFileSync(file, content, 'utf8');
console.log('Updated tokens with regex');
