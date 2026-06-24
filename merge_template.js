const fs = require('fs');

const currentPath = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
const backupPath = 'C:/ProyectosJava/BMP - Copy/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';

const currentTs = fs.readFileSync(currentPath, 'utf8');
const backupTs = fs.readFileSync(backupPath, 'utf8');

const getTemplate = (code) => {
    const match = code.match(/template:\s*`([\s\S]*?)`/);
    return match ? match[1] : null;
};

const currentTemplate = getTemplate(currentTs);
const backupTemplate = getTemplate(backupTs);

console.log(`Current TS size: ${currentTs.length}, Template size: ${currentTemplate ? currentTemplate.length : 0}`);
console.log(`Backup TS size:  ${backupTs.length}, Template size: ${backupTemplate ? backupTemplate.length : 0}`);

if (backupTemplate) {
    // We will merge backup template into current TS
    const match = currentTs.match(/template:\s*`([\s\S]*?)`/);
    const newTs = currentTs.substring(0, match.index) + 'template: `' + backupTemplate + '`' + currentTs.substring(match.index + match[0].length);
    fs.writeFileSync('c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.merged.ts', newTs);
    console.log('Merged file written to disenador-pantallas.component.merged.ts');
}
