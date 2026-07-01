const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("SELECT tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 'pr_%'"))
.then(r=>console.log(r.rows))
.then(()=>c.end())
.catch(console.error);
