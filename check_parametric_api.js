const http = require('http');

http.get('http://localhost:9091/api/v1/parametric/tables', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const tables = JSON.parse(data);
            const reqTable = tables.find(t => t.name === 'requisitos');
            console.log("Found table 'requisitos'?", !!reqTable, reqTable);
            
            if (reqTable) {
                http.get('http://localhost:9091/api/v1/parametric/tables/' + reqTable.id + '/data', (res2) => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => {
                        console.log("Data in 'requisitos':", JSON.parse(data2));
                    });
                });
            }
        } catch(e) {
            console.error(e);
        }
    });
});
