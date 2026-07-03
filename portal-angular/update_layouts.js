const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'INC_BPM_PLATFORM',
    password: 'Desarrollo',
    port: 5432
});

async function run() {
    await client.connect();
    
    // 1. Get Task_2 layout
    const res2 = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Task_2' AND process_key = 'Flujo_Credito_Completo'");
    if (res2.rows.length === 0) {
        console.log("No Task_2 found");
        return;
    }
    
    const task2Layout = JSON.parse(res2.rows[0].layout_json);
    let infoGeneralSection = null;
    
    // Find the 'Información General' section in Task_2
    for (const tab of task2Layout.tabs) {
        for (const section of tab.sections) {
            if (section.title === 'Información General') {
                infoGeneralSection = section;
                break;
            }
        }
        if (infoGeneralSection) break;
    }
    
    if (!infoGeneralSection) {
        console.log("No Información General section found in Task_2");
        return;
    }
    
    console.log("Found Información General section with " + infoGeneralSection.fields.length + " fields.");
    
    // 2. Update Task_3 and Activity_14xyo9t
    const targets = [
        { task_key: 'Task_3', process_key: 'Flujo_Credito_Completo' },
        { task_key: 'Activity_14xyo9t', process_key: 'flujo_negociacion_y_venta_(bizagi)' }
    ];
    
    for (const target of targets) {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = $1 AND process_key = $2", [target.task_key, target.process_key]);
        if (res.rows.length === 0) continue;
        
        const layout = JSON.parse(res.rows[0].layout_json);
        
        // Find and replace RESUMEN_CASO with infoGeneralSection
        let modified = false;
        for (const tab of layout.tabs) {
            for (let i = 0; i < tab.sections.length; i++) {
                const section = tab.sections[i];
                if (section.fields && section.fields.length > 0 && section.fields[0].controlType === 'RESUMEN_CASO') {
                    // Replace the whole section with the infoGeneralSection
                    tab.sections[i] = infoGeneralSection;
                    modified = true;
                }
            }
        }
        
        if (modified) {
            console.log(`Updating ${target.process_key} - ${target.task_key}`);
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = $2 AND process_key = $3", [JSON.stringify(layout), target.task_key, target.process_key]);
        }
    }

    await client.end();
}

run().catch(console.error);
