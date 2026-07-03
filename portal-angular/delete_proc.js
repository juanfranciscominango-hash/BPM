const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        await client.query("DELETE FROM process_definition WHERE key = 'flujo_negociacion_y_venta_(bizagi)'");
        await client.query("DELETE FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)'");
        console.log("Deleted old process and associated screens");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
