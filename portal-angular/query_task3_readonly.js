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
    const res = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Task_3'");
    const j = JSON.parse(res.rows[0].layout_json);
    const infoGeneral = j.tabs[0].sections[0];
    console.log("Section:", infoGeneral.title);
    console.log(infoGeneral.fields.map(f => f.name + ': readOnly=' + f.readOnly));
    await client.end();
}

run().catch(console.error);
