const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("SELECT key, name FROM process_definition"))
.then(r=>console.log(r.rows))
.then(()=>c.end())
.catch(console.error);
