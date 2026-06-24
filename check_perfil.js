const fs = require('fs');
const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, layout_json FROM screen_definition WHERE name ILIKE '%perfil%'");
    for (let row of res.rows) {
        console.log(`Screen: ${row.name} (ID: ${row.id})`);
        const json = JSON.parse(row.layout_json);
        json.tabs.forEach(t => {
            t.sections.forEach(s => {
                s.fields.forEach(f => {
                    if (f.controlType !== 'LABEL' && f.controlType !== 'GRID') {
                        console.log(`  - ${f.name} (${f.label}) [${f.controlType}] readonly: ${f.readOnly}`);
                    }
                });
            });
        });
    }
    client.end();
});
