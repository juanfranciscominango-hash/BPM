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
    const res = await client.query("SELECT task_key, process_key, layout_json FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)'");
    res.rows.forEach(r => console.log(r.task_key, r.layout_json ? r.layout_json.substring(0, 100) : 'null'));
    await client.end();
}
run().catch(console.error);
