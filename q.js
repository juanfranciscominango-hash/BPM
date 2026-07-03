const { Client } = require('pg');
async function query() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id, name, layout_json FROM screen_definition WHERE task_key = 'Activity_16c6t1t'");
  console.log(res.rows);
  await c.end();
}
query().catch(console.error);
