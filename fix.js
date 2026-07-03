const { Client } = require('pg');

async function fix() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  const res = await c.query("SELECT id, layout_json FROM screen_definition WHERE id = 31");
  let layoutStr = res.rows[0].layout_json;
  let layout = JSON.parse(layoutStr);
  
  let genOpSection = layout.tabs.find(t => t.title === 'Generar operación').sections[0];
  
  if (!genOpSection.fields.some(f => f.name === 'operacionId')) {
    genOpSection.fields.push({
      name: 'operacionId',
      label: 'Número de Operación',
      controlType: 'TEXTBOX',
      cols: '4',
      readOnly: true
    });
    genOpSection.fields.push({
      name: 'montoAprobado',
      label: 'Monto a Desembolsar',
      controlType: 'MONEY',
      cols: '4',
      readOnly: true
    });
    
    await c.query("UPDATE screen_definition SET layout_json = ::text WHERE id = 31", [JSON.stringify(layout)]);
    console.log("SUCCESS");
  } else {
    console.log("ALREADY FIXED");
  }
  
  await c.end();
}
fix().catch(console.error);
