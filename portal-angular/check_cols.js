const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});
client.connect().then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'process_definition'")).then(res => { console.table(res.rows); client.end();});
