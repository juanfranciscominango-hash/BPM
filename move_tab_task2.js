const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
    await client.connect();

    const requisitosGrid = {
        name: "requisitos_array",
        label: "Requisitos Documentales y Validación",
        controlType: "GRID",
        cols: 12,
        config: {
            selectedColumns: [
                { name: "producto_credito", label: "Destino", type: "string" },
                { name: "tipo_requisito", label: "Tipo Requisito", type: "string" },
                { name: "requisito", label: "Requisito", type: "string" },
                { name: "revisado", label: "¿Revisado?", type: "boolean" }
            ]
        }
    };

    // Remove from Task 1 (ID 19, 22)
    const resTask1 = await client.query("SELECT id, layout_json FROM screen_definition WHERE task_key = 'Task_1'");
    for (const row of resTask1.rows) {
        let json = JSON.parse(row.layout_json);
        if (json.tabs) {
            json.tabs = json.tabs.filter(t => t.title !== "Revisión" && t.title !== "Revisión Requisitos");
            await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = $2", [JSON.stringify(json), row.id]);
            console.log(`Removed from DB Screen ${row.id}`);
        }
    }

    // Add to Task 2 (ID 20, 24)
    const resTask2 = await client.query("SELECT id, layout_json FROM screen_definition WHERE task_key = 'Task_2'");
    for (const row of resTask2.rows) {
        let json = JSON.parse(row.layout_json);
        if (!json.tabs) json.tabs = [];
        let tab = json.tabs.find(t => t.title === "Revisión" || t.title === "Revisión Requisitos");
        if (!tab) {
            tab = { title: "Revisión", sections: [] };
            json.tabs.push(tab);
        }
        let section = tab.sections.find(s => s.title === "Lista de Requisitos");
        if (!section) {
            section = { title: "Lista de Requisitos", fields: [] };
            tab.sections.push(section);
        }
        let fieldIdx = section.fields.findIndex(f => f.name === "requisitos_array");
        if (fieldIdx >= 0) {
            section.fields[fieldIdx] = requisitosGrid;
        } else {
            section.fields.push(requisitosGrid);
        }
        await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = $2", [JSON.stringify(json), row.id]);
        console.log(`Added to DB Screen ${row.id}`);
    }

    // Update screens.json
    const screensFile = 'c:/ProyectosJava/BMP/screens.json';
    if (fs.existsSync(screensFile)) {
        let content = fs.readFileSync(screensFile, 'utf8');
        let bom = '';
        if (content.charCodeAt(0) === 0xFEFF) {
            bom = '\uFEFF';
            content = content.substring(1);
        }
        const data = JSON.parse(content);
        let modified = false;

        // Remove from Task 1
        for (const screen of data.value) {
            if (screen.taskKey === 'Task_1' || screen.task_key === 'Task_1' || screen.id === 19 || screen.id === 22) {
                let json = typeof screen.layoutJson === 'string' ? JSON.parse(screen.layoutJson) : screen.layoutJson;
                if (json.tabs) {
                    const len = json.tabs.length;
                    json.tabs = json.tabs.filter(t => t.title !== "Revisión" && t.title !== "Revisión Requisitos");
                    if (json.tabs.length !== len) {
                        screen.layoutJson = JSON.stringify(json);
                        modified = true;
                    }
                }
            }
            if (screen.taskKey === 'Task_2' || screen.task_key === 'Task_2' || screen.id === 20 || screen.id === 24) {
                let json = typeof screen.layoutJson === 'string' ? JSON.parse(screen.layoutJson) : screen.layoutJson;
                if (!json.tabs) json.tabs = [];
                let tab = json.tabs.find(t => t.title === "Revisión" || t.title === "Revisión Requisitos");
                if (!tab) {
                    tab = { title: "Revisión", sections: [] };
                    json.tabs.push(tab);
                }
                let section = tab.sections.find(s => s.title === "Lista de Requisitos");
                if (!section) {
                    section = { title: "Lista de Requisitos", fields: [] };
                    tab.sections.push(section);
                }
                let fieldIdx = section.fields.findIndex(f => f.name === "requisitos_array");
                if (fieldIdx >= 0) {
                    section.fields[fieldIdx] = requisitosGrid;
                } else {
                    section.fields.push(requisitosGrid);
                }
                screen.layoutJson = JSON.stringify(json);
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(screensFile, bom + JSON.stringify(data, null, 4));
            console.log("screens.json updated.");
        }
    }

    await client.end();
}

run().catch(console.error);
