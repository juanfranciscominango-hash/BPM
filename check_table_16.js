const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query('SELECT * FROM data_parametric WHERE table_id = 16'))
  .then(res => { 
    console.table(res.rows.map(r => ({ id: r.id, code: r.code, data: r.data_json })));
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
