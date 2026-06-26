const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'INC_BPM_PLATFORM',
  password: 'Desarrollo',
  port: 5432,
});

async function run() {
  await client.connect();
  let res = await client.query(`SELECT p.descripcion FROM pr_paranmetros_generales p JOIN pr_flujo f ON p.flujo = f.id WHERE f.descripcion = 'Flujo de Crédito'`);
  console.log('Result:', res.rows);
  let res2 = await client.query(`SELECT * FROM pr_paranmetros_generales`);
  console.log('All parameters:', res2.rows);
  await client.end();
}
run();
