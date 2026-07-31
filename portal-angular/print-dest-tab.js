const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  const res = await client.query("SELECT layout_json FROM SCREEN_DEFINITION WHERE id=33;");
  if (res.rows.length > 0) {
    console.log(JSON.stringify(JSON.parse(res.rows[0].layout_json), null, 2));
  }
  
  await client.end();
}

main().catch(console.error);
