const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });
client.connect().then(async () => {
    const res = await client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != \'pg_catalog\' AND schemaname != \'information_schema\' AND tablename LIKE \'%parametric%\';');
    console.log("Parametric tables:", res.rows);
    
    const res2 = await client.query('SELECT * FROM parametric_table;');
    console.log("parametric_table:", res2.rows);

    client.end();
}).catch(e => console.error(e));
