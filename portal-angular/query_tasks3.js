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
    // Get Task_2 layouts
    const res = await client.query("SELECT process_key, task_key, layout_json FROM screen_definition WHERE task_key IN ('Task_2', 'Task_3', 'Activity_14xyo9t')");
    res.rows.forEach(r => {
        console.log(`=== ${r.process_key} - ${r.task_key} ===`);
        console.log(r.layout_json);
    });
    await client.end();
}

run().catch(console.error);
