const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, layout_json FROM screen_definition WHERE id IN (20, 24)");
    res.rows.forEach(r => {
        console.log(`--- Screen ${r.id} ---`);
        let json = JSON.parse(r.layout_json);
        console.log(JSON.stringify(json.tabs, null, 2));
    });
    client.end();
});
