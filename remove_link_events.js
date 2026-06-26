const fs = require('fs');

let xml = fs.readFileSync('flujo_corregido.bpmn', 'utf8');

// 1. Point Flow_0fydy16 directly to Activity_14xyo9t
xml = xml.replace('<bpmn:sequenceFlow id="Flow_0fydy16" name="SI" sourceRef="Gateway_1qdmsic" targetRef="Event_05cabwy">',
                  '<bpmn:sequenceFlow id="Flow_0fydy16" name="SI" sourceRef="Gateway_1qdmsic" targetRef="Activity_14xyo9t">');

// 2. Remove Event_05cabwy and Event_08vscmp
xml = xml.replace(/<bpmn:intermediateThrowEvent id="Event_05cabwy" name="A">[\s\S]*?<\/bpmn:intermediateThrowEvent>/, '');
xml = xml.replace(/<bpmn:intermediateCatchEvent id="Event_08vscmp" name="A">[\s\S]*?<\/bpmn:intermediateCatchEvent>/, '');

// 3. Remove Flow_10thcqd
xml = xml.replace('<bpmn:sequenceFlow id="Flow_10thcqd" sourceRef="Event_08vscmp" targetRef="Activity_14xyo9t" />', '');

// 4. Change Activity_14xyo9t incoming from Flow_10thcqd to Flow_0fydy16
xml = xml.replace('<bpmn:incoming>Flow_10thcqd</bpmn:incoming>', '<bpmn:incoming>Flow_0fydy16</bpmn:incoming>');

// 5. Remove Event_05cabwy and Event_08vscmp from the Diagram section if they exist
xml = xml.replace(/<bpmndi:BPMNShape id="Event_1xsmacl_di" bpmnElement="Event_05cabwy">[\s\S]*?<\/bpmndi:BPMNShape>/, '');
xml = xml.replace(/<bpmndi:BPMNShape id="Event_1yrn58d_di" bpmnElement="Event_08vscmp">[\s\S]*?<\/bpmndi:BPMNShape>/, '');
xml = xml.replace(/<bpmndi:BPMNEdge id="Flow_10thcqd_di" bpmnElement="Flow_10thcqd">[\s\S]*?<\/bpmndi:BPMNEdge>/, '');

fs.writeFileSync('flujo_corregido.bpmn', xml);
console.log('Link events removed and replaced with direct sequence flow.');
