const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query('SELECT layout_json FROM screen_definition WHERE id = 19'))
  .then(res => { 
    const json = JSON.parse(res.rows[0].layout_json); 
    json.tabs.forEach((tab, i) => {
        tab.sections.forEach((sec, j) => {
            console.log(`Tab ${i} Sec ${j}:`, sec.name, "Label:", sec.label, "Rule:", sec.visibleIf);
        });
    });
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
