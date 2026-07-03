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
    const res = await client.query("SELECT id, layout_json FROM screen_definition WHERE process_key = 'flujo_negociacion_y_venta_(bizagi)' AND task_key = 'Task_1'");
    if (res.rows.length === 0) return;
    
    const screen = res.rows[0];
    const layout = JSON.parse(screen.layout_json);
    const ing = layout.tabs.flatMap(t => t.sections).flatMap(s => s.fields).find(f => f.name === 'ingresos_array');
    if (ing) {
        const c = ing.config.selectedColumns.find(col => col.name === 'valorConyuge');
        if (c) {
            c.visibilityRule = "['CASADO', 'UNION LIBRE', 'CASADO/A', 'UNIÓN DE HECHO'].includes(String(typeof estadoCivil !== 'undefined' ? estadoCivil : (typeof estado_civil !== 'undefined' ? estado_civil : '')).toUpperCase()) && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'TRUE' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SI' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SÍ'";
        }
    }
    
    await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = $2", [JSON.stringify(layout), screen.id]);
    console.log('Rule updated with estadoCivil check!');
    await client.end();
}
run().catch(console.error);
