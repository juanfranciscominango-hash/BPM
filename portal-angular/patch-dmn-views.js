const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'src', 'app', 'features', 'plataforma', 'reglas', 'disenador-reglas.component.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newInitialXml = `  getInitialXml() {
    return \`<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="definitions" name="definitions" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="decision_credito" name="Evaluación de Crédito">
    <decisionTable id="decisionTable_1" hitPolicy="UNIQUE">
      <input id="input_ingresos" label="Ingresos Mensuales">
        <inputExpression id="expr_ingresos" typeRef="integer">
          <text>ingresos</text>
        </inputExpression>
      </input>
      <input id="input_historial" label="Historial Crediticio">
        <inputExpression id="expr_historial" typeRef="string">
          <text>historial</text>
        </inputExpression>
      </input>
      <output id="output_aprobacion" label="Aprobación Automática" name="aprobado" typeRef="boolean" />
      <rule id="rule_1">
        <description>Si gana bien y tiene buen historial, se aprueba</description>
        <inputEntry id="in_1_1"><text>&gt;= 1000</text></inputEntry>
        <inputEntry id="in_1_2"><text>"Bueno"</text></inputEntry>
        <outputEntry id="out_1_1"><text>true</text></outputEntry>
      </rule>
      <rule id="rule_2">
        <description>Si gana poco, se rechaza</description>
        <inputEntry id="in_2_1"><text>&lt; 1000</text></inputEntry>
        <inputEntry id="in_2_2"><text></text></inputEntry>
        <outputEntry id="out_2_1"><text>false</text></outputEntry>
      </rule>
      <rule id="rule_3">
        <description>Si tiene mal historial, se rechaza</description>
        <inputEntry id="in_3_1"><text></text></inputEntry>
        <inputEntry id="in_3_2"><text>"Malo"</text></inputEntry>
        <outputEntry id="out_3_1"><text>false</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="decision_credito">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>\`;
  }`;

// Replace getInitialXml
tsContent = tsContent.replace(/getInitialXml\(\) \{[\s\S]*?<\/definitions>`;\n  }/, newInitialXml);

// Add view opening logic for cargar
const cargarLogic = `this.modeler.importXML(rule.dmnXml || this.getInitialXml()).then(() => {
        console.log('DMN importado con éxito');
        this.openDecisionTable();
      })`;
tsContent = tsContent.replace(/this\.modeler\.importXML\(rule\.dmnXml \|\| this\.getInitialXml\(\)\)\.then\(\(\) => \{[^}]*\}\);/, cargarLogic);

// Add view opening logic for crearNueva
const crearNuevaLogic = `this.modeler.importXML(this.ruleDef.dmnXml).then(() => {
      this.openDecisionTable();
    });`;
tsContent = tsContent.replace(/this\.modeler\.importXML\(this\.ruleDef\.dmnXml\);/, crearNuevaLogic);

// Add openDecisionTable method
if (!tsContent.includes('openDecisionTable()')) {
  const methodCode = `
  openDecisionTable() {
    const views = this.modeler.getViews();
    if (views && views.length > 0) {
      const tableView = views.find((v: any) => v.type === 'decisionTable');
      if (tableView) {
        this.modeler.open(tableView);
      }
    }
  }

  getInitialXml`;
  tsContent = tsContent.replace('getInitialXml', methodCode);
}

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Successfully patched disenador-reglas.component.ts');
