const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
  await client.connect();
  
  for (const id of [19, 22]) {
      const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = $1', [id]);
      if (res.rows.length > 0) {
          const json = JSON.parse(res.rows[0].layout_json); 
          let updated = false;
          json.tabs.forEach(tab => {
              tab.sections.forEach(sec => {
                  if (sec.title === 'Cónyuge del Codeudor') {
                      sec.visibleIf = "typeof requiere_codeudor !== 'undefined' && (requiere_codeudor === true || requiere_codeudor === 'true' || requiere_codeudor === 'SI' || requiere_codeudor === 'S') && typeof codeudor_estado_civil !== 'undefined' && codeudor_estado_civil && (codeudor_estado_civil.toUpperCase() === 'CASADO' || codeudor_estado_civil.toUpperCase() === 'UNION LIBRE')";
                      updated = true;
                  }
              });
          });
          
          if (updated) {
              await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(json), id]);
              console.log('Updated ID', id);
          }
      }
  }
  await client.end();
}

run().catch(console.error);
