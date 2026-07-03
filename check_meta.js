const { Client } = require('pg');
async function test() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  let res = await c.query("SELECT * FROM meta_entity");
  console.log('Entities:', res.rows);
  res = await c.query("SELECT * FROM meta_attribute");
  console.log('Attributes:', res.rows);
  await c.end();
}
test();
