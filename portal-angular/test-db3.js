const http = require('http');

http.get('http://localhost:9090/api/v1/screens', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        let screens = JSON.parse(data);
        let screen = screens.find(s => s.processKey === 'flujo_credito' && s.taskKey === 'Simulación');
        let layout = JSON.parse(screen.layoutJson);
        for (let tab of layout.tabs) {
            for (let section of tab.sections) {
                for (let field of section.fields) {
                    if (field.name === 'gridIngresos') {
                        console.log(JSON.stringify(field.config.selectedColumns, null, 2));
                    }
                }
            }
        }
    });
});
