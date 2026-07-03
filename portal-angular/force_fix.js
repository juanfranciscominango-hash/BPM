const {Client} = require('pg');
const fs = require('fs');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const layout = fs.readFileSync('c:/ProyectosJava/BMP/portal-angular/layout_dump.json', 'utf8');
        
        // Update Task_1
        await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = 'Task_1'", [layout]);
        
        // Update Activity_0c0o6m4 (4.1)
        await client.query("UPDATE screen_definition SET layout_json = $1 WHERE task_key = 'Activity_0c0o6m4'", [layout]);

        // Also update Flujo_Credito_Completo process instances
        await client.query("UPDATE screen_definition SET process_key = 'Flujo_Credito_Completo' WHERE task_key = 'Activity_0c0o6m4'");
        
        console.log("Forced layouts updated successfully!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
