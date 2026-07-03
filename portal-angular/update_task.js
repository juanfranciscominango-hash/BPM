const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        await client.query("UPDATE act_ru_task SET name_ = '5. Registrar Instrucciones Operativas' WHERE task_def_key_ = 'Activity_16c6t1t'");
        console.log("Updated task name.");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
