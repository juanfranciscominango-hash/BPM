const fs = require('fs');

let xml = fs.readFileSync('flujo_corregido.bpmn', 'utf8');

// Add flowable namespace if not present
if (!xml.includes('xmlns:flowable')) {
    xml = xml.replace('xmlns:camunda="http://camunda.org/schema/1.0/bpmn"', 'xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:flowable="http://flowable.org/bpmn"');
}

// Replace businessRuleTask with DMN serviceTask format
const oldBRT = /<bpmn:businessRuleTask id="BusinessRuleTask_1" name="Evaluacion Matriz de aprobacion" camunda:decisionRef="MatrizAprobacion">([\s\S]*?)<\/bpmn:businessRuleTask>/;
const newBRT = `<bpmn:serviceTask id="BusinessRuleTask_1" name="Evaluacion Matriz de aprobacion" flowable:type="dmn">
      <bpmn:extensionElements>
        <flowable:field name="decisionTableReferenceKey">
          <flowable:string><![CDATA[MatrizAprobacion]]></flowable:string>
        </flowable:field>
      </bpmn:extensionElements>
$1</bpmn:serviceTask>`;

xml = xml.replace(oldBRT, newBRT);

fs.writeFileSync('flujo_corregido.bpmn', xml);
console.log('Fixed DMN task format in BPMN');
