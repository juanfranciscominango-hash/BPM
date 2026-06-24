const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'ejecutor-pantallas', 'ejecutor-pantallas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const evaluateVisibilityRuleCode = `
  evaluateVisibilityRule(rule: string): boolean {
    if (!rule || !rule.trim()) return true;
    try {
      const keys = Object.keys(this.previewModel);
      const values = Object.values(this.previewModel);
      const fn = new Function(...keys, \`return \${rule};\`);
      return !!fn(...values);
    } catch (e) {
      return true;
    }
  }

  // Same logic as in designer`;

const getGridColumnsCode = `  getGridColumns(field: any): any[] {
    const selected: any[] = field?.config?.selectedColumns;
    const id = Number(field?.config?.dataSourceEntityId);

    let physicalCols: any[] = [];
    if (!isNaN(id) && id > 0) {
      if (this.physicalColumnsMap[id] === undefined || this.physicalColumnsMap[id] === null) {
        this.physicalColumnsMap[id] = [];
        this.metaService.listarAtributos(id).subscribe(data => {
          const mapped = data.map((a: any) => ({
            name: a.name, type: a.type, label: a.label || a.name, parametricTableId: a.parametricTableId
          }));
          this.physicalColumnsMap[id] = mapped;
          this.cdr.detectChanges();
        });
      }
      physicalCols = this.physicalColumnsMap[id] || [];
    }

    if (selected && selected.length > 0) {
      const physicalState = physicalCols ? physicalCols.length : 0;
      const visibilityHash = selected.map((c: any) => c.visibilityRule ? (this.evaluateVisibilityRule(c.visibilityRule) ? '1' : '0') : '1').join('-') + "_" + physicalState;
      
      if (field._cachedVisibilityHash !== visibilityHash) {
        field._cachedVisibilityHash = visibilityHash;
        field._cachedVisibleColumns = selected.filter((c: any) => !c.visibilityRule || this.evaluateVisibilityRule(c.visibilityRule))
          .map((c: any) => {
            const pcol = physicalCols.find((pc: any) => pc.name === c.name);
            return {
              name: c.name,
              type: pcol ? pcol.type : c.type,
              label: c.label || c.name,
              parametricTableId: pcol ? pcol.parametricTableId : c.parametricTableId,
              displayField: c.displayField,
              visibilityRule: c.visibilityRule,
              options: c.options
            };
          });
      }
      return field._cachedVisibleColumns || [];
    }

    return physicalCols;
  }`;

// Replace evaluateVisibilityRule
if (!tsContent.includes('evaluateVisibilityRule(')) {
  tsContent = tsContent.replace('// Same logic as in designer', evaluateVisibilityRuleCode);
}

// Replace getGridColumns
const regex = /getGridColumns\(field: any\): any\[\] \{[\s\S]*?return this\.physicalColumnsMap\[id\] \|\| \[\];\s*\}/;
tsContent = tsContent.replace(regex, getGridColumnsCode);

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Successfully patched ejecutor-pantallas.component.ts');
