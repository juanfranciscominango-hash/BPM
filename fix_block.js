const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(file, 'utf8');

const startStr = `this.apisConfiguradas.unshift({ id: -1, name: 'CALCULAR_CUOTA_ANALISIS', method: 'LOCAL', url: '' });`;
const endStr = `  addGridForEntity(entity: MetaEntity) {`;

const idxStart = content.indexOf(startStr);
const idxEnd = content.indexOf(endStr, idxStart);

if (idxStart !== -1 && idxEnd !== -1) {
    const cleanBlock = `this.apisConfiguradas.unshift({ id: -1, name: 'CALCULAR_CUOTA_ANALISIS', method: 'LOCAL', url: '' });
    });
  }

  ngOnDestroy() {
  }

  addTab() {
    if (!this.layout) this.layout = { tabs: [], validations: [], actions: [] };
    if (!this.layout.tabs) this.layout.tabs = [];
    this.layout.tabs.push({ title: 'Nueva Pestaña', sections: [] });
    this.activeTabIdx = this.layout.tabs.length - 1;
  }

  addSection() {
    if (!this.layout.tabs || this.layout.tabs.length === 0) {
      this.addTab();
    }
    const tabIdx = this.activeTabIdx >= 0 ? this.activeTabIdx : 0;
    const tab = this.layout.tabs[tabIdx];
    if (!tab.sections) tab.sections = [];
    tab.sections.push({ title: 'Nueva Sección', fields: [] });
  }

  addGenericControl(controlType: string) {
    if (!this.layout.tabs || this.layout.tabs.length === 0) {
      this.addTab();
    }
    const tabIdx = this.activeTabIdx >= 0 ? this.activeTabIdx : 0;
    const tab = this.layout.tabs[tabIdx];
    
    if (!tab.sections || tab.sections.length === 0) {
      this.addSection();
    }
    
    const lastSection = tab.sections[tab.sections.length - 1];
    
    let count = this.getControlCount(controlType) + 1;
    let name = controlType + '_' + count;
    let label = '';
    let type = 'string';
    
    switch (controlType) {
      case 'TEXTBOX':
        label = 'Texto ' + count;
        break;
      case 'NUMBER':
        label = 'Número ' + count;
        type = 'number';
        break;
      case 'MONEY':
        label = 'Moneda ' + count;
        type = 'number';
        break;
      case 'DATE':
        label = 'Fecha ' + count;
        type = 'date';
        break;
      case 'YESNO':
        label = 'Booleano ' + count;
        type = 'boolean';
        break;
      case 'COMBO':
        label = 'Selector ' + count;
        break;
      case 'GRID':
        label = 'Tabla ' + count;
        type = 'grid';
        break;
      case 'FILEUPLOAD':
        label = 'Archivo ' + count;
        type = 'file';
        break;
      case 'IMAGE':
        label = 'Imagen ' + count;
        type = 'image';
        break;
      case 'LABEL':
        label = 'Separador ' + count;
        type = 'LABEL';
        break;
      case 'BUTTON':
        label = 'Botón ' + count;
        type = 'BUTTON';
        break;
      case 'SIMULADOR':
        label = 'Simulador de Crédito';
        type = 'SIMULADOR';
        break;
      case 'LINK':
        label = 'Enlace ' + count;
        type = 'LINK';
        break;
      case 'RESUMEN_CASO':
        label = 'Info General';
        type = 'RESUMEN_CASO';
        break;
    }
    
    const newField = {
      name,
      label,
      type,
      controlType,
      cols: 6,
      required: false,
      readOnly: false,
      defaultValue: '',
      config: {
        dataSourceEntityId: null,
        displayField: 'nombre',
        valueField: 'id',
        buttonAction: controlType === 'BUTTON' ? 'SAVE' : null,
        buttonStyle: controlType === 'BUTTON' ? 'btn-primary' : null
      }
    };
    
    lastSection.fields.push(newField);
    this.activeField = newField;
  }

`;
    content = content.substring(0, idxStart) + cleanBlock + content.substring(idxEnd);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed block successfully!');
} else {
    console.log('Could not find start or end bounds.');
}
