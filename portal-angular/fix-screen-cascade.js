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

async function fixAllCascades() {
    try {
        console.log("Fetching parametric tables...");
        const tables = await fetchJson('http://localhost:9090/api/v1/parametric/tables');
        const prodCatalog = tables.find(t => t.name.toLowerCase().includes('producto'));
        
        if (!prodCatalog) {
            console.error("No se encontró el catálogo de productos.");
            return;
        }

        console.log("Fetching screens...");
        const screens = await fetchJson('http://localhost:9090/api/v1/screens');
        
        // Find the screen the user is working on (flujo_credito -> Simulación)
        const screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');
        
        if (!screen) {
            console.error("No se encontró la pantalla de Simulación.");
            return;
        }

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

        if (!targetSection) {
            console.error("No se encontró la sección 'Producto'.");
            return;
        }

        // Clean up Tipo de Crédito just in case
        let tipoCreditoField = targetSection.fields.find(f => f.name === 'tipo_credito_descripcion');
        if (tipoCreditoField) {
            delete tipoCreditoField.cascadeRules;
        }

        // Update Producto de crédito
        let prodField = targetSection.fields.find(f => f.name === 'producto_credito_descripcion');
        if (prodField) {
            prodField.config = prodField.config || {};
            prodField.config.dataSourceEntityId = prodCatalog.id;
            prodField.config.displayField = 'descripcion';
            prodField.config.valueField = 'identificacion';
            
            // WE NEED TO CHANGE THOSE COMBO BOXES TO TEXTBOXES SO THEY CAN DISPLAY CASCADED VALUES PROPERLY
            // Because if they are COMBO boxes and they don't have the exact options, they'll show blank!
            let t1 = targetSection.fields.find(f => f.name === 'producto_credito_pro_cre_plazo_minimo');
            if (t1) { t1.controlType = 'TEXTBOX'; t1.config = t1.config || {}; t1.config.readonly = true; }
            
            let t2 = targetSection.fields.find(f => f.name === 'producto_credito_pro_cre_plazo_maximo');
            if (t2) { t2.controlType = 'TEXTBOX'; t2.config = t2.config || {}; t2.config.readonly = true; }
            
            let t3 = targetSection.fields.find(f => f.name === 'producto_credito_pro_cre_monto_minimo');
            if (t3) { t3.controlType = 'TEXTBOX'; t3.config = t3.config || {}; t3.config.readonly = true; }
            
            let t4 = targetSection.fields.find(f => f.name === 'producto_credito_pro_cre_monto_maximo');
            if (t4) { t4.controlType = 'TEXTBOX'; t4.config = t4.config || {}; t4.config.readonly = true; }

            let t5 = targetSection.fields.find(f => f.name === 'producto_credito_pro_cre_tasa');
            if (t5) { t5.controlType = 'TEXTBOX'; t5.config = t5.config || {}; t5.config.readonly = true; }

            // Apply the cascade rules for ALL fields
            prodField.cascadeRules = [
                { sourceColumn: 'tasa', targetField: 'producto_credito_pro_cre_tasa' },
                { sourceColumn: 'plazo_minimo', targetField: 'producto_credito_pro_cre_plazo_minimo' },
                { sourceColumn: 'plazo_maximo', targetField: 'producto_credito_pro_cre_plazo_maximo' },
                { sourceColumn: 'monto_minimo', targetField: 'producto_credito_pro_cre_monto_minimo' },
                { sourceColumn: 'monto_maximo', targetField: 'producto_credito_pro_cre_monto_maximo' }
            ];
            console.log("Applied ALL cascade rules to Producto de crédito.");
        }

        screen.layoutJson = JSON.stringify(layout);

        console.log("Saving screen...");
        const result = await postJson('http://localhost:9090/api/v1/screens', screen);
        console.log("Screen saved successfully:", result.id);
    } catch (e) {
        console.error("Error:", e);
    }
}

fixAllCascades();
