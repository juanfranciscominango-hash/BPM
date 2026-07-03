const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    const res = await c.query("SELECT proc_def_id_ FROM act_ru_task WHERE id_ = 'ce3e7650-7596-11f1-8b7d-00155d998618'");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
