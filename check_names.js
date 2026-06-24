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
        const targetScreen = screens.find(s => s.name === 'Pantalla Analisis Credito');
        const targetLayout = JSON.parse(targetScreen.layoutJson);
        const tab = targetLayout.tabs.find(t => (t.name || t.label || t.title || '').toLowerCase().includes('asesor'));

        tab.sections.forEach(sec => {
            sec.fields.forEach(f => {
                console.log(`Label: ${f.label}, Name: ${f.name}, Type: ${f.controlType}`);
            });
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
