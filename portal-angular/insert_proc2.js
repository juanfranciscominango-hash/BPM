const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        await client.query("INSERT INTO process_definition (key, name, version, status, bpmn_xml) VALUES ('Flujo_Credito_Completo', 'Flujo de Crédito Completo', 1, 'DEPLOYED', '')");
        console.log("Inserted");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
