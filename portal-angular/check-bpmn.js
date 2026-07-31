const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const res = await client.query("SELECT id, key, name, length(bpmn_xml) as xml_len, status FROM PROCESS_DEFINITION;");
  console.log("Process definitions in database:");
  res.rows.forEach(r => {
    console.log(`  id=${r.id}, key="${r.key}", name="${r.name}", xml_len=${r.xml_len}, status="${r.status}"`);
  });
  await client.end();
}

main().catch(console.error);
