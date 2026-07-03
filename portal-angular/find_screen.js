const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT id, name, layout_json FROM screen_definition WHERE layout_json LIKE '%Simulación crédito análista%'");
        console.table(res.rows.map(r => ({id: r.id, name: r.name, layout_len: r.layout_json.length})));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
