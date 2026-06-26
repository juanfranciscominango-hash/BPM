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
  let res = await client.query(`SELECT proc_def_id_ FROM act_hi_procinst WHERE id_ = 'be6a7031-7005-11f1-bcdf-00155d998618'`);
  console.log(res.rows);
  await client.end();
}
run();
