const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect()
.then(()=>c.query("SELECT p.descripcion FROM pr_paranmetros_generales p JOIN pr_flujo f ON CAST(p.flujo AS INTEGER) = f.id WHERE LOWER(f.descripcion) = LOWER('Flujo de Crédito')"))
.then(r=>console.log(r.rows))
.then(()=>c.end())
.catch(console.error);
