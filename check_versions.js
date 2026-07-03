const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    const res = await c.query("SELECT p.id_, p.version_ FROM act_re_procdef p WHERE p.name_ ILIKE '%crédito%' OR p.key_ ILIKE '%credito%' ORDER BY p.version_ DESC");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
