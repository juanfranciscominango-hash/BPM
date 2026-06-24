const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
  await client.connect();
  
  for (const id of [19, 22]) {
      const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = $1', [id]);
      if (res.rows.length > 0) {
          const json = JSON.parse(res.rows[0].layout_json); 
          let updated = false;
          
          if (json.tabs && json.tabs.length > 2 && json.tabs[2].sections && json.tabs[2].sections.length > 1) {
              const sec1 = json.tabs[2].sections[1];
              
              const ingresos = sec1.fields.find(f => f.name === 'ingresos_array');
              if (ingresos) {
                  ingresos.readOnly = false;
                  const periodoCol = ingresos.config.selectedColumns.find(c => c.name === 'periodo');
                  if (periodoCol) periodoCol.type = 'combo';
                  updated = true;
              }
              
              const deudas = sec1.fields.find(f => f.name === 'deudas_array');
              if (deudas) {
                  deudas.readOnly = false;
                  const propietarioCol = deudas.config.selectedColumns.find(c => c.name === 'propietario');
                  if (propietarioCol) propietarioCol.type = 'combo';
                  
                  const tipoDeudaCol = deudas.config.selectedColumns.find(c => c.name === 'tipoDeuda');
                  if (tipoDeudaCol) tipoDeudaCol.type = 'combo';
                  
                  updated = true;
              }
          }
          
          if (updated) {
              await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(json), id]);
              console.log('Updated ID', id);
          }
      }
  }
  await client.end();
}

run().catch(console.error);
