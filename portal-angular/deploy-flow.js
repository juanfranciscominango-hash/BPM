const fs = require('fs');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Flujo_Credito_Completo" name="Flujo de Crédito" isExecutable="true">
    
    <bpmn:startEvent id="StartEvent_1" name="Inicio">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="Task_1" name="1. Revisar Perfil y Condicion" camunda:candidateGroups="ASESOR_CREDITO">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_2" name="2. Recibir y validar requisitos" camunda:candidateGroups="ASESOR_CREDITO">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_3" name="3. Validar consideraciones (Jefe)" camunda:candidateGroups="GERENTE_SUCURSAL">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_4" name="4. Validar consideraciones Autorizador" camunda:candidateGroups="COMITE_CREDITO">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_5" name="5. Digitar datos intervinientes" camunda:candidateGroups="OPERACIONES">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_Loop</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_6" name="6. Regularizar documentacion" camunda:candidateGroups="ASESOR_CREDITO">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_Loop</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:endEvent id="EndEvent_1" name="Fin">
      <bpmn:incoming>Flow_x</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="Task_4" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_4" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_5" targetRef="Task_6" />
    <bpmn:sequenceFlow id="Flow_Loop" sourceRef="Task_6" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_x" sourceRef="Task_5" targetRef="EndEvent_1" /> <!-- Just for visual completion, ignores loop reality for a sec -->

  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Flujo_Credito_Completo">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="150" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="250" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="400" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
        <dc:Bounds x="550" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
        <dc:Bounds x="700" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5">
        <dc:Bounds x="850" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6">
        <dc:Bounds x="850" y="250" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1000" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="186" y="118" />
        <di:waypoint x="250" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="350" y="118" />
        <di:waypoint x="400" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="118" />
        <di:waypoint x="550" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="650" y="118" />
        <di:waypoint x="700" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="800" y="118" />
        <di:waypoint x="850" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="900" y="158" />
        <di:waypoint x="900" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Loop_di" bpmnElement="Flow_Loop">
        <di:waypoint x="850" y="290" />
        <di:waypoint x="820" y="290" />
        <di:waypoint x="820" y="140" />
        <di:waypoint x="850" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_x_di" bpmnElement="Flow_x">
        <di:waypoint x="950" y="118" />
        <di:waypoint x="1000" y="118" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

async function deployFlow() {
    const baseUrl = 'http://localhost:9090/api/v1/processes';

    console.log("Saving Process Definition to DB...");
    const saveRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            key: "Flujo_Credito_Completo",
            name: "Flujo Negociación y Venta (Bizagi)",
            category: "Créditos",
            version: 1,
            bpmnXml: xml,
            metaEntityId: 12, // Binding to SOLICITUD_CREDITO table!
            status: "DRAFT"
        })
    });

    if (!saveRes.ok) {
        console.error("Failed to save", await saveRes.text());
        return;
    }

    const process = await saveRes.json();
    console.log(`Saved successfully. Process ID: ${process.id}`);

    console.log("Deploying to Flowable Engine...");
    const deployRes = await fetch(`${baseUrl}/${process.id}/deploy`, {
        method: 'POST'
    });

    if (!deployRes.ok) {
        console.error("Failed to deploy", await deployRes.text());
        return;
    }

    console.log("Deployed successfully to engine!");
}

deployFlow();
