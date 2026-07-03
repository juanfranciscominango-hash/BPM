const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        await client.query("UPDATE ACT_RU_TASK SET NAME_ = '4.1 Validar Consideraciones (asesor)' WHERE ID_ = '5d787a76-73fe-11f1-a007-00155d998618'");
        console.log("Updated task name!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
