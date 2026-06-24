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
                'Content-Length': data.length
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
        console.log("Fetching parametric tables...");
        const tables = await fetchJson('http://localhost:9090/api/v1/parametric/tables');
        const prodCatalog = tables.find(t => t.name.toLowerCase().includes('producto'));
        
        if (!prodCatalog) {
            console.error("No se encontró el catálogo de productos.");
            return;
        }
        console.log("Catalog found with ID:", prodCatalog.id);

        console.log("Fetching screens...");
        const screens = await fetchJson('http://localhost:9090/api/v1/screens');
        const screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');

        if (!screen) {
            console.error("No se encontró la pantalla de Simulación.");
            return;
        }

        let layout = JSON.parse(screen.layoutJson);
        
        let targetSection = layout.tabs[0].sections.find(s => s.title === 'Producto');
        if (!targetSection) {
            console.error("No se encontró la sección 'Producto'.");
            return;
        }

        let tipoCreditoField = targetSection.fields.find(f => f.name === 'tipo_credito_descripcion');
        if (tipoCreditoField) {
            delete tipoCreditoField.cascadeRules;
            console.log("Deleted cascade rules from Tipo de Crédito.");
        }

        let prodField = targetSection.fields.find(f => f.name === 'producto_credito_descripcion');
        if (prodField) {
            prodField.config = {
                dataSourceEntityId: prodCatalog.id,
                displayField: 'descripcion',
                valueField: 'identificacion' // Defaulting to identificacion based on user screenshot
            };
            prodField.cascadeRules = [
                { sourceColumn: 'tasa', targetField: 'producto_credito_pro_cre_tasa' }
            ];
            console.log("Updated Producto de crédito field.");
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
