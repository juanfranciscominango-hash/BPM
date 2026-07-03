const { Client } = require('pg');

async function fix() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  
  const fs = require('fs');
  const layout = JSON.parse(fs.readFileSync('layout32_updated.json'));
  
  const sql = "UPDATE screen_definition SET layout_json = '" + JSON.stringify(layout).replace(/'/g, "''") + "' WHERE id = 32";
  await c.query(sql);
  console.log("SUCCESS UPDATE");
  
  await c.end();
}
fix().catch(console.error);
