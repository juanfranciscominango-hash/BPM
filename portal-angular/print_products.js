const http = require('http');

http.get('http://localhost:9091/api/v1/parametric/tables/16/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            let products = JSON.parse(data);
            console.log('PRODUCTS KEYS:', Object.keys(products[0] || {}));
            console.log('VIP PRODUCT DATA:', products[0]);
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data received:', data);
        }
    });
}).on('error', (err) => {
    console.error('HTTP Request error:', err.message);
});
