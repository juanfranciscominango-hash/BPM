const { Client } = require('pg');

async function watch() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  console.log("Monitoring database sec_user sessions. Press Ctrl+C to stop.");
  
  let lastState = {};
  
  while (true) {
    try {
      const res = await client.query("SELECT username, current_session_id FROM sec_user ORDER BY username;");
      let changed = false;
      const newState = {};
      res.rows.forEach(r => {
        newState[r.username] = r.current_session_id;
        if (lastState[r.username] !== r.current_session_id) {
          changed = true;
        }
      });
      
      if (changed) {
        console.log(new Date().toLocaleTimeString(), "Session change detected:");
        res.rows.forEach(r => {
          console.log(`  ${r.username}: ${r.current_session_id}`);
        });
        lastState = newState;
      }
    } catch (e) {
      console.error("Query error:", e.message);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

watch().catch(console.error);
