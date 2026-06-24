const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, task_key, process_key FROM screen_definition WHERE id IN (20, 24)");
    console.log("Screens Task_2:", res.rows);
    client.end();
});
