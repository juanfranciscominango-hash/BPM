const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    // Drop if exists
    await client.query("DROP TABLE IF EXISTS pr_indicadores_financieros");
    await client.query("DELETE FROM parametric_column WHERE table_id IN (SELECT id FROM parametric_table WHERE name = 'indicadores_financieros')");
    await client.query("DELETE FROM parametric_table WHERE name = 'indicadores_financieros'");

    const tableRes = await client.query("INSERT INTO parametric_table (name, label, description) VALUES ('indicadores_financieros', 'Indicadores Financieros', 'Límites máximos y mínimos permitidos para CIN y DIN') RETURNING id");
    const tableId = tableRes.rows[0].id;

    const cols = [
        { name: 'indicador', label: 'Indicador', type: 'string' },
        { name: 'valor_minimo', label: 'Valor Mínimo', type: 'number' },
        { name: 'valor_maximo', label: 'Valor Máximo', type: 'number' }
    ];

    for (const c of cols) {
        await client.query("INSERT INTO parametric_column (name, label, type, is_primary_key, table_id) VALUES ($1, $2, $3, false, $4)", [c.name, c.label, c.type, tableId]);
    }

    await client.query(`
        CREATE TABLE pr_indicadores_financieros (
            id SERIAL PRIMARY KEY,
            indicador TEXT,
            valor_minimo NUMERIC,
            valor_maximo NUMERIC,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert sample data
    await client.query(`
        INSERT INTO pr_indicadores_financieros (indicador, valor_minimo, valor_maximo) VALUES 
        ('CIN', 0, 45),
        ('DIN', 44, 100)
    `);

    console.log("Indicadores Financieros Parametric Table and Data Seeded! Table ID: " + tableId);
    client.end();
}).catch(err => {
    console.error("Error seeding indicadores financieros:", err);
    client.end();
});
