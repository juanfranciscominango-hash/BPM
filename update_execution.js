const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("UPDATE act_ru_execution SET name_ = 'CASO010726144100' WHERE proc_inst_id_ = 'e5a4fc17-7559-11f1-8a62-00155d998618'"))
.then(r=>console.log(r.rowCount, 'executions updated'))
.then(()=>c.end())
.catch(console.error);
