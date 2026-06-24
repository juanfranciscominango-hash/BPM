const fs = require('fs');
const file = 'portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(file, 'utf8');

// remove the last `}`
const lastBrace = content.lastIndexOf('}');
if (lastBrace !== -1) {
  content = content.substring(0, lastBrace);
}

const appendCode = `
  guardar() {
    this.guardarPropiedades();
  }

  getPreviewModelJson(): string {
    return JSON.stringify(this.previewModel, null, 2);
  }

  simButtonAction(field: any) {
    const action = field.config?.buttonAction;
    if (action === 'SUBMIT') {
      this.simSubmit();
    } else if (action === 'SAVE') {
      this.simNotificationType = 'success';
      this.simNotification = 'Datos guardados';
      setTimeout(() => this.simNotification = '', 3000);
    } else if (action === 'RESET') {
      this.simReset();
    } else if (action === 'CUSTOM') {
      const apiToExecute = field.config?.apiToExecute;
      if (!apiToExecute) {
        this.simNotificationType = 'warning';
        this.simNotification = 'Botón CUSTOM clicado (Sin API configurada)';
        setTimeout(() => this.simNotification = '', 3000);
        return;
      }
      this.simNotificationType = 'info';
      this.simNotification = \`Ejecutando API: \${apiToExecute}...\`;

      if (apiToExecute === 'APICLI') {
         let prefix = '';
         if (field.name.startsWith('codeudor_')) prefix = 'codeudor_';
         else if (field.name.startsWith('conyuge_')) prefix = 'conyuge_';
         else if (field.name.startsWith('apoderado_')) prefix = 'apoderado_';
         this.previewModel['interviniente_int_identificacion'] = this.previewModel[prefix + 'identificacion'];
      }

      this.apiManagerService.testApi(apiToExecute, this.previewModel).subscribe({
        next: (res) => {
          this.simNotificationType = 'success';
          this.simNotification = \`Éxito API: \${JSON.stringify(res).substring(0, 50)}...\`;
          if (res && typeof res === 'object') {
            let prefix = '';
            if (field.name.startsWith('codeudor_')) prefix = 'codeudor_';
            else if (field.name.startsWith('conyuge_')) prefix = 'conyuge_';
            else if (field.name.startsWith('apoderado_')) prefix = 'apoderado_';

            const prefixedRes: any = {};
            for (let key in res) {
               let val = res[key];
               if (val === 'true') val = true;
               if (val === 'false') val = false;
               prefixedRes[prefix + key] = val;
            }
            
            const preserveTipoId = this.previewModel[prefix + 'tipo_identificacion'];
            const preserveId = this.previewModel[prefix + 'identificacion'];
            
            Object.assign(this.previewModel, prefixedRes);
            
            if (preserveTipoId) {
                this.previewModel[prefix + 'tipo_identificacion'] = preserveTipoId;
            } else {
                let rawTipoId = this.previewModel[prefix + 'tipo_identificacion'];
                if (rawTipoId === 'C' || rawTipoId === 'CEDULA') this.previewModel[prefix + 'tipo_identificacion'] = 'CEDULA';
                else if (rawTipoId === 'R' || rawTipoId === 'RUC') this.previewModel[prefix + 'tipo_identificacion'] = 'RUC';
                else if (rawTipoId === 'P' || rawTipoId === 'PASAPORTE') this.previewModel[prefix + 'tipo_identificacion'] = 'PASAPORTE';
            }
            if (preserveId) {
                this.previewModel[prefix + 'identificacion'] = preserveId;
            }
            
            const estadoCivilKey = prefix === '' ? 'estado_civil_solicitante' : prefix + 'estado_civil';
            const tieneConyugeKey = prefix === '' ? 'tiene_conyuge' : prefix + 'tiene_conyuge';
            
            let estadoCivilVal = this.previewModel[estadoCivilKey] || this.previewModel[prefix + 'interviniente_int_estado_civil'] || this.previewModel['estado_civil_solicitante'];
            
            if (estadoCivilVal) {
                const upper = String(estadoCivilVal).toUpperCase();
                this.previewModel[prefix + 'estado_civil'] = upper; 
                if (upper === 'CASADO' || upper === 'UNIÓN LIBRE' || upper === 'UNION LIBRE') {
                    this.previewModel[tieneConyugeKey] = true;
                }
            }

            const apiFailed = res.mensaje && res.mensaje.includes('no encontrado');
            if (this.layout && this.layout.tabs) {
              for (const tab of this.layout.tabs) {
                for (const section of tab.sections) {
                  if (section.fields.includes(field)) {
                    section.fields.forEach((f: any) => {
                       if (f !== field && f.name !== (prefix + 'tipo_identificacion') && f.name !== (prefix + 'identificacion')) {
                          f.readOnly = !apiFailed;
                       }
                    });
                    this.simNotification = apiFailed 
                      ? 'API no encontró datos. Se habilitó la edición.'
                      : 'Datos cargados. Campos bloqueados.';
                  }
                }
              }
            }
            
            this.cdr.detectChanges();
          }
          setTimeout(() => {
             this.simNotification = '';
             this.cdr.detectChanges();
          }, 4000);
        },
        error: (err) => {
          this.simNotificationType = 'warning';
          this.simNotification = \`Error API: \${err.message}\`;
          setTimeout(() => this.simNotification = '', 3000);
        }
      });
    } else {
      this.simNotificationType = 'warning';
      this.simNotification = \`Acción desconocida: \${action}\`;
      setTimeout(() => this.simNotification = '', 3000);
    }
  }

  simSubmit() {
    if (this.simGetValidationErrors().length > 0) {
      this.simNotificationType = 'warning';
      this.simNotification = 'Hay errores de validación. Revisa el formulario.';
      setTimeout(() => this.simNotification = '', 3000);
      return;
    }
    this.simSubmitted = true;
    this.simNotificationType = 'success';
    this.simNotification = 'Formulario enviado con éxito (Simulación).';
    setTimeout(() => {
      this.simSubmitted = false;
      this.simNotification = '';
    }, 4000);
  }

  simReset() {
    this.previewModel = {};
    this.gridRowsMap = {};
    this.uploadedMockFiles = {};
    this.simNotificationType = 'info';
    this.simNotification = 'Formulario reiniciado.';
    setTimeout(() => this.simNotification = '', 3000);
  }
}
`;

content += appendCode;
fs.writeFileSync(file, content, 'utf8');
console.log('Appended missing methods successfully.');
