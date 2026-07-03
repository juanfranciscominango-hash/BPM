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
    const analistaTab = layout.tabs.find(t => t.title === 'Simulación crédito análista');
    
    if (!analistaTab) {
        console.log("Tab not found");
        return;
    }
    
    for (const section of analistaTab.sections) {
        if (section.title === 'Datos del Préstamo') {
            // Check if the button already exists to prevent duplicates
            if (!section.fields.some(f => f.name === 'btn_calcular_analista')) {
                section.fields.push({
                    name: 'btn_calcular_analista',
                    label: 'Simular',
                    controlType: 'BUTTON',
                    cols: 3,
                    config: {
                        buttonAction: 'CUSTOM',
                        apiToExecute: 'CALCULAR_analista',
                        buttonStyle: 'btn-danger' // matches the theme
                    }
                });
                console.log("Button added!");
            } else {
                console.log("Button already exists");
            }
        }
    }
    
    // Update the DB
    await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = $2 AND process_key = $3", [JSON.stringify(layout), targetTask, targetProcess]);
    
    console.log("Successfully added button to 'Simulación crédito análista'.");
    
    await client.end();
}

run().catch(console.error);
