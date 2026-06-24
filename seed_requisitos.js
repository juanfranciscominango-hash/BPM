const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    // Drop if exists to be idempotent for our script
    await client.query("DROP TABLE IF EXISTS pr_requisitos");
    await client.query("DELETE FROM parametric_column WHERE table_id IN (SELECT id FROM parametric_table WHERE name = 'requisitos')");
    await client.query("DELETE FROM parametric_table WHERE name = 'requisitos'");

    const tableRes = await client.query("INSERT INTO parametric_table (name, label, description) VALUES ('requisitos', 'Requisitos de Crédito', 'Parámetros de Requisitos Documentales y Validación') RETURNING id");
    const tableId = tableRes.rows[0].id;

    const cols = [
        { name: 'codigo', label: 'Código', type: 'string' },
        { name: 'requisito', label: 'Requisito', type: 'string' },
        { name: 'tipo_requisito', label: 'Tipo Requisito', type: 'string' },
        { name: 'tipo_credito', label: 'Tipo Crédito', type: 'string' },
        { name: 'producto_credito', label: 'Producto', type: 'string' }
    ];

    for (const c of cols) {
        await client.query("INSERT INTO parametric_column (name, label, type, is_primary_key, table_id) VALUES ($1, $2, $3, false, $4)", [c.name, c.label, c.type, tableId]);
    }

    await client.query(`
        CREATE TABLE PR_REQUISITOS (
            id SERIAL PRIMARY KEY,
            codigo TEXT,
            requisito TEXT,
            tipo_requisito TEXT,
            tipo_credito TEXT,
            producto_credito TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert sample data
    await client.query(`
        INSERT INTO PR_REQUISITOS (codigo, requisito, tipo_requisito, tipo_credito, producto_credito) VALUES 
        ('REQ-CV-001', 'Presupuesto de construcción a financiarse para terminación, remodelación o ampliación de vivienda.', 'Requisito General', 'Hipotecario', 'CV'),
        ('REQ-CV-002', 'Original o copia de carta cuando el pago es de contado a la constructora (si aplica). Tabla de pagos a la constructora, recibos o promesa de compra venta cuando la entrada es financiada por la constructora. (si aplica)', 'Requisito Específico (Clientes independientes)', 'Hipotecario', 'CV'),
        ('REQ-CV-003', 'Copia de los tres últimos estados de cuenta de las principales cuentas bancarias de los participantes del crédito.', 'Requisitos Específicos (Clientes independientes)', 'Hipotecario', 'CV'),
        ('REQ-CV-004', 'Copia de declaración de impuesto IVA (Mensual: 3 últimas ó Semestral: 2 últimas).', 'Requisitos Específicos (Clientes independientes)', 'Hipotecario', 'CV')
    `);

    console.log("Requisitos Parametric Table and Data Seeded! Table ID: " + tableId);
    client.end();
});
