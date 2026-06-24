const http = require('http');
http.get('http://localhost:9091/api/v1/screens', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const screens = JSON.parse(data);
            const screen24 = screens.find(s => s.id === 24);
            const fs = require('fs');
            fs.writeFileSync('screen24_api_dump.json', typeof screen24.layoutJson === 'string' ? screen24.layoutJson : JSON.stringify(screen24.layoutJson, null, 2));
            console.log("Dumped to screen24_api_dump.json");
        } catch(e) { console.error(e); }
    });
});
