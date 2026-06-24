const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
  await client.connect();
  
  const sectionInformacion = {
    title: "Información",
    columns: 3,
    fields: [
      { name: "fecha_caso", label: "Fecha Caso", controlType: "TEXTBOX", readOnly: true },
      { name: "numero_caso", label: "Número Caso", controlType: "TEXTBOX", readOnly: true },
      { name: "ciudad", label: "Ciudad", controlType: "TEXTBOX", readOnly: true },
      
      { name: "agencia", label: "Agencia", controlType: "TEXTBOX", readOnly: true },
      { name: "asesor", label: "Asesor", controlType: "TEXTBOX", readOnly: true },
      { name: "fecha_solicitud", label: "Fecha Solicitud", controlType: "TEXTBOX", readOnly: true },
      
      { name: "subsegmento", label: "Subsegmento", controlType: "TEXTBOX", readOnly: true },
      { name: "producto_desc", label: "Producto", controlType: "TEXTBOX", readOnly: true },
      { name: "destino_comercial", label: "Destino Comercial", controlType: "TEXTBOX", readOnly: true },
      
      { name: "interviniente_int_identificacion", label: "Identificación", controlType: "TEXTBOX", readOnly: true },
      { name: "monto_solicitado", label: "Monto Solicitado", controlType: "MONEY", readOnly: true },
      { name: "plazo_meses", label: "Plazo Solicitado", controlType: "NUMBER", readOnly: true },
      
      { name: "interviniente_int_nombres_completos", label: "Solicitante", controlType: "TEXTBOX", readOnly: true },
      { name: "monto_aprobado", label: "Monto Aprobado", controlType: "MONEY", readOnly: true },
      { name: "plazo_aprobado", label: "Plazo Aprobado", controlType: "NUMBER", readOnly: true },
      
      { name: "espacio_1", label: " ", controlType: "LABEL", readOnly: true },
      { name: "cuota_entrada", label: "Cuota de Entrada", controlType: "MONEY", readOnly: true },
      { name: "espacio_2", label: " ", controlType: "LABEL", readOnly: true }
    ]
  };

  for (const id of [20, 24]) {
      const res = await client.query('SELECT layout_json FROM screen_definition WHERE id = $1', [id]);
      if (res.rows.length > 0) {
          const json = JSON.parse(res.rows[0].layout_json); 
          
          if (!json.tabs || json.tabs.length === 0) {
              json.tabs = [{ title: "Revisión", sections: [] }];
          } else {
              json.tabs[0].title = "Revisión";
          }
          
          // Clear existing sections in Tab 0 and add our new section
          json.tabs[0].sections = [sectionInformacion];
          
          await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [JSON.stringify(json), id]);
          console.log('Updated ID', id);
      }
  }
  await client.end();
}

run().catch(console.error);
