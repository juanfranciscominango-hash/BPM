const { Client } = require('pg');
async function test() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id, task_key, length(task_key) as len FROM screen_definition WHERE id = 30");
  console.log(res.rows);
  await c.end();
}
test();
