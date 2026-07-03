const { Client } = require('pg');

async function run() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'INC_BPM_PLATFORM',
        password: 'Desarrollo',
        port: 5432,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = 30');
        if (res.rows.length === 0) return;

        let layout = JSON.parse(res.rows[0].layout_json);
        
        let cuentasTab = null;
        for (let tab of layout.tabs) {
            let section = tab.sections.find(s => s.title === 'Cuentas');
            if (section) {
                cuentasTab = section;
                break;
            }
        }

        if (!cuentasTab) return;

        // Re-update the config to ensure correct property types for grid
        const gridField = cuentasTab.fields.find(f => f.name === 'cuentas');
        if (gridField) {
            gridField.config = {
                "selectedColumns": [
                    { "name": "numero_cuenta", "label": "No. Cuenta", "type": "string" },
                    { "name": "tipo_cuenta", "label": "Tipo Cuenta", "type": "string" },
                    { "name": "estado_cuenta", "label": "Estado Cuenta", "type": "string" },
                    { "name": "seleccionar_cuenta", "label": "Seleccionar cuenta", "type": "string" }
                ]
            };
        }

        await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = 30', [JSON.stringify(layout)]);
        console.log("Updated screen 30 layout grid columns with type='string'!");

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
