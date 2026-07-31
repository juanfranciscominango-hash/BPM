const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const res = await client.query("SELECT id, name, task_key, layout_json FROM SCREEN_DEFINITION;");
  
  res.rows.forEach(r => {
    if (r.layout_json && (r.layout_json.includes('Instrucción') || r.layout_json.includes('Aprobado'))) {
      console.log(`Found screen ID=${r.id}, Name=${r.name}, TaskKey=${r.task_key}`);
    }
  });
  
  await client.end();
}

main().catch(console.error);
