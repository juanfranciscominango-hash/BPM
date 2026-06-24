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
            console.log("Could not find target screen: Pantalla Analisis Credito");
            return;
        }

        const targetLayout = JSON.parse(targetScreen.layoutJson);
        
        // Find Source Tab "Condición Crédito Asesor"
        const sourceTab = targetLayout.tabs.find(t => {
            const n = (t.name || t.label || t.title || '').toLowerCase();
            return n.includes('asesor');
        });

        if (!sourceTab) {
            console.log("Could not find source Tab in Analisis Credito to clone.");
            return;
        }

        // Clone sections
        const clonedSections = JSON.parse(JSON.stringify(sourceTab.sections || []));
        
        // Make all fields editable
        clonedSections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    field.readOnly = false; // Make it editable
                });
            }
        });

        // Find Target Tab "Condición Crédito Análisis"
        const targetTabIdx = targetLayout.tabs.findIndex(t => {
            const n = (t.name || t.label || t.title || '').toLowerCase();
            return n.includes('análisis') || n.includes('analisis');
        });

        if (targetTabIdx !== -1) {
            targetLayout.tabs[targetTabIdx].sections = clonedSections;
            console.log("Pasted sections into existing 'Condición Crédito Análisis' tab.");
        } else {
            console.log("Target tab 'Condición Crédito Análisis' not found!");
            return;
        }
        
        // Save back
        targetScreen.layoutJson = JSON.stringify(targetLayout);
        
        console.log("Saving Target Screen...");
        await saveScreen(targetScreen);
        console.log("Success! Sections cloned to new tab as Editable.");

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
