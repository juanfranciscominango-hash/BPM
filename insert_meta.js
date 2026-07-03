const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    let res = await c.query("SELECT id FROM meta_entity WHERE name = 'solicitud_credito'");
    let entityId;
    if (res.rows.length === 0) {
      res = await c.query("INSERT INTO meta_entity (name, label, description) VALUES ('solicitud_credito', 'Solicitud de Crédito', 'Tabla principal del flujo') RETURNING id");
      entityId = res.rows[0].id;
    } else {
      entityId = res.rows[0].id;
    }
    console.log('Entity ID:', entityId);
    
    // delete old attrs just in case
    await c.query("DELETE FROM meta_attribute WHERE entity_id = $1", [entityId]);
    
    // insert attrs
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'cliente_id', 'ID Cliente', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'monto', 'Monto Solicitado', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'plazo', 'Plazo (Meses)', 'NUMBER', true)", [entityId]);
    await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, 'estado', 'Estado', 'STRING', false)", [entityId]);

    console.log('Success');
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
