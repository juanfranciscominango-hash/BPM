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
    
    const res = await client.query("SELECT process_key, task_key, layout_json FROM screen_definition");
    let sourceTask = null;
    let sourceTab = null;
    
    for (const row of res.rows) {
        if (!row.layout_json) continue;
        const layout = JSON.parse(row.layout_json);
        if (!layout.tabs) continue;
        for (const tab of layout.tabs) {
            if (tab.title && tab.title.toLowerCase().includes('condiciones')) {
                sourceTask = row;
                sourceTab = tab;
                break;
            }
        }
        if (sourceTask) break;
    }
    
    if (sourceTask) {
        console.log(`Found source tab in ${sourceTask.process_key} - ${sourceTask.task_key}`);
        
        // Find Task_3
        const res3 = await client.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Task_3' AND process_key = 'Flujo_Credito_Completo'");
        if (res3.rows.length > 0) {
            const task3Layout = JSON.parse(res3.rows[0].layout_json);
            let targetTab = null;
            for (const tab of task3Layout.tabs) {
                if (tab.title && tab.title.toLowerCase().includes('asesor')) {
                    targetTab = tab;
                    break;
                }
            }
            if (targetTab) {
                console.log(`Found target tab in Task_3: ${targetTab.title}`);
                targetTab.sections = JSON.parse(JSON.stringify(sourceTab.sections));
                await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = 'Task_3' AND process_key = 'Flujo_Credito_Completo'", [JSON.stringify(task3Layout)]);
                console.log("Successfully cloned the sections!");
            } else {
                console.log("Target tab 'Simulación crédito asesor' not found in Task_3");
            }
        } else {
            console.log("Task_3 not found");
        }
    } else {
        console.log("Source tab 'Condiciones de Crédito' not found in any task.");
    }
    
    await client.end();
}

run().catch(console.error);
