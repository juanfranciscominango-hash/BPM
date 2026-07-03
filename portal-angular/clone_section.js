const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res27 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 27");
        const res30 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        
        let layout27 = JSON.parse(res27.rows[0].layout_json);
        let layout30 = JSON.parse(res30.rows[0].layout_json);
        
        // Find section "Datos del Préstamo" in ID 27 -> "Simulación crédito análista" tab
        let sourceSection = null;
        for (let tab of layout27.tabs) {
            if (tab.title === "Simulación crédito análista") {
                for (let section of tab.sections) {
                    if (section.title === "Datos del Préstamo") {
                        sourceSection = JSON.parse(JSON.stringify(section)); // Deep clone
                        break;
                    }
                }
            }
            if (sourceSection) break;
        }
        
        if (sourceSection) {
            // Make all fields readOnly
            for (let field of sourceSection.fields) {
                field.readOnly = true;
            }
            
            // Look for "Aprobado Credito" tab in ID 30
            let targetTab = layout30.tabs.find(t => t.title === "Aprobado Credito");
            
            if (!targetTab) {
                // If it doesn't exist, create it
                targetTab = {
                    title: "Aprobado Credito",
                    sections: []
                };
                layout30.tabs.push(targetTab);
                console.log("Created 'Aprobado Credito' tab.");
            }
            
            // Check if section already exists to avoid duplicates
            let sectionExists = targetTab.sections.find(s => s.title === "Datos del Préstamo");
            if (!sectionExists) {
                targetTab.sections.push(sourceSection);
                console.log("Cloned section into 'Aprobado Credito' tab.");
                await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 30", [JSON.stringify(layout30)]);
                console.log("Updated ID 30 successfully.");
            } else {
                console.log("Section already exists in target tab.");
            }
        } else {
            console.log("Source section not found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
