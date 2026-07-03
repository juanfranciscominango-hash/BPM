const { Client } = require('pg');
async function query() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT DISTINCT proc_def_id_ FROM act_ru_task");
  console.log(res.rows);
  await c.end();
}
query().catch(console.error);
