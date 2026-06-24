const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT layout_json FROM screen_definition WHERE id = 23"))
  .then(res => { 
    try {
      const parsed = JSON.parse(res.rows[0].layout_json);
      console.log("JSON parsed successfully! Keys:", Object.keys(parsed));
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
    }
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
