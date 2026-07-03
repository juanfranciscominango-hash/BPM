const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("UPDATE sec_user SET username = 'admin@chibuleo.com' WHERE username = 'admin@innovacred.com'"))
.then(r=>console.log(r.rowCount, 'users updated'))
.then(()=>c.end())
.catch(console.error);
