const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    let res = await c.query("INSERT INTO meta_entity (name, label, description) VALUES ('solicitud_credito_recomendada', 'Solicitud de Crédito (Recomendada)', 'Tabla virtual normalizada para datos base del crédito') RETURNING id");
    let entityId = res.rows[0].id;
    
    // insert attrs
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'cliente_id', 'ID Cliente', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'monto', 'Monto Solicitado', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'plazo', 'Plazo (Meses)', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'estado', 'Estado Aprobación', 'STRING', false)", [entityId]);

    console.log('Success, created with ID:', entityId);
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
