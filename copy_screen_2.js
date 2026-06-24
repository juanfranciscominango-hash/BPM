const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect()
  .then(() => client.query("SELECT * FROM screen_definition WHERE name = 'Pantalla Simulación' AND process_key = 'flujo_credito'"))
  .then(res => {
    if (res.rows.length === 0) throw new Error("Pantalla no encontrada");
    const p = res.rows[0];
    return client.query(`
      INSERT INTO screen_definition (name, process_key, task_key, layout_json, is_default)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [p.name, 'Flujo_Credito_Completo', 'Task_1', p.layout_json, p.is_default]);
  })
  .then(res => {
    console.log("Pantalla enlazada a Flujo_Credito_Completo con ID:", res.rows[0].id);
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
