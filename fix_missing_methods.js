const fs = require('fs');
const file = 'c:/ProyectosJava/BMP/portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `this.apisConfiguradas.unshift({ id: -1, name: 'CALCULAR_CUOTA_ANALISIS', method: 'LOCAL', url: '' });\r\n    });\r\n  }`;

const insertStr = `
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
`;

const idx = content.indexOf(`name: 'CALCULAR_CUOTA_ANALISIS', method: 'LOCAL', url: '' });`);
if (idx !== -1) {
    const endIdx = content.indexOf(`  }`, idx);
    if (endIdx !== -1) {
        content = content.substring(0, endIdx + 3) + insertStr + content.substring(endIdx + 3);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Injected missing methods.');
    } else {
        console.log('endIdx not found');
    }
} else {
    console.log('search string not found');
}
