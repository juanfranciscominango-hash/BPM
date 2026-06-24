const fs = require('fs');

const file = 'portal-angular/src/libs/design-tokens/scss/_tokens.colors.scss';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `// -----------------------------------------------------------------------------
// COLORES PRIMARIOS InnovaConsulting (OPCIÓN 1: CONFIANZA CORPORATIVA)
// -----------------------------------------------------------------------------
$innova-primary: #002147;      // Deep Navy
$innova-secondary: #1565C0;    // Slate Blue
$innova-accent: #D4AF37;       // Matte Gold
$innova-blue: $innova-primary;
$innova-blue-light: $innova-secondary;
$innova-blue-dark: #001229;`;

const replacement = `// -----------------------------------------------------------------------------
// COLORES PRIMARIOS (COOPERATIVA CHIBULEO)
// -----------------------------------------------------------------------------
$innova-primary: #e30613;      // Chibuleo Red
$innova-secondary: #b30000;    // Dark Red
$innova-accent: #ffffff;       // White
$innova-blue: $innova-primary; // Mantener variables internas
$innova-blue-light: $innova-secondary;
$innova-blue-dark: #800000;`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Tokens updated to Chibuleo colors.');
