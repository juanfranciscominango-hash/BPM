const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res30 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        let layout30 = JSON.parse(res30.rows[0].layout_json);
        
        if (layout30.tabs.length > 0) {
            layout30.tabs[0].title = 'Información';
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 30", [JSON.stringify(layout30)]);
            console.log("Renamed tab to 'Información' in ID 30.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
