const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
  await client.connect();
  
  const ingresosGrid = {
    name: "ingresos_array",
    label: "Ingresos",
    controlType: "GRID",
    cols: 12,
    config: {
      selectedColumns: [
        { name: "periodo", label: "Período", type: "string" },
        { name: "valorDeudor", label: "Ingresos Deudor ($)", type: "number" },
        { name: "valorConyuge", label: "Ingresos Cónyuge ($)", type: "number" },
        { name: "valorCodeudor", label: "Ingresos Codeudor ($)", type: "number" }
      ]
    },
    readOnly: true
  };

  const deudasGrid = {
    name: "deudas_array",
    label: "Deudas",
    controlType: "GRID",
    cols: 12,
    config: {
      selectedColumns: [
        { name: "propietario", label: "Propietario", type: "string" },
        { name: "tipoDeuda", label: "Tipo de Deuda", type: "string" },
        { name: "institucion", label: "Institución", type: "string" },
        { name: "cuota", label: "Cuota ($)", type: "number" }
      ]
    },
    readOnly: true
  };

  for (const id of [19, 22]) {
      const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = $1', [id]);
      if (res.rows.length > 0) {
          const json = JSON.parse(res.rows[0].layout_json); 
          let updated = false;
          
          if (json.tabs && json.tabs.length > 2 && json.tabs[2].sections && json.tabs[2].sections.length > 1) {
              const sec1 = json.tabs[2].sections[1];
              if (!sec1.fields.some(f => f.name === 'ingresos_array')) {
                  sec1.fields.push(ingresosGrid);
                  updated = true;
              }
              if (!sec1.fields.some(f => f.name === 'deudas_array')) {
                  sec1.fields.push(deudasGrid);
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
