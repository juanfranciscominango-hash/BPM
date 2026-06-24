const http = require('http');

function apiCall(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 9091,
            path: '/api/v1' + path,
            method: method,
            headers: {}
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data || '{}')));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

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

async function updateTask2() {
    try {
        const screens = await apiCall('GET', '/screens');
        const task2Screens = screens.filter(s => s.taskKey === 'Task_2' || s.id === 20 || s.id === 24);
        
        for (const screen of task2Screens) {
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
            
            // POST /screens to save
            const updated = await apiCall('POST', '/screens', screen);
            console.log(`Updated screen ${updated.id} via API.`);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

updateTask2();
