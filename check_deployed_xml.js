const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT bpmn_xml FROM process_definition WHERE key = 'Flujo_Credito_Completo' ORDER BY id DESC LIMIT 1");
    if (res.rows.length > 0) {
        const xml = res.rows[0].bpmn_xml;
        const lines = xml.split('\n');
        const task1Index = lines.findIndex(l => l.includes('Revisar Perfil y Condicion'));
        if (task1Index >= 0) {
            console.log(lines.slice(task1Index, task1Index + 30).join('\n'));
        } else {
            console.log("Task not found in XML");
        }
    } else {
        console.log("Process not found");
    }
    client.end();
});
