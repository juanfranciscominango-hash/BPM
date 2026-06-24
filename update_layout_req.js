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

    // Update in DB
    const res = await client.query("SELECT id, layout_json FROM screen_definition WHERE task_key = 'Task_1' AND id = 19");
    if (res.rows.length > 0) {
        let json = JSON.parse(res.rows[0].layout_json);
        
        // Ensure tabs exists
        if (!json.tabs) json.tabs = [];
        let tab = json.tabs.find(t => t.title === "Revisión" || t.title === "Revisión Requisitos");
        if (!tab) {
            tab = { title: "Revisión", sections: [] };
            json.tabs.push(tab);
        }

        // Add section if not exists
        let section = tab.sections.find(s => s.title === "Lista de Requisitos");
        if (!section) {
            section = { title: "Lista de Requisitos", fields: [] };
            tab.sections.push(section);
        }
        
        // Add or update grid
        let fieldIdx = section.fields.findIndex(f => f.name === "requisitos_array");
        if (fieldIdx >= 0) {
            section.fields[fieldIdx] = requisitosGrid;
        } else {
            section.fields.push(requisitosGrid);
        }

        await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 19", [JSON.stringify(json)]);
        console.log("DB layout updated for Screen 19.");
    }

    // Update in screens.json to persist
    const screensFile = 'c:/ProyectosJava/BMP/screens.json';
    if (fs.existsSync(screensFile)) {
        let content = fs.readFileSync(screensFile, 'utf8');
        let bom = '';
        if (content.charCodeAt(0) === 0xFEFF) {
            bom = '\uFEFF';
            content = content.substring(1);
        }
        const data = JSON.parse(content);
        const screen = data.value.find(s => s.id === 19);
        if (screen) {
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
            fs.writeFileSync(screensFile, bom + JSON.stringify(data, null, 4));
            console.log("screens.json updated.");
        }
    }

    await client.end();
}

run().catch(console.error);
