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
    const res = await client.query("SELECT layout_json FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)' AND task_key = 'Activity_14xyo9t'");
    if (res.rows.length > 0) {
        require('fs').writeFileSync('layout_dump.json', res.rows[0].layout_json);
        console.log('Saved to layout_dump.json');
    }
    await client.end();
}
run().catch(console.error);
