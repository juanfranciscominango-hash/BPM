const { Client } = require('pg');
const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
c.connect().then(()=>c.query("SELECT bpmn_xml FROM process_definition WHERE key = 'flujo_de_credito_completo'"))
.then(r=>console.log(r.rows[0].bpmn_xml.includes('prueba')))
.then(()=>c.end())
.catch(console.error);
