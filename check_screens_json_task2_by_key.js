const fs = require('fs');

function run() {
    const screensFile = 'c:/ProyectosJava/BMP/screens.json';
    if (fs.existsSync(screensFile)) {
        let content = fs.readFileSync(screensFile, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.substring(1);
        }
        const data = JSON.parse(content);
        data.value.filter(s => s.taskKey === 'Task_2' || s.task_key === 'Task_2').forEach(s => {
            console.log(`Screen ID: ${s.id}, Name: ${s.name}, taskKey: ${s.taskKey}`);
            let json = typeof s.layoutJson === 'string' ? JSON.parse(s.layoutJson) : s.layoutJson;
            console.log("Tabs:", json.tabs ? json.tabs.map(t => t.title) : 'none');
            if (json.tabs) {
                json.tabs.forEach(t => {
                    console.log(`  Tab ${t.title} sections:`, t.sections ? t.sections.map(sec => sec.title) : 'none');
                });
            }
        });
    }
}
run();
