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
    
    // Find Referencias tab
    const refTab = layout.tabs.find(t => t.title === 'Referencias');
    if (refTab) {
        const personalField = refTab.sections[0].fields.find(f => f.name === 'referencia_personal');
        if (personalField) {
            const relacionCol = personalField.config.selectedColumns.find(c => c.name === 'relacion');
            if (relacionCol) {
                relacionCol.type = 'PARAMETRICA';
                relacionCol.parametricTableId = 30;
                relacionCol.displayField = 'descripcion';
            }
        }
        
        const familiarField = refTab.sections[0].fields.find(f => f.name === 'referencia_familiar');
        if (familiarField) {
            const parentescoCol = familiarField.config.selectedColumns.find(c => c.name === 'parentesco');
            if (parentescoCol) {
                parentescoCol.type = 'PARAMETRICA';
                parentescoCol.parametricTableId = 30;
                parentescoCol.displayField = 'descripcion';
            }
        }
    }
    
    await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(layout), screen.id]);
    console.log('Parametrics updated successfully');
    await client.end();
}
run().catch(console.error);
