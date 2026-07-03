const { Client } = require('pg');
async function fix() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("UPDATE screen_definition SET process_key = 'Flujo_Credito_Completo' WHERE process_key = 'flujo_de_credito_completo'");
  console.log("UPDATED:", res.rowCount);
  await c.end();
}
fix().catch(console.error);
