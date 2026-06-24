const fs = require('fs');
const path = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

let content = fs.readFileSync(path, 'utf8');

// Replace sidebar label
content = content.replace(
    /<span class="lbl-ctrl" style="font-size:0\.75rem;">Análisis Crédito<\/span>/g,
    '<span class="lbl-ctrl" style="font-size:0.75rem;">Encabezado Credito</span>'
);

// Fallback if the font-size was 0.7rem in the first try
content = content.replace(
    /<span class="lbl-ctrl" style="font-size:0\.7rem;">Análisis Crédito<\/span>/g,
    '<span class="lbl-ctrl" style="font-size:0.75rem;">Encabezado Credito</span>'
);

// Replace canvas placeholder title
content = content.replace(
    /<h6 class="text-info fw-bold mb-0">Componente: Análisis de Crédito<\/h6>/g,
    '<h6 class="text-info fw-bold mb-0">Componente: Encabezado Credito</h6>'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Renamed successfully!");
