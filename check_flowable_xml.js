const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    // Get deployment_id_ for the latest Flujo_Credito_Completo
    const procRes = await client.query("SELECT id_, deployment_id_ FROM act_re_procdef WHERE key_ = 'Flujo_Credito_Completo' ORDER BY version_ DESC LIMIT 1");
    if (procRes.rows.length > 0) {
        const depId = procRes.rows[0].deployment_id_;
        // Get the XML from bytearray
        const byteRes = await client.query("SELECT bytes_ FROM act_ge_bytearray WHERE deployment_id_ = $1 AND name_ LIKE '%.bpmn%'", [depId]);
        if (byteRes.rows.length > 0) {
            const xml = byteRes.rows[0].bytes_.toString('utf8');
            const lines = xml.split('\n');
            const task1Index = lines.findIndex(l => l.includes('Revisar Perfil y Condicion'));
            if (task1Index >= 0) {
                console.log(lines.slice(task1Index, task1Index + 30).join('\n'));
            } else {
                console.log("Task not found in XML");
            }
        }
    }
    client.end();
});
