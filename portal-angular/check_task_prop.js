const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT ID_, NAME_, TASK_DEF_KEY_, PROC_DEF_ID_ FROM ACT_RU_TASK WHERE ID_ = 'f34237fd-73d4-11f1-bb97-00155d998618'");
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
