const http = require('http');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function postJson(url, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function fixGrid() {
    try {
        console.log("Fetching screens...");
        const screens = await fetchJson('http://localhost:9090/api/v1/screens');
        const screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');
        
        if (!screen) return;
        let layout = JSON.parse(screen.layoutJson);
        
        for (let tab of layout.tabs) {
            for (let section of tab.sections) {
                for (let field of section.fields) {
                    if (field.name === 'gridIngresos') {
                        // Fix selectedColumns
                        field.config.selectedColumns.forEach(col => {
                            if (col.name === 'tipoInterviniente') col.parametricTableId = 11;
                            if (col.name === 'mes') col.parametricTableId = 22;
                        });
                        // Fix _cachedColumns
                        if (field._cachedColumns) {
                            field._cachedColumns.forEach(col => {
                                if (col.name === 'tipoInterviniente') col.parametricTableId = 11;
                                if (col.name === 'mes') col.parametricTableId = 22;
                            });
                        }
                        console.log("Fixed gridIngresos");
                    }
                    if (field.name === 'gridEgresos') {
                        // Fix selectedColumns
                        field.config.selectedColumns.forEach(col => {
                            if (col.name === 'tipoInterviniente') col.parametricTableId = 11;
                        });
                        // Fix _cachedColumns
                        if (field._cachedColumns) {
                            field._cachedColumns.forEach(col => {
                                if (col.name === 'tipoInterviniente') col.parametricTableId = 11;
                            });
                        }
                        console.log("Fixed gridEgresos");
                    }
                }
            }
        }

        screen.layoutJson = JSON.stringify(layout);

        console.log("Saving screen...");
        const result = await postJson('http://localhost:9090/api/v1/screens', screen);
        console.log("Screen saved successfully:", result.id);
    } catch (e) {
        console.error("Error:", e);
    }
}

fixGrid();
