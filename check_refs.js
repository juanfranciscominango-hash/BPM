const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res = await client.query("SELECT id, name, type, referenced_table_id FROM parametric_column WHERE table_id = (SELECT id FROM parametric_table WHERE name='requisitos')");
    console.log("Columns for requisitos:", res.rows);
    
    // Also check what references look like
    const res2 = await client.query("SELECT * FROM parametric_column WHERE type = 'reference' LIMIT 2");
    console.log("Reference examples:", res2.rows);

    client.end();
});
