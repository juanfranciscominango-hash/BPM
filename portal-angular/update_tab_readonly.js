const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE id = 27");
        if (res.rows.length > 0) {
            let layout = JSON.parse(res.rows[0].layout_json);
            
            // Find the tab
            let modified = false;
            for (let tab of layout.tabs) {
                if (tab.title === "Simulación crédito análista") {
                    for (let section of tab.sections) {
                        for (let field of section.fields) {
                            field.readOnly = true;
                        }
                    }
                    modified = true;
                }
            }
            
            if (modified) {
                await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 27", [JSON.stringify(layout)]);
                console.log("Tab 'Simulación crédito análista' made readOnly in ID 27.");
            } else {
                console.log("Tab not found.");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
