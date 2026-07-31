const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const res = await client.query("SELECT id, name, process_key, task_key FROM SCREEN_DEFINITION ORDER BY process_key, task_key;");
  console.log("Screens:");
  res.rows.forEach(r => {
    console.log(`  id=${r.id}, process=${r.process_key}, task=${r.task_key}, name=${r.name}`);
  });
  await client.end();
}

main().catch(console.error);
