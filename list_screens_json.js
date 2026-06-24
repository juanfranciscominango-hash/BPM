const fs = require('fs');

function run() {
    const screensFile = 'c:/ProyectosJava/BMP/screens.json';
    if (fs.existsSync(screensFile)) {
        let content = fs.readFileSync(screensFile, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.substring(1);
        }
        const data = JSON.parse(content);
        data.value.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}, taskKey: ${s.taskKey}`);
        });
    }
}
run();
