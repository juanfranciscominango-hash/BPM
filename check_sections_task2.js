const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, layout_json FROM screen_definition WHERE id IN (20, 24)");
    res.rows.forEach(r => {
        let json = JSON.parse(r.layout_json);
        console.log(`\n--- Screen ${r.id} (${r.name}) ---`);
        if (json && json.tabs) {
            json.tabs.forEach(t => {
                console.log(`Tab: ${t.title}`);
                if (t.sections) {
                    t.sections.forEach(s => {
                        console.log(`  Section: ${s.title} (fields: ${s.fields ? s.fields.length : 0})`);
                        if (s.title === "Lista de Requisitos" && s.fields.length > 0) {
                            console.log(`    -> Field 0: ${s.fields[0].name}`);
                        }
                    });
                }
            });
        }
    });
    client.end();
});
