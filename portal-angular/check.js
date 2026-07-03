const { Client } = require('pg'); 
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432}); 
async function run() { 
    await client.connect(); 
    const res = await client.query("SELECT task_key, process_key, name FROM screen_definition WHERE task_key = 'Activity_14xyo9t'"); 
    console.log(res.rows); 
    await client.end(); 
} 
run().catch(console.error);
