const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query('SELECT layout_json FROM screen_definition WHERE id = 19'))
  .then(res => { 
    const json = JSON.parse(res.rows[0].layout_json); 
    let rule = 'Not found';
    json.tabs.forEach(tab => {
        tab.sections.forEach(sec => {
            if (sec.name === 'Cónyuge del Deudor' || sec.label === 'Cónyuge del Deudor') {
                rule = sec.visibleIf;
            }
        });
    });
    console.log("Visible rule:", rule); 
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
