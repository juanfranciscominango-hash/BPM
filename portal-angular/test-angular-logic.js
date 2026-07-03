const http = require('http');

const taskId = '3a46ee00-73ce-11f1-bb97-00155d998618';

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    // 1. Get tasks
    const tasks = await get('http://localhost:9091/api/v1/tasks');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return console.log('Task not found');
    console.log('Task found:', task.name, 'processDefId:', task.processDefinitionId);

    // 2. Get processes
    const procs = await get('http://localhost:9091/api/v1/processes');
    const taskKeyBase = task.processDefinitionId ? task.processDefinitionId.split(':')[0].trim().toLowerCase() : '';
    const procDef = procs.find(p => 
        String(p.id) === String(task.processDefinitionId) || 
        (p.key && p.key.trim().toLowerCase() === taskKeyBase) ||
        (p.procDefId && p.procDefId === task.processDefinitionId)
    );
    if (!procDef) return console.log('ProcDef not found. taskKeyBase:', taskKeyBase);
    console.log('ProcDef found:', procDef.key);

    // 3. Get screens
    const screens = await get('http://localhost:9091/api/v1/screens/process/' + procDef.key);
    if (!screens || screens.length === 0) return console.log('Screens empty');

    let screen = screens.find(s => s.taskKey === task.taskDefinitionKey);
    if (!screen) {
        screen = screens.find(s => s.taskKey === task.name);
    }
    
    if (screen && screen.layoutJson) {
        console.log('Screen resolved successfully!', screen.name);
        try {
            const layout = typeof screen.layoutJson === 'string' ? JSON.parse(screen.layoutJson) : screen.layoutJson;
            console.log('Layout tabs length:', layout.tabs ? layout.tabs.length : 'no tabs');
        } catch (e) {
            console.log('JSON parse failed', e);
        }
    } else {
        console.log('Screen NOT found or no layoutJson. screen obj:', screen);
    }
}
run();
