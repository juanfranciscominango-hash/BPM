const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT layout_json FROM screen_definition WHERE id = 19"))
  .then(res => { console.log(JSON.stringify(res.rows[0].layout_json, null, 2)); client.end(); })
  .catch(e => { console.error(e); client.end(); });
