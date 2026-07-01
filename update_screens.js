const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("UPDATE screen_definition SET process_key = 'flujo_de_credito_completo' WHERE process_key = 'Flujo_Credito_Completo'"))
.then(r=>console.log(r.rowCount, 'screens updated'))
.then(()=>c.end())
.catch(console.error);
