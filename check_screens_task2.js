const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, task_key FROM screen_definition WHERE task_key IN ('Task_1', 'Task_2')");
    console.log("Screens:", res.rows);
    client.end();
});
