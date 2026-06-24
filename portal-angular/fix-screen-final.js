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

async function fixScreen() {
    try {
        console.log("Fetching screens...");
        const screens = await fetchJson('http://localhost:9090/api/v1/screens');
        const screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');
        
        if (!screen) return;
        let layout = JSON.parse(screen.layoutJson);
        
        let targetSection = null;
        for (let tab of layout.tabs) {
            for (let section of tab.sections) {
                if (section.title === 'Producto') {
                    targetSection = section;
                    break;
                }
            }
        }

        if (!targetSection) return;

        let prodField = targetSection.fields.find(f => f.name === 'producto_credito_descripcion');
        if (prodField) {
            prodField.config = prodField.config || {};
            
            // 1. DELETE HARDCODED OPTIONS SO IT FETCHES FROM DB
            if (prodField.config.options) delete prodField.config.options;
            
            // 2. FIX VALUE FIELD
            prodField.config.dataSourceEntityId = 16;
            prodField.config.displayField = 'descripcion';
            prodField.config.valueField = 'id'; // The JSON returns 'id'
            
            // 3. FIX CASCADE RULES LOCATION AND COLUMN NAMES
            delete prodField.cascadeRules; // Delete the wrongly placed root property
            
            prodField.config.cascadeRules = [
                { sourceColumn: 'pro_cre_tasa', targetField: 'producto_credito_pro_cre_tasa' },
                { sourceColumn: 'pro_cre_plazo_minimo', targetField: 'producto_credito_pro_cre_plazo_minimo' },
                { sourceColumn: 'pro_cre_plazo_maximo', targetField: 'producto_credito_pro_cre_plazo_maximo' },
                { sourceColumn: 'pro_cre_monto_minimo', targetField: 'producto_credito_pro_cre_monto_minimo' },
                { sourceColumn: 'pro_cre_monto_maximo', targetField: 'producto_credito_pro_cre_monto_maximo' }
            ];
            
            console.log("Fixed Producto de crédito");
        }

        screen.layoutJson = JSON.stringify(layout);

        console.log("Saving screen...");
        const result = await postJson('http://localhost:9090/api/v1/screens', screen);
        console.log("Screen saved successfully:", result.id);
    } catch (e) {
        console.error("Error:", e);
    }
}

fixScreen();
