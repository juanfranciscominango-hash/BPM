const {Client} = require('pg');
const fs = require('fs');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Activity_0c0o6m4'");
        if(res.rows.length > 0) {
            console.log(res.rows[0].layout_json);
        } else {
            console.log('not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
