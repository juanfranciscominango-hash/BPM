const { Client } = require('pg');
const c = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});
async function run() {
    await c.connect();
    const res = await c.query("SELECT process_key, task_key, layout_json FROM screen_definition");
    for (const row of res.rows) {
        if (!row.layout_json) continue;
        const layout = JSON.parse(row.layout_json);
        if (!layout.tabs) continue;
        console.log(`${row.process_key} - ${row.task_key}: ${layout.tabs.map(t=>t.title).join(', ')}`);
    }
    await c.end();
}
run();
