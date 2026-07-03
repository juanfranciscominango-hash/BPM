const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    let res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dy_solicitud_credito_recomendada'");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
