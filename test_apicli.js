const http = require('http');

const data = JSON.stringify({ interviniente_int_identificacion: "1700000007", DocumentNumber: "1700000007" });

const options = {
  hostname: 'localhost',
  port: 9091,
  path: '/api/v1/api-manager/test/APICLI',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
