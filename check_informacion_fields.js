const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, task_key, process_key, layout_json FROM screen_definition");
    for (const r of res.rows) {
        try {
            let json = JSON.parse(r.layout_json);
            if (json && json.tabs) {
                json.tabs.forEach(t => {
                    if (t.title === 'Revisión' || t.title === 'Revisión Requisitos') {
                        t.sections.forEach(s => {
                            if (s.title === 'Información') {
                                console.log(`Screen ${r.id} (${r.task_key}, ${r.process_key}): Tab ${t.title} -> Section Información has ${s.fields ? s.fields.length : 0} fields`);
                            }
                        });
                    }
                });
            }
        } catch (e) { }
    }
    client.end();
});
