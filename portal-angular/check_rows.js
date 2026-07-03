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
    const res = await client.query("SELECT id FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)' AND task_key = 'Activity_14xyo9t'");
    console.log('Rows count:', res.rowCount);
    res.rows.forEach(r => console.log('ID:', r.id));
    await client.end();
}
run().catch(console.error);
