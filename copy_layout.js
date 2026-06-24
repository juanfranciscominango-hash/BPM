const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("UPDATE screen_definition SET layout_json = (SELECT layout_json FROM screen_definition WHERE id = 19) WHERE id = 22"))
  .then(() => { console.log("Layout updated!"); client.end(); })
  .catch(e => { console.error(e); client.end(); });
