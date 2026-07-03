const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        let layout = JSON.parse(res.rows[0].layout_json);
        
        let targetTab = layout.tabs.find(t => t.title === 'Instrucción Operativa' || t.title === 'Instrucciones Operativas');
        if (targetTab) {
            targetTab.sections.forEach(s => {
                if (s.title === 'Instrucciones') {
                    s.fields.forEach(f => {
                        if (f.name === 'tasa') f.name = 'tasa_interes_analista';
                        if (f.name === 'monto_aprobado_inst') f.name = 'monto_aprobado';
                        if (f.name === 'plazo_aprobado_inst') f.name = 'plazo_aprobado';
                        if (f.name === 'producto_credito_inst') f.name = 'producto_desc';
                        if (f.name === 'destino_comercial_inst') f.name = 'destino_comercial';
                        
                        // Also make them readOnly so the user can't accidentally change the loaded variables if they are just for display here, wait, no, they might need to edit them?
                        // The user said "carga toda la informacion que se puede cargar", usually if it's loaded it should be editable or readonly depending on requirements, but let's just make it readonly to be safe and consistent with the screenshot where they don't have outlines (wait, they DO have outlines in the user's screenshot, except Tasa which is red).
                        // I'll leave readOnly as it is.
                    });
                }
            });
            
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 30", [JSON.stringify(layout)]);
            console.log("Renamed field keys to map to existing process variables.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
