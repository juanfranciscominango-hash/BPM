const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    const res = await c.query("SELECT b.bytes_ FROM act_re_procdef p JOIN act_ge_bytearray b ON p.deployment_id_ = b.deployment_id_ AND p.resource_name_ = b.name_ WHERE p.name_ ILIKE '%crédito%' OR p.key_ ILIKE '%credito%' ORDER BY p.version_ DESC LIMIT 1");
    if(res.rows.length > 0) {
      console.log(res.rows[0].bytes_.toString('utf8').substring(0, 500) + '...');
      require('fs').writeFileSync('process_credito.bpmn20.xml', res.rows[0].bytes_);
    } else {
      console.log("No process found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
