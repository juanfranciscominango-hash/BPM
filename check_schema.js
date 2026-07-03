const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect()
.then(()=>c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pr_flujo' AND column_name = 'id'"))
.then(r=>console.log('pr_flujo.id:', r.rows[0].data_type))
.then(()=>c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pr_paranmetros_generales' AND column_name = 'flujo'"))
.then(r=>console.log('pr_paranmetros_generales.flujo:', r.rows[0].data_type))
.then(()=>c.end())
.catch(console.error);
