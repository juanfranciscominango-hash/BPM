const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  console.log("Executing ALTER TABLE to add 'category' column to FORMULA_DEFINITION...");
  await client.query("ALTER TABLE FORMULA_DEFINITION ADD COLUMN IF NOT EXISTS category VARCHAR(255);");
  console.log("Successfully updated database schema.");
  
  await client.end();
}

main().catch(console.error);
