const { Client } = require('pg');
async function query() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id FROM screen_definition WHERE process_key = 'Flujo_Credito_Completo'");
  console.log('COUNT for Flujo_Credito_Completo:', res.rows.length);
  const res2 = await c.query("SELECT id FROM screen_definition WHERE process_key = 'flujo_de_credito_completo'");
  console.log('COUNT for flujo_de_credito_completo:', res2.rows.length);
  await c.end();
}
query().catch(console.error);
