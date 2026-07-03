const {Client} = require('pg');
const fs = require('fs');

const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const originalXml = fs.readFileSync('c:/ProyectosJava/BMP/portal-angular/recovered_bpmn.xml', 'utf8');
        await client.query("UPDATE process_definition SET bpmn_xml = $1 WHERE key = 'Flujo_Credito_Completo'", [originalXml]);
        console.log("Restored XML into Flujo_Credito_Completo!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
