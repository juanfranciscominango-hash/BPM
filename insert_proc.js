const fs = require('fs');
const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    const xml = fs.readFileSync('c:/ProyectosJava/BMP/flujo_corregido.bpmn', 'utf8');
    const res = await client.query(`
        INSERT INTO process_definition (key, name, bpmn_xml, status) 
        VALUES ('Flujo_Credito_Completo', 'Flujo de Crédito', $1, 'DRAFT') 
        RETURNING id
    `, [xml]);
    const newId = res.rows[0].id;
    console.log("Inserted ID:", newId);
    client.end();
});
