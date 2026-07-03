const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        // Get layout from flujo_negociacion_y_venta_(bizagi)
        const res1 = await client.query("SELECT layout_json FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)' AND task_key = 'Activity_14xyo9t'");
        if (res1.rows.length === 0) {
            console.log("No layout found in source process");
            return;
        }
        const layout = res1.rows[0].layout_json;

        // Update Flujo_Credito_Completo
        const res2 = await client.query("UPDATE screen_definition SET layout_json = $1 WHERE process_key = 'Flujo_Credito_Completo' AND task_key = 'Activity_14xyo9t'", [layout]);
        console.log(`Updated ${res2.rowCount} row(s) in Flujo_Credito_Completo`);
        
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
