const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT id, name, task_key, process_key, layout_json FROM screen_definition");
        console.log("Total screens:", res.rows.length);
        for(const r of res.rows) {
            console.log(`ID: ${r.id}, Name: ${r.name}, Task: ${r.task_key}, Process: ${r.process_key}, Layout length: ${r.layout_json ? r.layout_json.length : 0}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
