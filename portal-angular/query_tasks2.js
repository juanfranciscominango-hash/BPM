const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'INC_BPM_PLATFORM',
    password: 'Desarrollo',
    port: 5432
});

async function run() {
    await client.connect();
    const res = await client.query("SELECT process_key, task_key FROM screen_definition");
    console.log("Tasks and screens:", res.rows);
    
    // Also let's find which one has RESUMEN_CASO
    const res2 = await client.query("SELECT process_key, task_key FROM screen_definition WHERE layout_json LIKE '%RESUMEN_CASO%'");
    console.log("Tasks with RESUMEN_CASO:", res2.rows);
    await client.end();
}

run().catch(console.error);
