const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT ID_, NAME_, TASK_DEF_KEY_ FROM ACT_RU_TASK WHERE NAME_ LIKE '%Validar Consideraciones (asesor)%'");
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
