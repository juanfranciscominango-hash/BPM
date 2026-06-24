const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query('SELECT layout_json FROM screen_definition WHERE id = 19'))
  .then(res => { 
    const json = JSON.parse(res.rows[0].layout_json); 
    const section = json.tabs[1].sections.find(s => s.name === 'Cónyuge del Deudor' || s.label === 'Cónyuge del Deudor');
    console.log("Visible rule:", section ? section.visibleIf : 'Section not found'); 
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
