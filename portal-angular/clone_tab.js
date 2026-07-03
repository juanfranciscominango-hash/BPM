const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res27 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 27");
        const res30 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        
        let layout27 = JSON.parse(res27.rows[0].layout_json);
        let layout30 = JSON.parse(res30.rows[0].layout_json);
        
        console.log("ID 27 tabs:", layout27.tabs.map(t => t.title));
        console.log("ID 30 tabs:", layout30.tabs.map(t => t.title));
        
        // Find if ID 27 has the 'Información' or 'Información General' tab
        let sourceTab = layout27.tabs.find(t => t.title === 'Información General' || t.title === 'Información');
        if (sourceTab) {
            console.log("Found source tab:", sourceTab.title);
            
            // Just replace the empty 'Nueva Pestaña' or prepend
            if (layout30.tabs.length === 1 && layout30.tabs[0].title === 'Nueva Pestaña') {
                layout30.tabs[0] = sourceTab;
            } else {
                layout30.tabs.unshift(sourceTab);
            }
            
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 30", [JSON.stringify(layout30)]);
            console.log("Cloned tab into ID 30.");
        } else {
            console.log("Source tab not found in ID 27.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
