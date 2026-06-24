const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    // Set screen 23 to Task_1_OLD so it's ignored
    await client.query("UPDATE screen_definition SET task_key = 'Task_1_OLD' WHERE id = 23");
    
    // Set screen 19 to Task_1 so it matches by key properly
    await client.query("UPDATE screen_definition SET task_key = 'Task_1' WHERE id = 19");
    
    console.log("Updated screen definitions.");
    client.end();
});
