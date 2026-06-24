const fs = require('fs');
const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    // Read the fixed BPMN file
    const xml = fs.readFileSync('c:/ProyectosJava/BMP/flujo_corregido.bpmn', 'utf8');
    
    // Get deployment_id_ for the latest Flujo_Credito_Completo
    const procRes = await client.query("SELECT id_, deployment_id_ FROM act_re_procdef WHERE key_ = 'Flujo_Credito_Completo' ORDER BY version_ DESC LIMIT 1");
    if (procRes.rows.length > 0) {
        const depId = procRes.rows[0].deployment_id_;
        
        // Update the XML in bytearray
        await client.query("UPDATE act_ge_bytearray SET bytes_ = $1 WHERE deployment_id_ = $2 AND name_ LIKE '%.bpmn%'", [Buffer.from(xml, 'utf8'), depId]);
        console.log("Successfully updated the deployed XML in act_ge_bytearray for deployment " + depId);
    } else {
        console.log("Process not found");
    }
    client.end();
});
