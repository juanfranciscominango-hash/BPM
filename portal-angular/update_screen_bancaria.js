const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'INC_BPM_PLATFORM',
    password: 'Desarrollo',
    port: 5432
});

async function run() {
    await client.connect();
    const res = await client.query('SELECT id, layout_json FROM screen_definition WHERE process_key = $1 AND task_key = $2', ['flujo_negociacion_y_venta_(bizagi)', 'Task_1']);
    
    if (res.rows.length === 0) return;
    
    const screen = res.rows[0];
    const layout = JSON.parse(screen.layout_json);
    
    const refTab = layout.tabs.find(t => t.title === 'Referencias');
    if (refTab) {
        const bancariaField = refTab.sections[0].fields.find(f => f.name === 'referencia_bancaria');
        if (bancariaField) {
            const instCol = bancariaField.config.selectedColumns.find(c => c.name === 'institucion');
            if (instCol) {
                instCol.type = 'PARAMETRICA';
                instCol.parametricTableId = 13;
                instCol.displayField = 'descripcion';
            }
        }
    }
    
    await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(layout), screen.id]);
    console.log('Parametrics updated successfully for Bancarias');
    await client.end();
}
run().catch(console.error);
