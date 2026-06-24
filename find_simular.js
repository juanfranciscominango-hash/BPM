const http = require('http');

const API_URL = 'http://localhost:9091/api/v1/screens';

function fetchScreens() {
    return new Promise((resolve, reject) => {
        http.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    try {
        const screens = await fetchScreens();
        
        let simularButton = null;

        // Search for a BUTTON named "Simular" or with apiToExecute = 'cuota_francesa'
        for (const screen of screens) {
            if (!screen.layoutJson) continue;
            const layout = JSON.parse(screen.layoutJson);
            for (const tab of layout.tabs || []) {
                for (const section of tab.sections || []) {
                    for (const field of section.fields || []) {
                        if (field.controlType === 'BUTTON') {
                            console.log(`Found BUTTON in ${screen.name}: label=${field.label}, action=${field.config?.buttonAction}, api=${field.config?.apiToExecute}`);
                            if (field.label?.toLowerCase().includes('simular') || field.config?.apiToExecute === 'cuota_francesa' || field.config?.apiToExecute === 'CALCULAR_CUOTA') {
                                simularButton = field;
                            }
                        }
                    }
                }
            }
        }

        if (simularButton) {
            console.log("Found Simular Button Template:", JSON.stringify(simularButton, null, 2));
        } else {
            console.log("No Simular button found anywhere.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
