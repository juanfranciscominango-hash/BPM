const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT name, trama_type FROM trama_field WHERE process_id = (SELECT id FROM external_process WHERE code = 'APICLI') AND trama_type = 'OUTPUT'"))
  .then(res => { console.table(res.rows); client.end(); })
  .catch(e => { console.error(e); client.end(); });
