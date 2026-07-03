const {Client} = require('pg');
const fs = require('fs');

const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const bpmnXml = fs.readFileSync('c:/ProyectosJava/BMP/backend/src/main/resources/processes/flujo_corregido.bpmn20.xml', 'utf8');
        
        // Update process_definition with the correct XML
        await client.query("UPDATE process_definition SET bpmn_xml = $1 WHERE key = 'flujo_negociacion_y_venta_(bizagi)'", [bpmnXml]);
        
        // Update screen_definition task keys so they don't lose their configured screens
        await client.query("UPDATE screen_definition SET task_key = 'Task_7' WHERE task_key = 'Activity_0c0o6m4'");
        await client.query("UPDATE screen_definition SET task_key = 'Task_3' WHERE task_key = 'Activity_1b63zyk'");
        await client.query("UPDATE screen_definition SET task_key = 'Task_8' WHERE task_key = 'Activity_1l39z22'");
        await client.query("UPDATE screen_definition SET task_key = 'Task_4' WHERE task_key = 'Activity_11vw4pv'");
        
        console.log("Database synchronized successfully!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
