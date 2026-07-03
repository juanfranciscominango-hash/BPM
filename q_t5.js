const { Client } = require('pg');
async function query() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id, name, layout_json FROM screen_definition WHERE task_key = 'Activity_16c6t1t'");
  if (res.rows.length > 0) {
      console.log('ID:', res.rows[0].id);
      const fs = require('fs');
      fs.writeFileSync('layout_task5.json', res.rows[0].layout_json || '{}');
      console.log('Saved to layout_task5.json');
  } else {
      console.log('No screen found');
  }
  await c.end();
}
query().catch(console.error);
