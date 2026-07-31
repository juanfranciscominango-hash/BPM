const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  // Let's check tables starting with 'pr_param' or similar
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_name LIKE '%param%';
  `);
  console.log("Parametric tables in DB:", tablesRes.rows);

  for (let t of tablesRes.rows) {
    try {
      const res = await client.query(`SELECT * FROM ${t.table_name};`);
      console.log(`\nTable ${t.table_name} content:`, res.rows);
    } catch(e) {
      console.error(`Error querying ${t.table_name}:`, e.message);
    }
  }

  await client.end();
}

main().catch(console.error);
