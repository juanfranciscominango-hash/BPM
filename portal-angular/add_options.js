const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `<option value="BUTTON">Botón de Acción</option>
                        </select>`;
const replacement = `<option value="BUTTON">Botón de Acción</option>
                          <option value="LABEL">Separador</option>
                          <option value="LINK">Enlace</option>
                          <option value="SIMULADOR">Simulador</option>
                          <option value="RESUMEN_CASO">Info General</option>
                        </select>`;

if (code.indexOf(target) > -1) {
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code, 'utf8');
    console.log("Added options to dropdown successfully.");
} else {
    console.log("Could not find the target to replace.");
}
