const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const ep = await client.query("SELECT * FROM EXTERNAL_PROCESS WHERE code='APICREDITO';");
  console.log('Process:', ep.rows);
  if (ep.rows.length > 0) {
    const tr = await client.query("SELECT * FROM TRAMA_FIELD WHERE process_id=" + ep.rows[0].id + ";");
    console.log('Tramas:');
    tr.rows.forEach(r => {
      console.log(`  id=${r.id}, parent=${r.parent_id}, name=${r.name}, map=${r.mapped_variable}, type=${r.trama_type}`);
    });
  }
  await client.end();
}

main().catch(console.error);
