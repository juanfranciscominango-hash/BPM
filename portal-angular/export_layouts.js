const { Client } = require('pg'); 
const fs = require('fs');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432}); 
async function run() { 
    await client.connect(); 
    const res = await client.query("SELECT process_key, layout_json FROM screen_definition WHERE task_key = 'Activity_14xyo9t'"); 
    for(const r of res.rows) {
        fs.writeFileSync('layout_' + r.process_key + '.json', r.layout_json);
        console.log("Wrote layout for", r.process_key);
    }
    await client.end(); 
} 
run().catch(console.error);
