const fs = require('fs');
const file = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the start: 
// 3409:       { id: 3, nombre: `${label} - Registro de Prueba C` }
let startIdx = lines.findIndex(l => l.includes('{ id: 3, nombre: `${label} - Registro de Prueba C` }'));

// Find the end:
// simTotalFields(): number {
let endIdx = lines.findIndex(l => l.includes('simTotalFields(): number {'));

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `    ];
  }

  uploadMock(fieldName: string) {
    const mockNames = ['contrato_firmado.pdf', 'identificacion_cliente.png', 'solicitud_analisis.pdf', 'balance_general.xlsx'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    this.uploadedMockFiles[fieldName] = randomName;
    alert(\`[PREVIEW] Mock subida de archivo '\${randomName}' exitosa.\`);
  }

  addMockGridRow(fieldName: string) {
    if (!this.mockGridData[fieldName]) {
      this.mockGridData[fieldName] = [];
    }
    const idx = this.mockGridData[fieldName].length + 1;
    this.mockGridData[fieldName].push({
      col1: \`Fila \${idx} - Campo A\`,
      col2: \`Fila \${idx} - Campo B\`,
      col3: \`Fila \${idx} - Campo C\`
    });
  }

`.split('\n');

  lines.splice(startIdx + 1, endIdx - startIdx - 1, ...replacement);
  // remove the trailing newline artifact
  if (lines[lines.length - 1] === '') {
     lines.pop();
  }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Fixed successfully. startIdx=' + startIdx + ', endIdx=' + endIdx);
} else {
  console.log('Could not find start or end index.');
}
