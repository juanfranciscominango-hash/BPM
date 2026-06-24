const http = require('http');

http.get('http://localhost:9090/api/v1/parametric/tables/16/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
});
