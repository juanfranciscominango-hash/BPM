const http = require('http');

http.get('http://localhost:9090/api/v1/parametric/tables', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(JSON.stringify(JSON.parse(data), null, 2)));
});
