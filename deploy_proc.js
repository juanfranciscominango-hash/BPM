const http = require('http');

const req = http.request({
    hostname: 'localhost',
    port: 9091,
    path: '/api/v1/processes/5/deploy',
    method: 'POST'
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
