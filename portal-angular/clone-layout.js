const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  // 1. Get layout_json of screen ID 30
  const res30 = await client.query("SELECT layout_json FROM SCREEN_DEFINITION WHERE id=30;");
  if (res30.rows.length === 0) {
    throw new Error("Source screen ID 30 not found");
  }
  
  const layout30 = JSON.parse(res30.rows[0].layout_json);
  const infoTab = layout30.tabs[0]; // The first tab is "Información"
  
  // 2. Get layout_json of screen ID 33
  const res33 = await client.query("SELECT layout_json FROM SCREEN_DEFINITION WHERE id=33;");
  if (res33.rows.length === 0) {
    throw new Error("Destination screen ID 33 not found");
  }
  
  const layout33 = JSON.parse(res33.rows[0].layout_json);
  
  // 3. Replace the tabs of screen 33 with a new array containing the cloned tab
  layout33.tabs = [ infoTab ];
  
  // 4. Update the destination screen in the database
  const updatedJson = JSON.stringify(layout33);
  await client.query("UPDATE SCREEN_DEFINITION SET layout_json=$1 WHERE id=33;", [updatedJson]);
  
  console.log("Successfully cloned 'Información' tab from screen 30 to screen 33.");
  
  await client.end();
}

main().catch(console.error);
