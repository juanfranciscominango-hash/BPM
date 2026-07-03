const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    // Check if it exists
    let exists = await c.query("SELECT id FROM meta_entity WHERE name = 'solicitud_credito_principal'");
    let entityId;
    if (exists.rows.length === 0) {
      const res = await c.query("INSERT INTO meta_entity (name, label, description) VALUES ('solicitud_credito_principal', 'Solicitud de Crédito Principal', 'Tabla virtual recomendada para manejar los datos core del crédito') RETURNING id");
      entityId = res.rows[0].id;
      console.log('Created entity with ID:', entityId);
      
      // Insert attributes
      const attrs = [
        {name: 'cliente_id', label: 'ID del Cliente (Relación)', type: 'NUMBER', required: true},
        {name: 'monto_solicitado', label: 'Monto Solicitado', type: 'NUMBER', required: true},
        {name: 'plazo_meses', label: 'Plazo en Meses', type: 'NUMBER', required: true},
        {name: 'tasa_interes', label: 'Tasa de Interés (%)', type: 'NUMBER', required: false},
        {name: 'estado_aprobacion', label: 'Estado de Aprobación', type: 'STRING', required: false}
      ];
      
      for (let a of attrs) {
        await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES (, , , , )", 
          [entityId, a.name, a.label, a.type, a.required]);
      }
      console.log('Attributes inserted');
    } else {
      console.log('Entity already exists with ID:', exists.rows[0].id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
