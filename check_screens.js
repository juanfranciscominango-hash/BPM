const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    for (const id of [20, 24]) {
        const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = $1', [id]);
        if (res.rows.length > 0) {
            console.log(`\n--- Screen ${id} ---`);
            const json = JSON.parse(res.rows[0].layout_json);
            if (json && json.tabs) {
                json.tabs.forEach((t, i) => {
                    console.log(`Tab ${i}: ${t.title}`);
                    if (t.sections) {
                        t.sections.forEach((s, j) => {
                            console.log(`  Sec ${j}: ${s.title}`);
                        });
                    }
                });
            } else {
                console.log("No tabs or empty layout");
            }
        }
    }
    client.end();
});
