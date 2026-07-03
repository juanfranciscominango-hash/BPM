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
    
    const targetProcess = 'flujo_negociacion_y_venta_(bizagi)';
    const targetTask = 'Activity_14xyo9t';
    
    const res = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = $1 AND process_key = $2", [targetTask, targetProcess]);
    
    if (res.rows.length === 0) {
        console.log("Task not found");
        return;
    }
    
    const layout = JSON.parse(res.rows[0].layout_json);
    const asesorTab = layout.tabs.find(t => t.title === 'Simulación crédito asesor');
    const analistaTab = layout.tabs.find(t => t.title === 'Simulación crédito análista');
    
    if (!asesorTab || !analistaTab) {
        console.log("Tabs not found");
        return;
    }
    
    // Deep clone the sections
    const clonedSections = JSON.parse(JSON.stringify(asesorTab.sections));
    
    // Modify the fields
    for (const section of clonedSections) {
        if (section.fields) {
            for (const field of section.fields) {
                // 1. Make editable
                field.readOnly = false;
                
                // 2. Rename field to be a "new" field
                if (!field.name.endsWith('_analista')) {
                    field.name = field.name + '_analista';
                }
            }
        }
        
        // 3. Add "Monto Aprobado" to "Datos del Préstamo"
        if (section.title === 'Datos del Préstamo') {
            section.fields.push({
                name: 'monto_aprobado_analista',
                label: 'Monto Aprobado',
                controlType: 'NUMBER',
                cols: 3,
                required: false,
                readOnly: false,
                defaultValue: ''
            });
        }
    }
    
    analistaTab.sections = clonedSections;
    
    // Update the DB
    await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = $2 AND process_key = $3", [JSON.stringify(layout), targetTask, targetProcess]);
    
    console.log("Successfully cloned and modified to 'Simulación crédito análista'.");
    
    await client.end();
}

run().catch(console.error);
