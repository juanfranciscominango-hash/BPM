const { Client } = require('pg');
const c = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await c.connect();
    
    // 1. Get Source Task
    const res1 = await c.query("SELECT layout_json FROM screen_definition WHERE task_key = 'Task_1' AND process_key = 'flujo_negociacion_y_venta_(bizagi)'");
    const sourceLayout = JSON.parse(res1.rows[0].layout_json);
    const sourceTab = sourceLayout.tabs.find(t => t.title === 'Condiciones de Crédito');
    console.log("Source sections count:", sourceTab.sections.length);
    
    // 2. Get Target Task
    const targetProcess = 'flujo_negociacion_y_venta_(bizagi)';
    const targetTask = 'Activity_14xyo9t';
    const res2 = await c.query("SELECT layout_json FROM screen_definition WHERE task_key = $1 AND process_key = $2", [targetTask, targetProcess]);
    const targetLayout = JSON.parse(res2.rows[0].layout_json);
    const targetTab = targetLayout.tabs.find(t => t.title === 'Simulación crédito asesor');
    
    // 3. Clone
    targetTab.sections = JSON.parse(JSON.stringify(sourceTab.sections));
    
    // 4. Update
    await c.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = $2 AND process_key = $3", [JSON.stringify(targetLayout), targetTask, targetProcess]);
    
    console.log("Successfully cloned 'Condiciones de Crédito' into 'Simulación crédito asesor' in Activity_14xyo9t!");
    
    await c.end();
}

run().catch(console.error);
