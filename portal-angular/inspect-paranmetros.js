const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  const res = await client.query("SELECT * FROM pr_paranmetros_generales;");
  console.log("pr_paranmetros_generales rows:");
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
