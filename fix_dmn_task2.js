const fs = require('fs');

let xml = fs.readFileSync('flujo_corregido.bpmn', 'utf8');

// Add flowable namespace if not present
if (!xml.includes('xmlns:flowable')) {
    xml = xml.replace('xmlns:camunda="http://camunda.org/schema/1.0/bpmn"', 'xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:flowable="http://flowable.org/bpmn"');
}

xml = xml.replace(/<bpmn:businessRuleTask id="BusinessRuleTask_1" name="Evaluacion Matriz de aprobacion"[\s\S]*?camunda:decisionRef="MatrizAprobacion">/g, 
`<bpmn:serviceTask id="BusinessRuleTask_1" name="Evaluacion Matriz de aprobacion" flowable:type="dmn">
      <bpmn:extensionElements>
        <flowable:field name="decisionTableReferenceKey">
          <flowable:string><![CDATA[MatrizAprobacion]]></flowable:string>
        </flowable:field>
      </bpmn:extensionElements>`);

xml = xml.replace(/<\/bpmn:businessRuleTask>/g, `<\/bpmn:serviceTask>`);

fs.writeFileSync('flujo_corregido.bpmn', xml);
console.log('Fixed DMN task format in BPMN');
