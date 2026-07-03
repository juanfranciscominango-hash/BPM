const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE id = 27");
        if (res.rows.length > 0) {
            let layout = JSON.parse(res.rows[0].layout_json);
            
            // Add the new YESNO field at the end of the first section in the first tab
            const field = {
                "name": "continuar",
                "label": "¿Continuar?",
                "controlType": "YESNO",
                "cols": "12",
                "config": {
                    "dataSourceEntityId": null,
                    "displayField": "nombre",
                    "valueField": "id",
                    "buttonAction": "SAVE",
                    "buttonStyle": "btn-primary"
                },
                "required": true,
                "readOnly": false,
                "defaultValue": ""
            };
            
            // Assuming first tab is 'Información General' and first section is the one shown
            layout.tabs[0].sections[0].fields.push(field);
            
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 27", [JSON.stringify(layout)]);
            console.log("Field 'continuar' added to tab 0, section 0.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
