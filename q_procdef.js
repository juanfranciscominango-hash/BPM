const { Client } = require('pg');
async function query() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id_, key_, name_ FROM act_re_procdef WHERE id_ = 'Flujo_Credito_Completo:20:80ccd1ee-7556-11f1-93fa-00155d998618'");
  console.log(res.rows);
  await c.end();
}
query().catch(console.error);
