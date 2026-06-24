const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(() => {
    client.query("SELECT id, name FROM screen_definition WHERE name ILIKE '%revisar%' OR name ILIKE '%requisito%'").then(res => {
        console.log("Screens found:");
        console.log(res.rows);
        client.end();
    });
});
