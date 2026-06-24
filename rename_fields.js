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

function saveScreen(screen) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(screen);
        const options = {
            hostname: 'localhost',
            port: 9091,
            path: '/api/v1/screens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => resolve(JSON.parse(resData)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log("Fetching screens...");
        const screens = await fetchScreens();
        
        // Find Target Screen
        const targetScreen = screens.find(s => s.name === 'Pantalla Analisis Credito');
        if (!targetScreen) {
            console.log("Could not find target screen");
            return;
        }

        const targetLayout = JSON.parse(targetScreen.layoutJson);
        
        // Find Target Tab "Condición Crédito Análisis"
        const targetTabIdx = targetLayout.tabs.findIndex(t => {
            const n = (t.name || t.label || t.title || '').toLowerCase();
            return n.includes('análisis') || n.includes('analisis');
        });

        if (targetTabIdx !== -1) {
            const tab = targetLayout.tabs[targetTabIdx];
            let modifiedCount = 0;

            // Iterate over all sections and fields
            tab.sections.forEach(section => {
                if (section.fields) {
                    section.fields.forEach(field => {
                        // Append _analisis if not already appended
                        if (field.name && !field.name.endsWith('_analisis')) {
                            field.name = field.name + '_analisis';
                            modifiedCount++;
                        }
                    });
                }
            });
            
            console.log(`Renamed ${modifiedCount} fields to have '_analisis' suffix.`);
        } else {
            console.log("Target tab 'Condición Crédito Análisis' not found!");
            return;
        }
        
        // Save back
        targetScreen.layoutJson = JSON.stringify(targetLayout);
        
        console.log("Saving Target Screen...");
        await saveScreen(targetScreen);
        console.log("Success! Fields are now new and independent.");

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
