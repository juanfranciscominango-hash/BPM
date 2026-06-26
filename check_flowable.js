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
  
  // check recent process instances
  let res = await client.query(`SELECT id_, proc_def_id_, start_time_, end_time_ FROM act_hi_procinst ORDER BY start_time_ DESC LIMIT 1`);
  console.log('--- Recent Process Instances ---');
  console.table(res.rows);
  
  if (res.rows.length > 0) {
    let procInstId = res.rows[0].id_;
    console.log('Variables for process instance:', procInstId);
    let varRes = await client.query(`SELECT name_, var_type_, double_, long_, text_ FROM act_hi_varinst WHERE proc_inst_id_ = $1`, [procInstId]);
    console.table(varRes.rows);
    
    // check completed tasks for this instance
    let taskRes = await client.query(`SELECT id_, name_, end_time_ FROM act_hi_taskinst WHERE proc_inst_id_ = $1`, [procInstId]);
    console.log('--- Tasks for process instance:', procInstId, '---');
    console.table(taskRes.rows);
  }

  await client.end();
}
run();
