const { Client } = require('pg');
const c = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});
async function run() {
    await c.connect();
    const res = await c.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Task_3'");
    const t = JSON.parse(res.rows[0].layout_json).tabs;
    console.log(t.map(x=>x.title));
    await c.end();
}
run();
