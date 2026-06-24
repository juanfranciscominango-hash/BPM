const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(() => {
    client.query('SELECT layout_json FROM screen_definition WHERE id = 19').then(res => {
        const json = JSON.parse(res.rows[0].layout_json);
        console.log(json.tabs[2].sections[0].fields.map(f => f.name + " (" + f.label + ")").join("\n"));
        client.end();
    });
});
