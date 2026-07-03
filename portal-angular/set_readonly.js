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
    
    const targetLayout = JSON.parse(res.rows[0].layout_json);
    const targetTab = targetLayout.tabs.find(t => t.title === 'Simulación crédito asesor');
    
    if (!targetTab) {
        console.log("Tab not found");
        return;
    }
    
    let fieldsUpdated = 0;
    
    // Set readOnly = true for all fields in all sections of this tab
    for (const section of targetTab.sections) {
        if (section.fields) {
            for (const field of section.fields) {
                field.readOnly = true;
                fieldsUpdated++;
            }
        }
    }
    
    // Update the layout in the DB
    await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = $2 AND process_key = $3", [JSON.stringify(targetLayout), targetTask, targetProcess]);
    
    console.log(`Successfully set readOnly=true for ${fieldsUpdated} fields in 'Simulación crédito asesor'.`);
    
    await client.end();
}

run().catch(console.error);
