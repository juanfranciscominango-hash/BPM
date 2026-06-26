const fs = require('fs');

let xml = fs.readFileSync('flujo_corregido.bpmn', 'utf8');

// 1. Add Business Rule Task and new User Tasks before </bpmn:process>
const newNodes = `
    <bpmn:businessRuleTask id="BusinessRuleTask_1" name="Evaluacion Matriz de aprobacion" camunda:decisionRef="MatrizAprobacion">
      <bpmn:incoming>Flow_08n473g</bpmn:incoming>
      <bpmn:outgoing>Flow_ToGateway</bpmn:outgoing>
    </bpmn:businessRuleTask>
    <bpmn:userTask id="Task_7" name="Validar Consideraciones (asesor)" camunda:candidateGroups="ASESOR_CREDITO">
      <bpmn:incoming>Flow_ToAsesor</bpmn:incoming>
    </bpmn:userTask>
    <bpmn:userTask id="Task_8" name="Validar consideraciones (sub gerente)" camunda:candidateGroups="SUBGERENTE_CREDITO">
      <bpmn:incoming>Flow_ToSubgerente</bpmn:incoming>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_ToGateway" sourceRef="BusinessRuleTask_1" targetRef="Gateway_0j24kuk" />
    <bpmn:sequenceFlow id="Flow_ToAsesor" name="Asesor" sourceRef="Gateway_0j24kuk" targetRef="Task_7">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${rolAprobador == 'ASESOR_CREDITO'}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_ToSubgerente" name="Subgerente" sourceRef="Gateway_0j24kuk" targetRef="Task_8">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${rolAprobador == 'SUBGERENTE_CREDITO'}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_ToGerente" name="Gerente" sourceRef="Gateway_0j24kuk" targetRef="Task_4">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${rolAprobador == 'GERENTE_CREDITO'}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
  </bpmn:process>
`;

xml = xml.replace('</bpmn:process>', newNodes);

// 2. Change Flow_08n473g target to BusinessRuleTask_1
xml = xml.replace('<bpmn:sequenceFlow id="Flow_08n473g" sourceRef="Activity_14xyo9t" targetRef="Gateway_0j24kuk" />', '<bpmn:sequenceFlow id="Flow_08n473g" sourceRef="Activity_14xyo9t" targetRef="BusinessRuleTask_1" />');

// 3. Update Gateway_0j24kuk incoming/outgoing
xml = xml.replace(
  /<bpmn:exclusiveGateway id="Gateway_0j24kuk">[\s\S]*?<\/bpmn:exclusiveGateway>/,
  `<bpmn:exclusiveGateway id="Gateway_0j24kuk" name="Rol Aprobador">
      <bpmn:incoming>Flow_ToGateway</bpmn:incoming>
      <bpmn:outgoing>Flow_055ibiz</bpmn:outgoing>
      <bpmn:outgoing>Flow_ToAsesor</bpmn:outgoing>
      <bpmn:outgoing>Flow_ToSubgerente</bpmn:outgoing>
      <bpmn:outgoing>Flow_ToGerente</bpmn:outgoing>
    </bpmn:exclusiveGateway>`
);

// 4. Update Flow_055ibiz to have condition for Jefe
xml = xml.replace('<bpmn:sequenceFlow id="Flow_055ibiz" sourceRef="Gateway_0j24kuk" targetRef="Task_3" />', `<bpmn:sequenceFlow id="Flow_055ibiz" name="Jefe Credito" sourceRef="Gateway_0j24kuk" targetRef="Task_3">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${rolAprobador == 'JEFE_CREDITO'}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>`);
    
// 5. Connect Task_4 incoming flow
xml = xml.replace('<bpmn:userTask id="Task_4" name="Validar consideraciones Autorizador" camunda:candidateGroups="COMITE_CREDITO" />', `<bpmn:userTask id="Task_4" name="Validar Consideracion es (gerente)" camunda:candidateGroups="GERENTE_CREDITO">
      <bpmn:incoming>Flow_ToGerente</bpmn:incoming>
    </bpmn:userTask>`);

// Fix COMITE_CREDITO to GERENTE_CREDITO per the user's diagram. Actually the DMN says "GERENTE_CREDITO"

fs.writeFileSync('flujo_corregido.bpmn', xml);
console.log('BPMN updated');
