const {Client} = require('pg');
const fs = require('fs');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE id = 27");
        if (res.rows.length > 0) {
            let layout = JSON.parse(res.rows[0].layout_json);
            
            // Log the structure of the first tab (Información General)
            console.log(JSON.stringify(layout.tabs[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
