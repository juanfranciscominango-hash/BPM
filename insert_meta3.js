const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    let res = await c.query("SELECT id FROM meta_entity WHERE name = 'solicitud_credito_recomendada'");
    let entityId = res.rows[0].id;
    console.log('Using Entity ID:', entityId);
    
    // delete old attrs
    await c.query("DELETE FROM meta_attribute WHERE entity_id = $1", [entityId]);
    
    const fields = [
      { name: 'cliente_id', label: 'ID Cliente', type: 'NUMBER', required: true },
      { name: 'monto_solicitado', label: 'Monto Solicitado', type: 'NUMBER', required: true },
      { name: 'plazo_meses', label: 'Plazo (Meses)', type: 'NUMBER', required: true },
      { name: 'tasa_interes', label: 'Tasa Interés (%)', type: 'NUMBER', required: false },
      { name: 'cuota_estimada', label: 'Cuota Estimada', type: 'NUMBER', required: false },
      { name: 'ingresos_totales', label: 'Ingresos Totales', type: 'NUMBER', required: false },
      { name: 'gastos_totales', label: 'Gastos Totales', type: 'NUMBER', required: false },
      { name: 'score_buro', label: 'Score Buró', type: 'NUMBER', required: false },
      { name: 'datos_garantias', label: 'Datos Garantías (JSON)', type: 'STRING', required: false },
      { name: 'datos_referencias', label: 'Referencias Personales (JSON)', type: 'STRING', required: false },
      { name: 'resolucion_comite', label: 'Resolución Comité', type: 'STRING', required: false },
      { name: 'observaciones_generales', label: 'Observaciones Generales', type: 'STRING', required: false },
      { name: 'oficial_credito', label: 'Oficial de Crédito', type: 'STRING', required: false },
      { name: 'agencia_origen', label: 'Agencia Origen', type: 'STRING', required: false },
      { name: 'estado_aprobacion', label: 'Estado Aprobación', type: 'STRING', required: false }
    ];

    for (let f of fields) {
      await c.query("INSERT INTO meta_attribute (entity_id, name, label, type, required) VALUES ($1, $2, $3, $4, $5)", 
        [entityId, f.name, f.label, f.type, f.required]);
    }

    console.log('Successfully inserted 15 optimized fields.');
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
