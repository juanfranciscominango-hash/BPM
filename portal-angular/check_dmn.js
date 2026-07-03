const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT b.ID_, b.NAME_, length(b.BYTES_) as len FROM ACT_RE_DECISION_DEF d JOIN ACT_GE_BYTEARRAY b ON d.DEPLOYMENT_ID_ = b.DEPLOYMENT_ID_ WHERE d.KEY_ = 'matriz_aprobacion' AND b.NAME_ LIKE '%.dmn'");
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
