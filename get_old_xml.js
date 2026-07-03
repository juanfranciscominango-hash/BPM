const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    // find process instance 
    // wait, the process definition is for task ce3e7650... 
    const res = await c.query("SELECT p.id_, p.version_, b.bytes_ FROM act_hi_taskinst t JOIN act_re_procdef p ON t.proc_def_id_ = p.id_ JOIN act_ge_bytearray b ON p.deployment_id_ = b.deployment_id_ AND p.resource_name_ = b.name_ WHERE t.id_ = 'ce3e7650-7596-11f1-8b7d-00155d998618'");
    if(res.rows.length > 0) {
      require('fs').writeFileSync('old_process.bpmn', res.rows[0].bytes_);
      console.log("Saved version", res.rows[0].version_);
    } else {
      console.log("Not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
