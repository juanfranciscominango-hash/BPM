const http = require('http');

const req = http.request('http://localhost:8080/api/v1/screens', { method: 'GET' }, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const screens = JSON.parse(data);
            const task2Screens = screens.filter(s => s.taskKey === 'Task_2');
            console.log(`Found ${task2Screens.length} Task_2 screens via API.`);
            
            task2Screens.forEach(screen => {
                let layout = typeof screen.layoutJson === 'string' ? JSON.parse(screen.layoutJson) : screen.layoutJson;
                let hasGrid = false;
                if (layout.tabs) {
                    layout.tabs.forEach(t => {
                        if (t.title === 'Revisión' || t.title === 'Revisión Requisitos') {
                            const section = t.sections.find(s => s.title === 'Lista de Requisitos');
                            if (section && section.fields.some(f => f.name === 'requisitos_array')) {
                                hasGrid = true;
                            }
                        }
                    });
                }
                console.log(`Screen ${screen.id} has grid: ${hasGrid}`);
            });
        } catch (e) {
            console.error(e);
        }
    });
});
req.on('error', console.error);
req.end();
