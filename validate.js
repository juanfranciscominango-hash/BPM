const fs = require('fs');
const xml = fs.readFileSync('C:/ProyectosJava/BMP/to_validate.xml', 'utf8');

let nodeRegex = /<bpmn:(?:userTask|task|startEvent|endEvent|intermediateThrowEvent|intermediateCatchEvent|exclusiveGateway|businessRuleTask) id="([^"]+)"/g;
let nodes = new Set();
let match;
while ((match = nodeRegex.exec(xml)) !== null) {
    nodes.add(match[1]);
}

let laneRefsRegex = /<bpmn:flowNodeRef>([^<]+)<\/bpmn:flowNodeRef>/g;
let refs = new Map();
while ((match = laneRefsRegex.exec(xml)) !== null) {
    let id = match[1];
    refs.set(id, (refs.get(id) || 0) + 1);
}

for (let id of nodes) {
    if (!refs.has(id)) console.log('Node without lane:', id);
    if (refs.get(id) > 1) console.log('Node in multiple lanes:', id);
}
