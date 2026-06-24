const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT id, name, process_key, task_key, length(layout_json) as size, is_default FROM screen_definition ORDER BY id ASC"))
  .then(res => { console.table(res.rows); client.end(); })
  .catch(e => { console.error(e); client.end(); });
