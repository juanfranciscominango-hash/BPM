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
        const addCelularToConfig = (fieldConfig) => {
            if (!fieldConfig || !fieldConfig.selectedColumns) return;
            const hasCelular = fieldConfig.selectedColumns.find(c => c.name === 'celular');
            if (!hasCelular) {
                // insert after telefono or just push
                const telIndex = fieldConfig.selectedColumns.findIndex(c => c.name === 'telefono');
                const celularCol = { name: 'celular', label: 'Celular', type: 'string' };
                if (telIndex >= 0) {
                    fieldConfig.selectedColumns.splice(telIndex + 1, 0, celularCol);
                } else {
                    fieldConfig.selectedColumns.push(celularCol);
                }
            }
        };

        const personalField = refTab.sections[0].fields.find(f => f.name === 'referencia_personal');
        if (personalField) addCelularToConfig(personalField.config);
        
        const familiarField = refTab.sections[0].fields.find(f => f.name === 'referencia_familiar');
        if (familiarField) addCelularToConfig(familiarField.config);
    }
    
    await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(layout), screen.id]);
    console.log('Celular column added successfully');
    await client.end();
}
run().catch(console.error);
