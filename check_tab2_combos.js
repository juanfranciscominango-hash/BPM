const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query('SELECT layout_json FROM screen_definition WHERE id = 19'))
  .then(res => { 
    const json = JSON.parse(res.rows[0].layout_json); 
    json.tabs[2].sections.forEach(sec => {
        sec.fields.forEach(f => {
            if (f.name === 'tipo_credito' || f.name === 'producto_credito') {
                console.log(f.name, JSON.stringify(f.config, null, 2));
            }
        });
    });
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
