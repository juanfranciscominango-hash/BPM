const { Client } = require('pg'); 
const fs = require('fs');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432}); 
async function run() { 
    await client.connect(); 
    const res = await client.query("SELECT bytes_ FROM act_re_decision_def JOIN act_ge_bytearray ON act_re_decision_def.deployment_id_ = act_ge_bytearray.deployment_id_ WHERE act_re_decision_def.key_ = 'matriz_aprobacion' AND act_ge_bytearray.name_ LIKE '%.dmn'"); 
    if(res.rows.length > 0) {
        console.log("Deployed DMN XML:");
        console.log(res.rows[0].bytes_.toString('utf8'));
    } else {
        console.log("DMN not found in engine tables");
    }
    await client.end(); 
} 
run().catch(console.error);
