const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, task_key FROM screen_definition");
    for (const r of res.rows) {
        const layoutRes = await client.query("SELECT layout_json FROM screen_definition WHERE id = $1", [r.id]);
        let json = JSON.parse(layoutRes.rows[0].layout_json);
        if (json && json.tabs) {
            json.tabs.forEach(t => {
                if (t.title === 'Revisión') {
                    console.log(`Screen ${r.id} (${r.task_key}) has tab Revisión with sections:`);
                    t.sections.forEach(s => console.log(`  - ${s.title} (${s.fields ? s.fields.length : 0} fields)`));
                }
            });
        }
    }
    client.end();
});
