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
        
        // 1. Find Source Screen
        const sourceCandidate = screens.find(s => s.name === 'Pantalla Perfil y Condición');
        if (!sourceCandidate) {
            console.log("Could not find source screen");
            return;
        }

        const sourceLayout = JSON.parse(sourceCandidate.layoutJson);
        const sourceTab = sourceLayout.tabs.find(t => (t.name || t.label || t.title || '').toLowerCase().includes('condiciones de'));
        
        if (!sourceTab) {
            console.log("Could not find source tab 'Condiciones de credito' in the source screen.");
            return;
        }

        // Clone sections and set readOnly = true
        const clonedSections = JSON.parse(JSON.stringify(sourceTab.sections || []));
        clonedSections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    field.readOnly = true;
                });
            }
        });

        console.log(`Cloned ${clonedSections.length} sections from ${sourceCandidate.name}`);

        // 2. Find Target Screen
        const targetScreen = screens.find(s => s.name === 'Pantalla Analisis Credito');
        if (!targetScreen) {
            console.log("Could not find target screen: Pantalla Analisis Credito");
            return;
        }

        const targetLayout = JSON.parse(targetScreen.layoutJson);
        const targetTab = targetLayout.tabs.find(t => (t.name || t.label || t.title || '').toLowerCase().includes('condicio asesor'));

        if (!targetTab) {
            console.log("Could not find Target Tab in Analisis Credito");
            return;
        }

        // Paste cloned sections into target tab
        targetTab.sections = clonedSections;
        
        // Save back
        targetScreen.layoutJson = JSON.stringify(targetLayout);
        
        console.log("Saving Target Screen...");
        await saveScreen(targetScreen);
        console.log("Success! Tab cloned and set to readOnly.");

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
