const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const res = await client.query("SELECT id, name, task_key, layout_json FROM SCREEN_DEFINITION;");
  
  res.rows.forEach(r => {
    if (!r.layout_json) return;
    try {
      const parsed = JSON.parse(r.layout_json);
      const tabLabels = parsed.tabs ? parsed.tabs.map(t => t.label || t.title) : [];
      console.log(`Screen ID=${r.id}, Name=${r.name}, TaskKey=${r.task_key}`);
      console.log(`  Tabs:`, tabLabels);
    } catch (e) {
      console.log(`Screen ID=${r.id}, Name=${r.name} has invalid JSON`);
    }
  });
  
  await client.end();
}

main().catch(console.error);
