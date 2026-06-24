const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });
client.connect()
  .then(() => client.query(`INSERT INTO sec_menu (id, active, icon, permission_code, route, sort_order, title, parent_id) SELECT '18', true, 'bi bi-calculator', null, '/plataforma/formulas', 14, 'Módulo de Fórmulas', id FROM sec_menu WHERE title = 'Plataforma' AND NOT EXISTS (SELECT 1 FROM sec_menu WHERE route = '/plataforma/formulas') LIMIT 1;`))
  .then(res => { console.log('Inserted:', res.rowCount); client.end(); })
  .catch(e => { console.error(e); client.end(); });
