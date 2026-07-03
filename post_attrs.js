const http = require('http');

const attrs = [
  {entity: {id: 18}, name: 'cliente_id', label: 'ID del Cliente (Relación)', type: 'NUMBER', required: true},
  {entity: {id: 18}, name: 'monto_solicitado', label: 'Monto Solicitado', type: 'NUMBER', required: true},
  {entity: {id: 18}, name: 'plazo_meses', label: 'Plazo en Meses', type: 'NUMBER', required: true},
  {entity: {id: 18}, name: 'tasa_interes', label: 'Tasa de Interés (%)', type: 'NUMBER', required: false},
  {entity: {id: 18}, name: 'estado_aprobacion', label: 'Estado de Aprobación', type: 'STRING', required: false}
];

attrs.forEach(attr => {
  const data = JSON.stringify(attr);
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/meta/attributes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', d => {
      process.stdout.write(d);
    });
  });

  req.on('error', error => {
    console.error(error);
  });

  req.write(data);
  req.end();
});
