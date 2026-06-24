const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const res1 = await client.query("SELECT * FROM pr_tipo_credito");
    console.log("Tipos de credito:", res1.rows);
    
    const res2 = await client.query("SELECT * FROM pr_producto_credito");
    console.log("Productos de credito:", res2.rows);

    client.end();
});
