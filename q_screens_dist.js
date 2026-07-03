const { Client } = require('pg');
async function test() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT DISTINCT process_key FROM screen_definition");
  console.log(res.rows);
  await c.end();
}
test();
