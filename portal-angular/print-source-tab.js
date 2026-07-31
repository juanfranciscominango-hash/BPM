const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  const res = await client.query("SELECT layout_json FROM SCREEN_DEFINITION WHERE id=30;");
  if (res.rows.length > 0) {
    const layout = JSON.parse(res.rows[0].layout_json);
    console.log("Tab labels found:");
    layout.tabs.forEach((t, i) => {
      console.log(`  index ${i}: label = "${t.label}"`);
    });
    const infoTab = layout.tabs[0]; // Let's just print the first tab!
    console.log("\nFirst tab JSON:");
    console.log(JSON.stringify(infoTab, null, 2));
  }
  
  await client.end();
}

main().catch(console.error);
