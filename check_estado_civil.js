const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT * FROM parametric_data WHERE table_id = (SELECT id FROM parametric_table WHERE name ILIKE '%estado%civil%')"))
  .then(res => { console.table(res.rows); client.end(); })
  .catch(e => { console.error(e); client.end(); });
